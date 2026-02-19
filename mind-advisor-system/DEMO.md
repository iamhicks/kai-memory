# MIND Advisor System — Demo Script

This script recreates the three required showcase moments without any manual typing. Run via:

```bash
npm run demo
```

The program prints the following segments:

1. **Team synthesis** — User asks “What should I focus on this week to unblock the launch?”
   - Router selects Strategist + Product Lead + Mindset Coach
   - Shows the synthesized prompt snippet and mock response

2. **Direct @mention** — User pings `@strategist` about delaying launch
   - Router routes as `direct`
   - Displays Strategist prompt excerpt + simulated reply

3. **Custom advisor creation + mention**
   - Builds a “B2B Content” advisor from the template library
   - Adds it to the available team list
   - Immediately routes `@<custom_id>` to prove mention + response flow

For live exploration instead of scripted output, run `npm start` and:

```
ask What should I focus on this week?
ask @strategist do we delay launch?
create role=b2b_content_marketing focus=repurposing_research tone=creative
ask @custom_growth_generalist_1 what content should I ship?
exit
```
