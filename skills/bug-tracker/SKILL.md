---
name: bug-tracker
description: Track bugs during development. Use when user reports bugs, issues, or problems with code. Enforces strict rules - NEVER mark bugs as FIXED without explicit user confirmation.
---

# Bug Tracking Workflow

## HARD RULES - NEVER BREAK THESE

1. **NEVER use ✅ FIXED** - Only the user can say a bug is fixed
2. **NEVER assume status** - Wait for user to tell you
3. **ALWAYS use ⏳ PENDING TEST** after attempting a fix
4. **ALWAYS include bug list** in every reply about bugs
5. **READ THIS SKILL** before every reply about bugs

## Status Meanings

| Status | Meaning | Who Sets |
|--------|---------|----------|
| ⏳ PENDING TEST | Fix attempted, waiting for user test | You |
| ✅ FIXED | User confirmed it works | **USER ONLY** |
| ❌ STILL BROKEN | User tested, didn't work | User or You |

## Workflow

1. User reports bugs → Create list with ⏳ PENDING TEST
2. You attempt fixes → Keep as ⏳ PENDING TEST
3. User tests → **User tells you** if fixed or not
4. **Only user says** "fixed", "works", "confirmed" → Then and ONLY then can you use ✅ FIXED

## Template (use at end of EVERY reply about bugs)

```
## Changes Made

- Attempted fix for X
- Changed Y
- Updated Z

## Bug Tracker

| Bug | Status |
|-----|--------|
| Bug 1 description | ⏳ PENDING TEST |
| Bug 2 description | ⏳ PENDING TEST |
```

## What NOT to Do

❌ "Bug X is now fixed"  
❌ "This should work now"  
❌ "Fixed ✅" (unless user said it first)  
❌ Assuming anything about status

## What TO Do

✅ "I attempted to fix X by changing Y"  
✅ "Waiting for you to test"  
✅ "Let me know if this works"  
✅ Use ⏳ PENDING TEST only  

## Pre-Reply Checklist

Before sending ANY reply about bugs:
1. Check: Did I use ✅ FIXED?
2. If yes: Remove it unless user said "fixed"
3. Check: Did I assume status?
4. If yes: Change to ⏳ PENDING TEST
5. Check: Did I include the bug tracker table?
6. If no: Add it

## User Commands

- "Fixed" or "works" → You can use ✅ FIXED
- "Still broken" → Use ❌ STILL BROKEN
- "New bug" → Add to list as ⏳ PENDING TEST
