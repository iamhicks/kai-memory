# MIND Development Workflow

Follow the same workflow as FLOW for consistency.

## Folder Structure

```
~/Documents/Kai/Repos/
├── mind-dev/          ← Work here (active development)
├── mind-stable/       ← Archive of stable releases
├── mind-live/         ← Live/production app (DO NOT TOUCH)
└── mind/              ← Legacy folder (to be deprecated)
```

## Workflow Rules

### 1. mind-dev/ (Active Development)
- Make all changes here
- Test thoroughly before merging
- Commit regularly: `git add -A && git commit -m "description"`
- Can be broken/unstable

### 2. mind-stable/ (Archive)
- Copy of working releases
- Named with version/date: `mind-stable-v1.2.0-20240216`
- Only copy FROM dev, never edit directly
- Used for rollbacks

### 3. mind-live/ (Production)
- **NEVER EDIT THIS FOLDER**
- The version Pete actually uses
- Only updated after testing in dev
- Must always work

## Development Process

1. **Start work:** Ensure you're in `mind-dev/`
2. **Make changes:** Edit, test, commit in dev
3. **Before merge:** Test thoroughly
4. **Archive stable:** Copy current `mind-live/` to `mind-stable-[date]/`
5. **Deploy:** Copy `mind-dev/` to `mind-live/`
6. **Verify:** Test live version works

## Git Workflow (within dev)

```bash
cd ~/Documents/Kai/Repos/mind-dev
# Make changes
npm start  # Test

# Commit when working
git add -A
git commit -m "Feature: description"

# When ready for live
git tag v1.x.x  # Tag stable releases
```

## Emergency Rollback

If live breaks:
```bash
# Restore from stable
cp -r ~/Documents/Kai/Repos/mind-stable-[date]/* \
      ~/Documents/Kai/Repos/mind-live/
```

## Current Status

- mind-dev: ✅ Set up with latest unified search
- mind-stable: ❌ Not created yet
- mind-live: ❌ Not created yet
- mind/: Legacy (contains previous work)
