// ENGINE - Agent router and synthesis layer
// Coordinates between agents and handles LLM communication

const strategist = require('./strategist');
const maker = require('./maker');
const market = require('./market');
const systems = require('./systems');
const ollama = require('../llm/ollama');

// Agent registry
const agents = {
  strategist,
  maker,
  market,
  systems
};

// Engine prompt for synthesis
const ENGINE_PROMPT = `You are the MIND Engine - the coordinator of multiple specialized agents.

Your role is to:
1. Route user messages to the appropriate agent(s)
2. Synthesize responses from multiple agents when needed
3. Maintain context across the conversation
4. Ensure coherent, helpful responses

Available agents:
- @strategist - Strategic thinking, vision, long-term planning
- @maker - Building, coding, creating deliverables  
- @market - Business strategy, users, market analysis
- @systems - Operations, processes, workflow optimization

When a user mentions an agent with @, route to that agent.
When no agent is specified, determine the best agent based on the query.
For complex queries, you may consult multiple agents and synthesize their input.

Always be helpful, clear, and action-oriented.`;

class Engine {
  constructor() {
    this.agents = agents;
    this.conversationHistory = new Map(); // sessionId -> messages
  }

  listAgents() {
    return Object.values(agents).map(a => ({
      name: a.name,
      displayName: a.displayName,
      description: a.description,
      color: a.color,
      icon: a.icon,
      capabilities: a.capabilities
    }));
  }

  // Parse @mentions from message
  parseMentions(message) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(message)) !== null) {
      if (agents[match[1]]) {
        mentions.push(match[1]);
      }
    }
    return mentions;
  }

  // Determine which agent should handle the message
  async route(message, context = {}) {
    const mentions = this.parseMentions(message);
    
    if (mentions.length > 0) {
      // Use mentioned agent(s)
      return mentions.map(m => agents[m]).filter(Boolean);
    }

    // Auto-route based on message content
    const routingPrompt = `Analyze this message and determine which agent(s) should respond:
"""${message}"""

Available agents:
- strategist: strategy, planning, vision, analysis
- maker: coding, building, creating, implementation
- market: business, users, marketing, competition
- systems: processes, workflows, operations, documentation

Respond with ONLY the agent name(s), comma-separated. If multiple, list in order of relevance.`;

    try {
      const response = await ollama.generate(routingPrompt, { 
        model: context.model || 'llama3.2:1b',
        temperature: 0.3
      });
      
      const suggestedAgents = response.toLowerCase()
        .split(/[,\s]+/)
        .map(s => s.trim())
        .filter(s => agents[s]);
      
      return suggestedAgents.length > 0 
        ? suggestedAgents.map(name => agents[name])
        : [agents.strategist]; // default
    } catch (error) {
      console.error('Routing error:', error);
      return [agents.strategist]; // fallback
    }
  }

  // Main chat handler
  async chat(message, requestedAgent = null, context = {}) {
    const sessionId = context.sessionId || 'default';
    
    // Get or create conversation history
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }
    const history = this.conversationHistory.get(sessionId);

    // Determine which agent(s) to use
    let targetAgents;
    if (requestedAgent && agents[requestedAgent]) {
      targetAgents = [agents[requestedAgent]];
    } else {
      targetAgents = await this.route(message, context);
    }

    // Build the full prompt with agent personality
    const primaryAgent = targetAgents[0];
    const systemPrompt = primaryAgent.getSystemPrompt();
    
    // Build conversation context
    const recentHistory = history.slice(-10).map(h => 
      `${h.role}: ${h.content}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}

${recentHistory ? `Recent conversation:\n${recentHistory}\n\n` : ''}User: ${message}

${primaryAgent.displayName}:`;

    try {
      // Generate response via Ollama
      const response = await ollama.generate(fullPrompt, {
        model: context.model || 'llama3.2:1b',
        temperature: context.temperature || 0.7,
        maxTokens: context.maxTokens || 2000
      });

      // Update history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: response, agent: primaryAgent.name });
      
      // Trim history if too long
      if (history.length > 50) {
        this.conversationHistory.set(sessionId, history.slice(-50));
      }

      return {
        text: response,
        agent: primaryAgent.name,
        agentDisplay: primaryAgent.displayName,
        agentColor: primaryAgent.color,
        agentIcon: primaryAgent.icon
      };
    } catch (error) {
      console.error('Chat generation error:', error);
      return {
        text: `I apologize, but I encountered an error processing your request. Please ensure Ollama is running and try again.`,
        agent: primaryAgent.name,
        error: true
      };
    }
  }

  // Clear conversation history
  clearHistory(sessionId = 'default') {
    this.conversationHistory.delete(sessionId);
  }
}

module.exports = new Engine();