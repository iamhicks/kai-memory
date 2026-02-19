# MIND Generative Advisor System
**Concept:** Users describe their business/need, MIND creates a custom advisor
**Status:** Design Document

---

## The Vision

Instead of picking from pre-defined advisors, users say:

> "I need an advisor for my yoga studio"

MIND responds:
> "I'll create a **Wellness Studio Advisor** for you. This advisor specializes in yoga business operations, class scheduling, instructor management, and wellness industry marketing."

**30 seconds later:** New advisor appears in their list, fully functional.

---

## How It Works

### Step 1: User Request

**User input examples:**
- "I need help with my yoga studio"
- "Create an advisor for my coffee shop"
- "I run a creative agency, I need specialist advice"
- "Help me build an advisor for real estate investing"

### Step 2: MIND Research & Generation

**System prompts MIND to act as "Advisor Architect":**

```
You are an Advisor Architect. Create a specialized AI advisor for this business:

BUSINESS: "Yoga studio"
CONTEXT: User teaches yoga classes, struggles with scheduling, retention, and marketing

TASK:
1. Identify 3-5 core expertise areas for this advisor
2. Define their background/experience
3. Create their approach/framework
4. Write their core principles (8-10)
5. Design 2-3 decision frameworks specific to this business

OUTPUT FORMAT:
- Advisor Name: [Descriptive title]
- Role: [One sentence]
- Background: [2-3 sentences of relevant experience]
- Core Expertise: [5 bullets]
- Approach: [How they help]
- Core Principles: [8-10 statements]
- Decision Frameworks: [2-3 specific frameworks]
- Tone: [Communication style]

Make it specific to the business type. Not generic business advice.
```

### Step 3: Prompt Generation

**MIND converts research into our standard prompt format:**

```javascript
{
  id: 'custom-yoga-studio-abc123',  // Generated unique ID
  name: 'Yoga Studio Advisor',
  description: 'Specialist in yoga business operations and wellness industry',
  type: 'custom',  // Flag as user-generated
  createdFrom: 'User request: "yoga studio"',
  prompt: `ROLE: Yoga Studio Business Advisor
BACKGROUND: 12+ years running successful yoga studios...`
}
```

### Step 4: Integration

**New advisor immediately appears in:**
- Advisor selection modal
- Dropdown menu
- Available for multi-advisor meetings

---

## User Experience

### Method 1: Natural Language

**User:** "I need an advisor for my coffee shop"

**MIND:** 
> "I'll create a **Café Operations Advisor** for you. They specialize in:
> - Menu development and pricing
> - Morning rush operations  
> - Local customer acquisition
> - Coffee supplier relationships
> - Cozy space design
>
> Creating now... ✓ Done! Your new advisor is ready."

### Method 2: Guided Builder

**MIND asks structured questions:**
1. "What type of business?" (yoga studio)
2. "What's your biggest challenge?" (getting regular students)
3. "What's your business model?" (membership + drop-in)
4. "Any specific expertise needed?" (retention + community building)

**MIND generates based on answers.**

### Method 3: Template + Customize

**Start with base template, then customize:**
- Base: "Wellness Business"
- User adds: "...but for yoga specifically, not general fitness"
- MIND refines the prompt

---

## Technical Implementation

### Data Structure

```javascript
// Stored in localStorage with user settings
{
  customAdvisors: [
    {
      id: 'custom-yoga-studio-abc123',
      name: 'Yoga Studio Advisor',
      description: 'Specialist in yoga business operations',
      icon: '🧘‍♀️',  // Auto-selected or user picks
      type: 'custom',
      createdAt: '2026-02-19T12:00:00Z',
      createdFrom: 'User request: "yoga studio"',
      usageCount: 15,  // Track popularity
      prompt: '...',  // The full system prompt (hidden)
      expertise: ['retention', 'scheduling', 'community'],  // For search/tagging
      version: 1  // For future updates
    }
  ]
}
```

### Generation API Call

```javascript
async function generateCustomAdvisor(userDescription) {
  // 1. Research phase
  const researchPrompt = `Research what a ${userDescription} advisor needs to know...`;
  const research = await callLLM(researchPrompt);
  
  // 2. Generate structured advisor
  const advisorTemplate = buildAdvisorFromResearch(research);
  
  // 3. Convert to our prompt format
  const fullPrompt = convertToMINDFormat(advisorTemplate);
  
  // 4. Save to user's custom advisors
  saveCustomAdvisor({
    ...advisorTemplate,
    prompt: fullPrompt
  });
}
```

### UI Integration

**New section in advisor modal:**
```
┌─────────────────────────────────┐
│ Your Custom Advisors (3)        │
│                                 │
│ 🧘‍♀️ Yoga Studio Advisor      │
│ ☕ Café Operations Advisor     │
│ 🎨 Creative Agency Advisor     │
│                                 │
│ [+ Create New Advisor]         │
└─────────────────────────────────┘
```

**Create button opens:**
- Text input: "Describe the advisor you need"
- Or: "Start from template" dropdown

---

## Quality Control

### Prompt Framework Enforcement

**All generated advisors MUST include:**
1. ROLE definition
2. BACKGROUND (experience)
3. CORE EXPERTISE (5 areas)
4. APPROACH (how they help)
5. CORE PRINCIPLES (8-10)
6. DECISION FRAMEWORKS (2-3)
7. TONE description

### Validation

**Before saving, MIND checks:**
- Is it specific enough? (not generic business advice)
- Does it match our framework structure?
- Is it appropriate/safe?
- Would it be helpful to the user?

**If weak, MIND asks clarifying questions:**
> "I can create a general wellness advisor, but could you tell me more about your specific type of yoga? (hot yoga, vinyasa, restorative, etc.) This will make the advisor much more useful."

---

## Advanced Features

### Advisor Evolution

**Users can request improvements:**
- "Make my Yoga Advisor more focused on online classes"
- "Add expertise about meditation retreats to my Yoga Advisor"
- "My Café Advisor needs to know more about specialty coffee roasting"

**Version tracking:**
- Keep history of advisor versions
- Allow rollback if new version is worse

### Advisor Sharing (Future)

**Community aspect:**
- "Share this advisor with other yoga studio owners"
- Marketplace of user-created advisors
- Ratings: "This Yoga Advisor helped me increase retention 40%"

### Pack Creation from Custom Advisors

**If user creates multiple advisors:**
- "You've created 3 wellness advisors. Save as 'Wellness Business Pack'?"
- Share pack with others

---

## Example Generated Advisors

### Example 1: Yoga Studio

**User request:** "yoga studio, struggling with retention"

**Generated Advisor:**

```
ROLE: Yoga Studio Retention & Community Advisor
BACKGROUND: 10+ years running boutique yoga studios with 85%+ member retention rates. Expert in building yoga communities, instructor development, and creating transformative student experiences. Certified yoga instructor who understands both the practice and business sides.

CORE EXPERTISE:
- Student retention and membership models
- Class scheduling optimization
- Instructor recruitment and retention
- Community building and events
- Mindful studio ambiance and design

APPROACH: Helps you create a studio where students feel belonging, not just attend classes. Focuses on the emotional and community aspects that keep students coming back.

CORE PRINCIPLES:
- Retention costs 1/5th of acquisition - prioritize keeping students
- Community happens in the lobby, not just the mat
- Teachers are your product - invest in them
- Consistency beats intensity (regular practice > occasional deep dives)
- The studio is a sanctuary - protect the energy
- Know every regular student's name
- Specialization attracts dedication (niche yoga styles build loyal followings)
- Challenges and workshops re-engage lapsed students
- Partner with wellness practitioners (nutritionists, massage) for holistic community
- Revenue follows transformation (focus on student growth, not sales)

DECISION FRAMEWORKS:

**The Retention Funnel:**
- Drop-in → Class pack → Monthly member → Annual member
- Track conversion at each step
- Identify where students drop off
- Focus fixes on biggest leak

**The Studio Energy Audit:**
- Space: Does it feel like a sanctuary?
- Teachers: Are they engaged and growing?
- Community: Do students know each other?
- Classes: Is there variety + consistency?
- Communication: Do students feel seen?

TONE: Calm, encouraging, deeply understanding of yoga philosophy but practical about business. Like a senior studio owner who's been through it all and wants to help you succeed without losing your mind or your soul.
```

### Example 2: Coffee Shop

**User request:** "coffee shop, opening soon, need help"

**Generated Advisor:**

```
ROLE: Specialty Coffee Shop Launch Advisor  
BACKGROUND: Opened 8 successful independent coffee shops in competitive markets. Expert in location selection, morning rush operations, local marketing, and building coffee-obsessed communities. Former barista trainer who knows that great coffee is necessary but not sufficient.

CORE EXPERTISE:
- Location selection and lease negotiation
- Morning rush workflow optimization
- Local customer acquisition and loyalty
- Coffee supplier relationships and quality control
- Cozy third-space design

[... continues with full prompt ...]
```

---

## Comparison: Pre-Written vs Generative

| Aspect | Pre-Written Packs | Generative Advisors |
|--------|-------------------|---------------------|
| **Coverage** | Limited to what we write | Infinite - any business type |
| **Specificity** | Generic for vertical | Customized to user's exact need |
| **Maintenance** | We update 90+ prompts | Self-maintaining (user regenerates) |
| **Discovery** | User picks from list | User describes need, gets match |
| **Quality** | Consistent (we control) | Consistent (AI follows framework) |
| **Hidden prompts?** | Yes | Yes |
| **Community** | N/A | Users can share creations |

**Winner:** Generative advisors for flexibility + scalability

---

## Implementation Priority

**Phase 1 (MVP):**
- Natural language advisor creation
- Single advisor at a time
- Stored in localStorage
- Basic UI (modal with text input)

**Phase 2:**
- Guided builder (structured questions)
- Advisor editing/evolution
- Template starting points
- Usage tracking

**Phase 3:**
- Advisor sharing
- Community marketplace
- Pack creation from multiple advisors
- Ratings and reviews

---

## The Hook for Marketing

**"MIND doesn't just give you advisors. It helps you BUILD your perfect advisory team."**

**Example pitch:**
> "Most AI tools give you generic business advice. MIND lets you create advisors specifically for YOUR business. Yoga studio? We'll build you a Yoga Studio Advisor. Coffee shop? A Café Operations Advisor. Creative agency? An Agency Growth Advisor. Each one tailored to your exact challenges."

---

## Next Steps

1. **Build MVP:** Natural language advisor creation
2. **Test:** Have me (Kai) generate 5-10 custom advisors for different business types
3. **Validate:** Do they feel as good as pre-written ones?
4. **Iterate:** Improve generation prompts based on results
5. **Ship:** Include in MIND launch

**This feature could be THE differentiator.** No competitor lets users create custom AI advisors this easily.
