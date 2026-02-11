#!/bin/bash

# Auto-push script for Kai's memory files
# Runs every hour to backup to GitHub and create local timestamped backups

DATE=$(date '+%d-%m-%y')
TIME=$(date '+%H%M')

echo "=== Auto-Push Started at $(date) ==="

# 1. Backup workspace files to Kai_Memory
echo "[1/5] Backing up workspace..."
BACKUP_DIR=~/Documents/Kai/Kai_Memory/Workspace/$DATE/$TIME
mkdir -p "$BACKUP_DIR"
cp ~/.openclaw/workspace/*.md "$BACKUP_DIR/" 2>/dev/null
cp ~/.openclaw/workspace/*.sh "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/memory "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/skills "$BACKUP_DIR/" 2>/dev/null
echo "  ✓ Workspace backed up to $BACKUP_DIR"

# 2. Backup session transcripts
echo "[2/5] Backing up sessions..."
SESSION_BACKUP=~/Documents/Kai/Kai_Memory/Sessions/$DATE/$TIME
mkdir -p "$SESSION_BACKUP"
cp ~/.openclaw/agents/main/sessions/*.jsonl "$SESSION_BACKUP/" 2>/dev/null
echo "  ✓ Sessions backed up to $SESSION_BACKUP"

# 3. Backup Obsidian vault
echo "[3/5] Backing up Obsidian..."
OBSIDIAN_BACKUP=~/Documents/Kai/Kai_Obsidian/Kai/Backups/$DATE/$TIME
mkdir -p "$OBSIDIAN_BACKUP"
cd ~/Documents/Kai/Kai_Obsidian/Kai
for item in *; do
    [[ "$item" == "Backups" ]] && continue
    if [ -e "$item" ]; then
        cp -r "$item" "$OBSIDIAN_BACKUP/" 2>/dev/null
    fi
done
echo "  ✓ Obsidian backed up to $OBSIDIAN_BACKUP"

# 4. Push workspace to GitHub
echo "[4/5] Pushing workspace to GitHub..."
cd ~/.openclaw/workspace
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Workspace pushed"
else
    echo "  ℹ No changes to push"
fi

# 5. Push Obsidian to GitHub
echo "[5/5] Pushing Obsidian to GitHub..."
cd ~/Documents/Kai/Kai_Obsidian/Kai
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Obsidian pushed"
else
    echo "  ℹ No changes to push"
fi

# 6. Backup product repos (website at root, mind/flow subfolders)
echo "[6/7] Backing up products..."

# Website - backup at root level
echo "  Backing up website..."
WEBSITE_BACKUP=~/Documents/Kai/Repos/website/Backups/$DATE/$TIME
mkdir -p "$WEBSITE_BACKUP"
cd ~/Documents/Kai/Repos/website
for item in *; do
    [[ "$item" == ".git" ]] && continue
    [[ "$item" == "Backups" ]] && continue
    [[ "$item" == *.bak ]] && continue
    [[ "$item" == *-backup-* ]] && continue
    if [ -e "$item" ]; then
        cp -r "$item" "$WEBSITE_BACKUP/" 2>/dev/null
    fi
done
echo "    ✓ website backed up"

# Mind - backup app and demo subfolders (including root source files in app/Backups)
echo "  Backing up mind..."

# Backup app subfolder + include root source files
if [ -d ~/Documents/Kai/Repos/mind/app ]; then
    MIND_BACKUP=~/Documents/Kai/Repos/mind/app/Backups/$DATE/$TIME
    mkdir -p "$MIND_BACKUP"
    
    # Copy app folder contents
    cd ~/Documents/Kai/Repos/mind/app
    for item in *; do
        [[ "$item" == "Backups" ]] && continue
        if [ -e "$item" ]; then
            cp -r "$item" "$MIND_BACKUP/" 2>/dev/null
        fi
    done
    
    # Also copy root source files to same backup folder
    cp ~/Documents/Kai/Repos/mind/main.js "$MIND_BACKUP/" 2>/dev/null
    cp ~/Documents/Kai/Repos/mind/preload.js "$MIND_BACKUP/" 2>/dev/null
    cp ~/Documents/Kai/Repos/mind/package.json "$MIND_BACKUP/" 2>/dev/null
    
    echo "    ✓ mind/app backed up (with source files)"
fi

# Backup demo subfolder
if [ -d ~/Documents/Kai/Repos/mind/demo ]; then
    MIND_DEMO_BACKUP=~/Documents/Kai/Repos/mind/demo/Backups/$DATE/$TIME
    mkdir -p "$MIND_DEMO_BACKUP"
    cd ~/Documents/Kai/Repos/mind/demo
    for item in *; do
        [[ "$item" == "Backups" ]] && continue
        if [ -e "$item" ]; then
            cp -r "$item" "$MIND_DEMO_BACKUP/" 2>/dev/null
        fi
    done
    echo "    ✓ mind/demo backed up"
fi

# Flow - backup app and demo subfolders
echo "  Backing up flow..."
for subfolder in app demo; do
    if [ -d ~/Documents/Kai/Repos/flow/$subfolder ]; then
        FLOW_BACKUP=~/Documents/Kai/Repos/flow/$subfolder/Backups/$DATE/$TIME
        mkdir -p "$FLOW_BACKUP"
        cd ~/Documents/Kai/Repos/flow/$subfolder
        for item in *; do
            [[ "$item" == "Backups" ]] && continue
            if [ -e "$item" ]; then
                cp -r "$item" "$FLOW_BACKUP/" 2>/dev/null
            fi
        done
        echo "    ✓ flow/$subfolder backed up"
    fi
done

# 7. Sync workspace memory files to Obsidian
echo "[7/7] Syncing memory files to Obsidian..."
bash "$HOME/.openclaw/workspace/sync-to-obsidian.sh" > /dev/null 2>&1
echo "  ✓ Memory synced to Obsidian"

echo "=== Auto-Push Complete at $(date) ==="
