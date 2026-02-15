# Telegram Role Commands

When chatting via Telegram, you can use role commands to switch my persona:

## Commands
- `/general` - General assistant (default)
- `/code` - Software developer mode
- `/design` - UI/UX designer mode  
- `/strategy` - Product strategist mode
- `/debug` - Debugging mode
- `/marketing` - Marketing strategist mode
- `/research` - Research analyst mode
- `/writing` - Writer/editor mode
- `/legal` - Legal document reviewer (not legal advice)
- `/finance` - Financial analyst mode
- `/trading` - Trading coach mode

## Usage
```
/marketing Write a launch email for our new feature
```

## How It Works
1. I detect the /command at the start of your message
2. I switch to that role's system prompt
3. I respond in that persona
4. The conversation is tagged with the role in ClawVault

## Current Role
Track the current active role in this session and prepend the appropriate system prompt to my responses.
