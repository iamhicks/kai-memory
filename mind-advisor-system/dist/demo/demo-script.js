"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projectContextRouter_1 = require("../router/projectContextRouter");
const sampleProject_1 = require("../data/sampleProject");
const coreAdvisors_1 = require("../data/coreAdvisors");
const mockLLM_1 = require("../services/mockLLM");
const advisorTemplates_1 = require("../templates/advisorTemplates");
const templateAdvisorFactory_1 = require("../services/templateAdvisorFactory");
const customAdvisors = [];
async function runDemo() {
    console.log('\n==============================');
    console.log('MIND Advisor System Demo Script');
    console.log('==============================\n');
    await scenario('1️⃣ Synthesized team response', 'What should I focus on this week to unblock the launch?');
    await scenario('2️⃣ Direct @mention', '@strategist should we delay the launch for better copy?');
    await runCustomAdvisorScenario();
}
async function scenario(title, question) {
    console.log(title);
    console.log('User:', question);
    const router = new projectContextRouter_1.ProjectContextRouter(sampleProject_1.sampleProject, { customAdvisors });
    const decision = await router.route(question);
    const response = (0, mockLLM_1.simulateResponse)(decision, sampleProject_1.sampleProject, advisorLookup(), question);
    console.log('Routing:', decision.type, decision.advisors ?? []);
    console.log('Prompt snippet:', (decision.prompt ?? '').split('\n').slice(0, 6).join('\n'));
    console.log('Response preview:', response, '\n');
}
async function runCustomAdvisorScenario() {
    console.log('3️⃣ Custom advisor creation + mention');
    const params = {
        role: 'b2b content marketing',
        focus: 'repurposing research into authority assets',
        tone: 'creative'
    };
    const template = (0, advisorTemplates_1.findBestTemplate)(params.role);
    const advisor = (0, templateAdvisorFactory_1.generateAdvisorFromTemplate)(template, params);
    customAdvisors.push(advisor);
    console.log('Custom advisor generated:', advisor.name, advisor.emoji, '-', advisor.id);
    const mentionQuestion = `@${advisor.id} what content should I ship this week?`;
    await scenario('Custom advisor response', mentionQuestion);
}
function advisorLookup() {
    return new Map([...coreAdvisors_1.coreAdvisors, ...customAdvisors].map((advisor) => [advisor.id, advisor]));
}
runDemo();
