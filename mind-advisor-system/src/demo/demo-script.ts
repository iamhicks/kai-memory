import { ProjectContextRouter } from '../router/projectContextRouter';
import { sampleProject } from '../data/sampleProject';
import { coreAdvisors } from '../data/coreAdvisors';
import { Advisor, CreationParams } from '../types/advisors';
import { simulateResponse } from '../services/mockLLM';
import { findBestTemplate } from '../templates/advisorTemplates';
import { generateAdvisorFromTemplate } from '../services/templateAdvisorFactory';

const customAdvisors: Advisor[] = [];

async function runDemo() {
  console.log('\n==============================');
  console.log('MIND Advisor System Demo Script');
  console.log('==============================\n');

  await scenario('1️⃣ Synthesized team response',
    'What should I focus on this week to unblock the launch?');

  await scenario('2️⃣ Direct @mention',
    '@strategist should we delay the launch for better copy?');

  await runCustomAdvisorScenario();
}

async function scenario(title: string, question: string) {
  console.log(title);
  console.log('User:', question);
  const router = new ProjectContextRouter(sampleProject, { customAdvisors });
  const decision = await router.route(question);
  const response = simulateResponse(decision, sampleProject, advisorLookup(), question);
  console.log('Routing:', decision.type, decision.advisors ?? []);
  console.log('Prompt snippet:', (decision.prompt ?? '').split('\n').slice(0, 6).join('\n'));
  console.log('Response preview:', response, '\n');
}

async function runCustomAdvisorScenario() {
  console.log('3️⃣ Custom advisor creation + mention');
  const params: CreationParams = {
    role: 'b2b content marketing',
    focus: 'repurposing research into authority assets',
    tone: 'creative'
  };
  const template = findBestTemplate(params.role);
  const advisor = generateAdvisorFromTemplate(template, params);
  customAdvisors.push(advisor);
  console.log('Custom advisor generated:', advisor.name, advisor.emoji, '-', advisor.id);
  const mentionQuestion = `@${advisor.id} what content should I ship this week?`;
  await scenario('Custom advisor response', mentionQuestion);
}

function advisorLookup() {
  return new Map([...coreAdvisors, ...customAdvisors].map((advisor) => [advisor.id, advisor]));
}

runDemo();
