# MIND Accountability Workflow for Solo Entrepreneurs
**Version:** 1.0  
**Date:** 18 February 2026  
**Purpose:** The complete system for taking a solo entrepreneur from idea to profitable business

---

## Philosophy

**The Problem:** Solo entrepreneurs fail not from lack of ideas, but from:
- No accountability (nobody asks "where's the progress?")
- No focus (shiny object syndrome)
- No deadlines ("I'll ship when it's ready" = never)
- No feedback loop (building in isolation)
- No pattern recognition (making same mistakes)

**The Solution:** MIND isn't a chatbot. It's an AI-powered entrepreneurial operating system with:
- **Structured workflows** (not random conversations)
- **Mandatory checkpoints** (can't skip accountability)
- **Pattern detection** (learns how you work)
- **Appropriate advisor matching** (right help at right time)
- **Progress visualization** (see your momentum)

---

## The Advisor Team (15 Curated Experts)

**Core Team (Used Most Often):**
1. **💬 General** - Daily prioritization, founder psychology
2. **🎯 Strategy** - Business decisions, pivot/persevere
3. **💻 Code** - Technical decisions, shipping fast
4. **📢 Marketing** - Growth, customer acquisition
5. **🚀 Entrepreneur** - AI strategy, revenue generation

**Specialist Team (Called When Needed):**
6. **🎨 Design** - Brand/UI, conversion-focused
7. **🐛 Debug** - Problem solving, root cause
8. **📦 Product** - Feature prioritization
9. **🎯 Sales** - Outbound, closing deals
10. **🔬 Research** - Market intel, competitor analysis
11. **✍️ Writing** - Content, copywriting
12. **⚖️ Legal** - Contracts, risk protection
13. **💰 Finance** - Runway, unit economics
14. **⚙️ Operations** - Automation, processes
15. **🧘 Mindset** - Psychology, resilience

**Important:** These prompts are **locked and curated**. Users cannot edit them. This ensures:
- Consistent quality
- Proven effectiveness
- Safety (no prompt injection)
- Brand integrity

---

## The Complete Workflow

### PHASE 1: FOUNDATION (Week 1-2)
**Goal:** Capture chaos, establish clarity

#### Day 1: Onboarding & Setup
**Trigger:** First app open
**Advisor:** General (with Strategy context)

**Workflow:**
1. **Welcome Sequence**
   - General: "Welcome to MIND. I'm here to help you turn your ideas into reality. Let's start by understanding what you're building."
   
2. **Idea Capture** (Mandatory)
   - General asks 5 questions:
     - "What problem are you solving?"
     - "Who has this problem?"
     - "How are they solving it now?"
     - "What's your solution?"
     - "Why you? Why now?"
   - Creates: `/ideas/initial-concept.md`

3. **Knowledge Base Setup**
   - General: "Let's organize your research. What do you already know?"
   - Captures: bookmarks, notes, competitor links
   - Creates: `/research/competitors.md`, `/research/market-intel.md`

4. **Advisor Team Introduction**
   - Each advisor introduces themselves (1 sentence each)
   - User selects "primary advisor" for daily check-ins
   - Default: General (can change anytime)

5. **First Project Created**
   - General: "Let's create your first project. What do you want to accomplish in the next 2 weeks?"
   - Creates: `/projects/idea-validation/_project.md`
   - Auto-creates first 3 tasks:
     - "Validate problem exists" (interviews)
     - "Map current solutions" (competitor analysis)
     - "Define unique angle" (differentiation)

**Success Criteria:** User has captured their idea and has 3 concrete tasks

---

#### Daily: Morning Standup (Mandatory)
**Trigger:** First app open each day (or scheduled time)
**Duration:** 2-3 minutes
**Advisor:** General (or user's chosen primary)

**Workflow:**
1. **Context Load**
   - AI reads:
     - Yesterday's standup
     - Current project status
     - Overdue tasks
     - Blockers from yesterday

2. **The Questions** (Always the same structure)
   - "What did you accomplish yesterday?"
   - "What are you working on today?"
   - "Any blockers?"
   - "Which advisor do you need today?"

3. **Smart Responses**
   - If no progress: "Yesterday you said you'd validate the problem. No update. What happened?"
   - If overdue tasks: "The 'competitor analysis' task is 3 days overdue. Still relevant?"
   - If blocker: "You mentioned being stuck on pricing. Want to chat with Strategy advisor?"

4. **Action Creation**
   - User can create tasks from standup
   - AI suggests: "Should I create a task for 'Email 5 potential customers'?"

**Output:** Updated task status, new tasks created, blockers logged

---

#### Weekly: Review & Planning (Mandatory)
**Trigger:** Every Sunday (or user-defined day)
**Duration:** 15-20 minutes
**Advisors:** General + Relevant specialists

**Workflow:**

**Part 1: Week Review (AI-led)**
1. **Progress Analysis**
   - AI reviews all tasks from past week
   - Calculates: completion rate, velocity, blockers
   - "You completed 4/7 tasks (57%). Up from 3/8 last week."

2. **Pattern Detection**
   - "You consistently underestimate design tasks by 2x."
   - "You work best on technical tasks in mornings."
   - "You've moved 'pricing decision' to next week 3 times."

3. **Blocker Analysis**
   - Lists all tasks stuck >3 days
   - Asks: "Why are these blocked? Do you need help?"

4. **Win Celebration**
   - "You shipped the landing page! That's a major milestone."
   - Builds momentum and positive reinforcement

**Part 2: Next Week Planning (Collaborative)**
1. **Goal Setting**
   - General: "What must be true by next Sunday?"
   - User defines 1-3 key outcomes

2. **Task Creation**
   - Break down goals into tasks
   - AI estimates (based on user's history)
   - User adjusts

3. **Advisor Assignment**
   - AI suggests which advisors will be needed:
     - "You'll need Marketing for the launch"
     - "Consider talking to Legal about terms of service"

4. **Commitment**
   - "Are you confident you can achieve these 5 tasks?"
   - If no: "Which one should we remove or reduce?"

**Output:** Week plan with tasks, advisor schedule, commitments logged

---

### PHASE 2: VALIDATION (Week 2-4)
**Goal:** Prove the idea has legs before building

#### Trigger-Based Workflows

**Workflow A: Customer Interview Complete**
**Trigger:** User logs interview notes
**Advisor:** Strategy + Marketing

**Process:**
1. User creates note: `/validation/interview-customer-1.md`
2. AI analyzes for patterns:
   - "3/5 interviews mentioned pricing as concern"
   - "All mentioned they'd pay $50/month"
3. Strategy advisor comments:
   - "This validates your problem hypothesis. Pivot or persevere?"
4. Marketing advisor suggests:
   - "Based on language they used, consider 'effortless' in your copy"

**Workflow B: Competitor Analysis Complete**
**Trigger:** User marks competitor research task done
**Advisor:** Strategy + Product

**Process:**
1. AI reads competitor notes
2. Identifies gaps: "None offer mobile-first solution"
3. Strategy: "This is your differentiator. Build mobile-first."
4. Product: "Create user story: 'As a mobile user, I want...'"

**Workflow C: Stuck on Validation**
**Trigger:** Validation tasks overdue >5 days
**Advisor:** Mindset + Strategy

**Process:**
1. Mindset: "Validation anxiety is normal. You're not procrastinating, you're avoiding rejection."
2. Strategy: "Let's reduce scope. Interview 3 people, not 10. Just start."
3. Creates micro-task: "Send 1 cold email today"

---

### PHASE 3: BUILD (Month 2-3)
**Goal:** Ship MVP fast

#### Daily Standup Evolves
Now includes technical context:
- Code advisor checks in on technical blockers
- Product advisor reviews feature decisions
- General tracks velocity

#### Sprint Workflow (2-week cycles)
**Advisor:** Product + Code + General

**Week 1: Planning**
1. Product: "What's the smallest thing we can ship?"
2. Code: "Technical risks: these 3 things could block us"
3. General: "Given your calendar, can you actually do this?"

**Week 2: Execution**
- Daily check-ins on blockers
- Code advisor for technical decisions
- Debug advisor when stuck

**Week 2 End: Demo**
- "Show me what you built"
- User describes/demonstrates
- Advisors give feedback
- Go/No-go decision for shipping

#### Ship Workflow
**Trigger:** User marks MVP as complete
**Advisors:** ALL 15 ( moderated panel discussion)

**Process:**
1. **Pre-launch Review**
   - Code: "Security check complete?"
   - Legal: "Terms of service ready?"
   - Marketing: "Launch sequence planned?"
   - Finance: "Pricing set? Stripe connected?"

2. **Go/No-Go Vote**
   - Each advisor weighs in
   - General synthesizes: "5 advisors say ship, 2 say wait on X"

3. **Launch Support**
   - Marketing: Launch day checklist
   - Operations: Monitoring setup
   - General: "You've got this. Ship it."

---

### PHASE 4: GROW (Month 3+)
**Goal:** Get customers, iterate, scale

#### Metrics Review (Weekly)
**Advisor:** Entrepreneur + Marketing + Finance

**Workflow:**
1. User inputs metrics (or connects integrations):
   - Visitors, signups, conversions
   - Revenue, churn, LTV
   - Support tickets, feature requests

2. AI analyzes:
   - "Conversion rate 2% (industry avg 3%). Let's optimize."
   - "Churn spiked this week. Talk to customers?"
   - "You're burning $2k/month. 6 months runway."

3. Advisor recommendations:
   - Marketing: "A/B test headline - current one unclear"
   - Product: "Top feature request: mobile app. Priority?"
   - Finance: "Consider annual discount to improve cash flow"

#### Pivot/Persevere Decision Framework
**Trigger:** Monthly or when metrics stall
**Advisor:** Strategy (primary) + All advisors

**Workflow:**
1. Strategy: "It's been 3 months. Time for hard questions."
2. Reviews:
   - Original hypothesis
   - What you've learned
   - Current metrics vs expectations
3. Advisors debate:
   - "Pivot to B2B?" (Marketing)
   - "Technical debt is manageable" (Code)
   - "Founder energy is flagging" (Mindset)
4. Strategy synthesizes options
5. User decides with full context

---

## Special Workflows (Trigger-Based)

### Burnout Detection
**Trigger:** No activity for 5+ days after consistent use
**Advisor:** Mindset + General

**Process:**
1. Mindset: "You disappeared for a week. Checking in - are you okay?"
2. No pressure, just support
3. Offers: "Want to reduce scope? Take a break? Talk through blockers?"
4. Adjusts expectations in project

### Overwhelm Detection
**Trigger:** User creates 10+ tasks in one day
**Advisor:** General

**Process:**
1. General: "You just added 12 tasks. That's 3 weeks of work."
2. "Let's prioritize. What's the ONE thing that matters this week?"
3. Helps user reduce to 3-5 tasks

### Shiny Object Syndrome
**Trigger:** New project created while current one incomplete
**Advisor:** Strategy + General

**Process:**
1. Strategy: "New idea energy is high. But you're 60% through current project."
2. "Options: A) Park new idea, B) Pause current, C) Reduce scope on both"
3. General: "What's driving this? Boredom or real opportunity?"
4. User makes conscious choice (not impulsive)

### Success Celebration
**Trigger:** Major milestone achieved (revenue, launch, 100 users)
**Advisors:** All advisors celebrate

**Process:**
1. Each advisor sends 1-sentence congrats
2. General synthesizes team celebration
3. Logs milestone in `/milestones/`
4. Asks: "What's next? Scale or optimize?"

---

## The Accountability System

### What Makes This Work

**1. Mandatory Checkpoints**
- Can't skip daily standup (must dismiss or complete)
- Weekly review required to access next week
- Monthly pivot/persevere decision forced

**2. Pattern Recognition**
- AI tracks your behaviors over time
- Calls out: "This is the 4th time you've delayed 'sales outreach'"
- Suggests: "Consider if this task is actually important or just scary"

**3. Appropriate Escalation**
- Day 1 overdue: Friendly reminder
- Day 3 overdue: "What's blocking you?"
- Day 7 overdue: "Do you need to break this down?"
- Day 14 overdue: "Is this still the right priority?"

**4. Contextual Advisor Matching**
- Stuck on code → Code advisor auto-suggested
- Pricing decision → Strategy advisor
- Burned out → Mindset advisor
- Not random, but intelligent routing

**5. Progress Visualization**
- Streak counter: "5 days of standups complete"
- Velocity chart: Tasks completed per week
- Completion rate: Trending up/down
- Blocker log: What's consistently blocking you

---

## User Controls (What They CAN Change)

**While advisor prompts are locked, users control:**

1. **Standup Time** - When daily check-in happens
2. **Primary Advisor** - Who leads daily standups (default: General)
3. **Intensity Level:**
   - **Gentle:** "How's it going?" style
   - **Standard:** Direct but supportive
   - **Intense:** "Where's the progress?" tough love
4. **Notification Preferences** - What triggers alerts
5. **Advisor Access** - Can mute specific advisors if not relevant

---

## Success Metrics for This Workflow

**User Outcomes:**
- Time from idea to validation: <2 weeks
- Time from validation to MVP: <6 weeks
- Time from MVP to first revenue: <4 weeks
- Completion rate: 70%+ (vs 20% industry average)

**Engagement Metrics:**
- Daily standup completion: 80%+
- Weekly review completion: 90%+
- Advisor chat sessions: 5+/week
- Projects started vs completed ratio: 3:1 (vs 10:1 typical)

**Business Metrics:**
- User retention (3-month): 60%+
- Upgrade to OpenClaw: 30%+
- NPS: 50+

---

## Implementation Notes for Developers

### Technical Requirements

1. **Scheduled Workflows**
   - Daily standup trigger (cron or app open detection)
   - Weekly review trigger ( Sundays)
   - Monthly pivot review trigger

2. **Context Loading**
   - Before every advisor interaction, load:
     - User profile (preferences, patterns)
     - Current project state
     - Recent conversations (last 7 days)
     - Overdue tasks
     - Metrics (if growth phase)

3. **Pattern Detection Engine**
   - Weekly job that analyzes:
     - Task completion times
     - Blocker frequency by type
     - Advisor usage patterns
     - Velocity trends
   - Updates user profile with insights

4. **Escalation Logic**
   - Rules-based system for when to escalate tone
   - Example: Task overdue 7 days → switch from gentle to direct

5. **Moderated Panel System**
   - Parallel advisor calls for complex decisions
   - Synthesis by General advisor
   - Voting mechanism for go/no-go

### Locked Prompts Strategy

**Why locked:**
- Quality control
- Safety
- Consistent user experience
- Brand integrity

**How to implement:**
- Store prompts in encrypted/obfuscated format
- Load at runtime
- User can select advisor but not edit prompt
- Updates pushed via app updates

---

## The Bottom Line

**This workflow ensures:**
1. **Ideas become actions** (not just notes)
2. **Actions become habits** (daily accountability)
3. **Habits become outcomes** (shipped products)
4. **Outcomes become businesses** (revenue, growth)

**The solo entrepreneur is no longer solo.** They have:
- A daily standup partner
- A weekly review board
- A full advisory team
- An accountability system that learns

**MIND isn't a tool. It's a team.**

---

**Next Steps:**
1. Lock and finalize all 15 advisor prompts
2. Implement daily standup workflow
3. Build weekly review system
4. Create pattern detection engine
5. Test with beta users
