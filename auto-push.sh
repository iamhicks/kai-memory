#!/bin/bash

# Auto-push script for Kai's memory files
# Usage: auto-push.sh [quick|full]
#   quick - Workspace + Sessions only (default for cron)
#   full - Everything including Products + Obsidian (manual)

MODE="${1:-quick}"
DATE=$(date '+%d-%m-%y')
TIME=$(date '+%H%M')

echo "=== Auto-Push Started at $(date) (mode: $MODE) ==="

# 1. Backup workspace files to Kai_Memory (ALWAYS)
echo "[1/3] Backing up workspace..."
BACKUP_DIR=~/Documents/Kai/Kai_Memory/Workspace/$DATE/$TIME
mkdir -p "$BACKUP_DIR"
cp ~/.openclaw/workspace/*.md "$BACKUP_DIR/" 2>/dev/null
cp ~/.openclaw/workspace/*.sh "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/memory "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/skills "$BACKUP_DIR/" 2>/dev/null
echo "  ✓ Workspace backed up to $BACKUP_DIR"

# 2. Backup session transcripts (ALWAYS)
echo "[2/3] Backing up sessions..."
SESSION_BACKUP=~/Documents/Kai/Kai_Memory/Sessions/$DATE/$TIME
mkdir -p "$SESSION_BACKUP"
cp ~/.openclaw/agents/main/sessions/*.jsonl "$SESSION_BACKUP/" 2>/dev/null
echo "  ✓ Sessions backed up to $SESSION_BACKUP"

# 3. Push workspace to GitHub (ALWAYS)
echo "[3/3] Pushing workspace to GitHub..."
cd ~/.openclaw/workspace
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Workspace pushed"
else
    echo "  ℹ No changes to push"
fi

# FULL MODE ONLY: Products (MIND, FLOW, Website) + Obsidian
if [ "$MODE" == "full" ]; then
    echo ""
    echo "=== FULL BACKUP MODE ==="
    
    # 4. Backup MIND app
    echo "[4/9] Backing up MIND app..."
    if [ -d ~/Documents/Kai/Repos/mind/app ]; then
        MIND_BACKUP=~/Documents/Kai/Repos/mind/app/Backups/daily/$DATE/$TIME
        mkdir -p "$MIND_BACKUP"
        cd ~/Documents/Kai/Repos/mind/app
        for item in *; do
            [[ "$item" == "Backups" ]] && continue
            if [ -e "$item" ]; then
                cp -r "$item" "$MIND_BACKUP/" 2>/dev/null
            fi
        done
        cp ~/Documents/Kai/Repos/mind/main.js "$MIND_BACKUP/" 2>/dev/null
        cp ~/Documents/Kai/Repos/mind/preload.js "$MIND_BACKUP/" 2>/dev/null
        cp ~/Documents/Kai/Repos/mind/package.json "$MIND_BACKUP/" 2>/dev/null
        echo "  ✓ MIND app backed up to Repos/mind/app/Backups/daily/$DATE/$TIME"
    else
        echo "  ℹ MIND app not found (skipped)"
    fi
    
    # 5. Backup MIND demo
    echo "[5/9] Backing up MIND demo..."
    if [ -d ~/Documents/Kai/Repos/mind/demo ]; then
        MIND_DEMO_BACKUP=~/Documents/Kai/Repos/mind/demo/Backups/daily/$DATE/$TIME
        mkdir -p "$MIND_DEMO_BACKUP"
        cd ~/Documents/Kai/Repos/mind/demo
        for item in *; do
            [[ "$item" == "Backups" ]] && continue
            if [ -e "$item" ]; then
                cp -r "$item" "$MIND_DEMO_BACKUP/" 2>/dev/null
            fi
        done
        echo "  ✓ MIND demo backed up"
    fi
    
    # 6. Backup FLOW
    echo "[6/9] Backing up FLOW..."
    for subfolder in app demo; do
        if [ -d ~/Documents/Kai/Repos/flow/$subfolder ]; then
            FLOW_BACKUP=~/Documents/Kai/Repos/flow/$subfolder/Backups/daily/$DATE/$TIME
            mkdir -p "$FLOW_BACKUP"
            cd ~/Documents/Kai/Repos/flow/$subfolder
            for item in *; do
                [[ "$item" == "Backups" ]] && continue
                if [ -e "$item" ]; then
                    cp -r "$item" "$FLOW_BACKUP/" 2>/dev/null
                fi
            done
            echo "  ✓ flow/$subfolder backed up"
        fi
    done
    
    # 7. Backup website
    echo "[7/9] Backing up website..."
    if [ -d ~/Documents/Kai/Repos/website ]; then
        WEBSITE_BACKUP=~/Documents/Kai/Repos/website/Backups/daily/$DATE/$TIME
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
        echo "  ✓ website backed up"
    fi
    
    # 8. Backup Obsidian vault
    echo "[8/9] Backing up Obsidian..."
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
    
    # 9. Push Obsidian to GitHub
    echo "[9/9] Pushing Obsidian to GitHub..."
    cd ~/Documents/Kai/Kai_Obsidian/Kai
    if [ -n "$(git status --porcelain)" ]; then
        git add -A
        git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
        git push origin main
        echo "  ✓ Obsidian pushed"
    else
        echo "  ℹ No changes to push"
    fi
    
    # 10. Sync memory files to Obsidian
    echo "[10/10] Syncing memory files to Obsidian..."
    bash "$HOME/.openclaw/workspace/sync-to-obsidian.sh" > /dev/null 2>&1
    echo "  ✓ Memory synced to Obsidian"
fi

echo "=== Auto-Push Complete at $(date) ==="
