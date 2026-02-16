# MIND Development Workflow

Follow the same workflow as FLOW for consistency.

## Folder Structure

```
~/Documents/Kai/Repos/
├── mind-dev/                    ← Work here (active development)
├── mind-stable/
│   └── dd-mm-yy/
│       └── hhmm/                ← Archived stable releases (date/time folders)
├── mind-live/                   ← Live/production app (DO NOT TOUCH)
└── mind/                        ← Legacy folder (to be deprecated)
```

## Workflow Rules

### 1. mind-dev/ (Active Development)
- Make all changes here
- Test thoroughly before merging
- Commit regularly: `git add -A && git commit -m "description"`
- Can be broken/unstable

### 2. mind-stable/ (Archive)
- Folder structure: `mind-stable/dd-mm-yy/hhmm/`
- Archive stable releases before deploying new ones
- Never edit directly — only copy FROM dev
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
4. **Archive stable:** Copy current `mind-live/` to `mind-stable/dd-mm-yy/hhmm/`
5. **Deploy:** Copy `mind-dev/` to `mind-live/`
6. **Verify:** Test live version works

## Emergency Rollback

If live breaks:
```bash
# Restore from most recent stable
cp -r ~/Documents/Kai/Repos/mind-stable/dd-mm-yy/hhmm/* \
      ~/Documents/Kai/Repos/mind-live/
```

## Current Status

- mind-dev: ✅ Set up with latest unified search
- mind-stable/16-02-26/1541: ✅ Archived stable release
- mind-live: ✅ Production copy from stable
- mind/: Legacy (being deprecated)
