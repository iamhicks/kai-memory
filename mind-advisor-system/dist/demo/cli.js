"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:readline/promises");
const node_process_1 = require("node:process");
const projectContextRouter_1 = require("../router/projectContextRouter");
const sampleProject_1 = require("../data/sampleProject");
const coreAdvisors_1 = require("../data/coreAdvisors");
const mockLLM_1 = require("../services/mockLLM");
const advisorTemplates_1 = require("../templates/advisorTemplates");
const templateAdvisorFactory_1 = require("../services/templateAdvisorFactory");
const memorySearch_1 = require("../services/memorySearch");
const advisorStatus_1 = require("../services/advisorStatus");
const pipelineStages_1 = require("../services/pipelineStages");
const sharedTasks_1 = require("../services/sharedTasks");
const customAdvisors = [];
// Initialize new services
const searchService = new memorySearch_1.SearchService();
const statusTracker = new advisorStatus_1.AdvisorStatusTracker();
const pipelineManager = new pipelineStages_1.PipelineManager('build'); // Start in build phase
const taskManager = new sharedTasks_1.SharedTaskManager();
// Initialize advisor statuses
function initStatuses() {
    statusTracker.setStatus('strategist', 'reviewing', 'Pricing strategy analysis');
    statusTracker.setStatus('product_lead', 'blocked', 'Landing page dependencies', 'Design assets');
    statusTracker.setStatus('mindset_coach', 'idle');
}
function banner() {
    console.log('🧠  MIND Advisor System CLI - v2.0');
    console.log('');
    console.log('Commands:');
    console.log('  ask <question>     — Route question to advisors');
    console.log('  search <query>    — Search memory (#decision, #ship, #blocker)');
    console.log('  status            — Show advisor status board');
    console.log('  pipeline          — View project pipeline stages');
    console.log('  tasks             — View shared task board');
    console.log('  create ...        — Create custom advisor');
    console.log('  demo              — Run full feature demo');
    console.log('  exit              — Quit');
    console.log('');
}
function buildRouter() {
    return new projectContextRouter_1.ProjectContextRouter(sampleProject_1.sampleProject, {
        customAdvisors
    });
}
function parseAskCommand(command) {
    return command.replace(/^ask\s+/i, '').trim();
}
function parseCreateCommand(command) {
    const defaults = {
        role: 'general advisor',
        focus: 'supporting key decisions',
        tone: 'analytical'
    };
    const matches = Array.from(command.matchAll(/(role|focus|tone|emoji)=([^ ]+)/gi));
    const params = { ...defaults };
    for (const [, key, value] of matches) {
        if (key === 'tone' && isTone(value)) {
            params.tone = value.toLowerCase();
        }
        else if (key === 'role') {
            params.role = value.replace(/_/g, ' ');
        }
        else if (key === 'focus') {
            params.focus = value.replace(/_/g, ' ');
        }
        else if (key === 'emoji') {
            params.preferredEmoji = value;
        }
    }
    if (!params.role)
        params.role = defaults.role;
    if (!params.focus)
        params.focus = defaults.focus;
    return params;
}
function isTone(value) {
    return ['challenging', 'empathetic', 'pragmatic', 'analytical', 'creative'].includes(value.toLowerCase());
}
async function handleQuestion(question) {
    const router = buildRouter();
    const decision = await router.route(question);
    const advisorLookup = new Map([...coreAdvisors_1.coreAdvisors, ...customAdvisors].map((a) => [a.id, a]));
    const response = (0, mockLLM_1.simulateResponse)(decision, sampleProject_1.sampleProject, advisorLookup, question);
    console.log(`Routing decision: ${decision.type}`);
    if (decision.prompt) {
        console.log('Generated prompt preview:\n', decision.prompt.split('\n').slice(0, 8).join('\n'), '\n...');
    }
    console.log('Response preview:\n', response);
}
async function handleSearch(query) {
    console.log('🔍 Searching memory...');
    // Build index if needed
    await searchService.buildIndex();
    // Parse filters from query
    const filters = {};
    if (query.includes('#decision'))
        filters.tags = ['decision'];
    if (query.includes('#ship'))
        filters.tags = ['ship'];
    if (query.includes('#blocker'))
        filters.tags = ['blocker'];
    const advisorMatch = query.match(/@(\w+)/);
    if (advisorMatch) {
        filters.advisor = advisorMatch[1];
    }
    const cleanQuery = query.replace(/#\w+|@\w+/g, '').trim();
    const results = await searchService.search(cleanQuery || '*', Object.keys(filters).length > 0 ? filters : undefined);
    if (results.length === 0) {
        console.log('No results found.');
        return;
    }
    console.log(`\n📄 Found ${results.length} results:\n`);
    for (const result of results.slice(0, 5)) {
        console.log(`📄 ${result.document.path} (score: ${result.score})`);
        console.log(`   Tags: ${result.document.tags.map(t => `#${t}`).join(', ')}`);
        if (result.highlights.length > 0) {
            console.log(`   "${result.highlights[0].substring(0, 100)}..."`);
        }
        console.log('');
    }
}
function handleStatus() {
    const advisorNames = new Map(coreAdvisors_1.coreAdvisors.map(a => [a.id, a.name]));
    console.log(statusTracker.getStatusBoard(advisorNames));
}
function handlePipeline() {
    console.log(pipelineManager.renderPipeline());
    console.log('');
    console.log(pipelineManager.renderStageCounts());
    console.log('');
    console.log(pipelineManager.checkExitCriteria());
}
function handleTasks() {
    // Auto-generate tasks based on project context
    const aiTasks = taskManager.autoCreateTasks({
        currentBlocker: sampleProject_1.sampleProject.currentBlocker,
        recentDecisions: sampleProject_1.sampleProject.recentDecisions,
        velocity: sampleProject_1.sampleProject.velocity,
        lastShipDate: sampleProject_1.sampleProject.lastShipDate
    });
    if (aiTasks.length > 0) {
        console.log(`🤖 AI created ${aiTasks.length} new task(s) based on project context\n`);
    }
    const advisorNames = new Map(coreAdvisors_1.coreAdvisors.map(a => [a.id, a.name]));
    console.log(taskManager.renderBoard(advisorNames));
}
async function runDemo() {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  🎯 MIND ADVISOR SYSTEM v2.0 - FEATURE DEMO');
    console.log('═══════════════════════════════════════════════════════════════\n');
    // Initialize demo data
    initStatuses();
    await searchService.buildIndex();
    // Feature 1: Memory Search
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 FEATURE 1: MEMORY SEARCH (File-Based)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Full-text search across markdown files with offline JSON index\n');
    console.log('🔍 Search: "MVP scope"');
    const results1 = await searchService.search('MVP scope');
    console.log(`   Found ${results1.length} documents`);
    results1.slice(0, 2).forEach(r => console.log(`   • ${r.document.path}`));
    console.log('\n🔍 Filter by tag: #blocker');
    const blockers = await searchService.getByTag('blocker');
    console.log(`   Found ${blockers.length} blockers`);
    blockers.forEach(b => console.log(`   • ${b.path}`));
    console.log('');
    // Feature 2: Visual Advisor Status
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FEATURE 2: VISUAL ADVISOR STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Status tracking: 🟢 idle 🟡 reviewing ⚪ waiting 🔴 blocked\n');
    handleStatus();
    console.log('');
    // Feature 3: Project Pipeline Stages
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 FEATURE 3: PROJECT PIPELINE STAGES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Chaos → Validate → Plan → Build → Review → Ship → Celebrate\n');
    handlePipeline();
    console.log('');
    // Feature 4: Shared Tasks
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 FEATURE 4: SHARED TASKS (AI Can Add)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('AI creates tasks with 🤖 badge on triggers: blocker, opportunity, nudge\n');
    // Clear and create fresh demo tasks
    handleTasks();
    console.log('');
    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ✅ ALL 4 FEATURES DEMONSTRATED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Try these commands:');
    console.log('  • search MVP');
    console.log('  • search #decision');
    console.log('  • status');
    console.log('  • pipeline');
    console.log('  • tasks');
    console.log('');
}
async function main() {
    initStatuses();
    banner();
    const rl = (0, promises_1.createInterface)({ input: node_process_1.stdin, output: node_process_1.stdout });
    while (true) {
        const command = (await rl.question('> ')).trim();
        if (!command)
            continue;
        if (command === 'exit')
            break;
        if (command === 'demo') {
            await runDemo();
            continue;
        }
        if (command === 'status') {
            handleStatus();
            continue;
        }
        if (command === 'pipeline') {
            handlePipeline();
            continue;
        }
        if (command === 'tasks') {
            handleTasks();
            continue;
        }
        if (command.startsWith('search')) {
            const query = command.replace(/^search\s+/i, '').trim();
            await handleSearch(query);
            continue;
        }
        if (command.startsWith('create')) {
            const params = parseCreateCommand(command);
            const template = (0, advisorTemplates_1.findBestTemplate)(params.role);
            const advisor = (0, templateAdvisorFactory_1.generateAdvisorFromTemplate)(template, params);
            customAdvisors.push(advisor);
            console.log('Custom advisor added:', advisor.id, '-', advisor.name);
            continue;
        }
        if (command.startsWith('ask')) {
            const question = parseAskCommand(command);
            await handleQuestion(question);
            continue;
        }
        await handleQuestion(command);
    }
    await rl.close();
}
main();
