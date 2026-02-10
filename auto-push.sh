#!/bin/bash

# Auto-push script for Kai's memory files
# Runs every hour to backup to GitHub and create local timestamped backups
# BACKUPS ARE STORED OUTSIDE GIT REPOS to avoid committing them

DATE=$(date '+%d-%m-%y')
TIME=$(date '+%H%M')

echo "=== Auto-Push Started at $(date) ==="

# 1. Backup workspace files
BACKUP_DIR=~/Documents/Kai/Kai_Memory/Workspace/$DATE/$TIME
mkdir -p "$BACKUP_DIR"
cp ~/.openclaw/workspace/*.md "$BACKUP_DIR/" 2>/dev/null
cp ~/.openclaw/workspace/*.sh "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/memory "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/skills "$BACKUP_DIR/" 2>/dev/null
echo "  ✓ Workspace backed up to $BACKUP_DIR"

# 2. Backup session transcripts (chat logs)
SESSION_BACKUP=~/Documents/Kai/Kai_Memory/Sessions/$DATE/$TIME
mkdir -p "$SESSION_BACKUP"
cp ~/.openclaw/agents/main/sessions/*.jsonl "$SESSION_BACKUP/" 2>/dev/null
echo "  ✓ Sessions backed up to $SESSION_BACKUP"

# 3. Push workspace to GitHub
echo "[3/6] Pushing workspace to GitHub..."
cd ~/.openclaw/workspace
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Workspace pushed"
else
    echo "  ℹ No changes to push"
fi

# 4. Backup Obsidian vault
OBSIDIAN_BACKUP=~/Documents/Kai/Kai_Memory/Obsidian_Backups/$DATE/$TIME
mkdir -p "$OBSIDIAN_BACKUP"
cd ~/Documents/Kai/Kai_Obsidian/Kai
for item in * .*; do
    [[ "$item" == "." || "$item" == ".." ]] && continue
    if [ -e "$item" ]; then
        cp -r "$item" "$OBSIDIAN_BACKUP/" 2>/dev/null
    fi
done
echo "  ✓ Obsidian backed up to $OBSIDIAN_BACKUP"

# 5. Push Obsidian to GitHub
echo "[5/6] Pushing Obsidian to GitHub..."
cd ~/Documents/Kai/Kai_Obsidian/Kai
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Obsidian pushed"
else
    echo "  ℹ No changes to push"
fi

# 6. Backup product repos
echo "[6/6] Backing up products..."
for product in website mind flow; do
    if [ -d ~/Documents/Kai/Repos/$product ]; then
        PRODUCT_BACKUP=~/Documents/Kai/Kai_Memory/Product_Backups/$product/$DATE/$TIME
        mkdir -p "$PRODUCT_BACKUP"
        cd ~/Documents/Kai/Repos/$product
        for item in *; do
            if [ -e "$item" ]; then
                cp -r "$item" "$PRODUCT_BACKUP/" 2>/dev/null
            fi
        done
        echo "  ✓ $product backed up"
    fi
done

echo "=== Auto-Push Complete at $(date) ==="
echo ""
echo "Backup locations:"
echo "  - Workspace:  ~/Documents/Kai/Kai_Memory/Workspace/$DATE/$TIME"
echo "  - Sessions:   ~/Documents/Kai/Kai_Memory/Sessions/$DATE/$TIME"
echo "  - Obsidian:   ~/Documents/Kai/Kai_Memory/Obsidian_Backups/$DATE/$TIME"
echo "  - Products:   ~/Documents/Kai/Kai_Memory/Product_Backups/{website,mind,flow}/$DATE/$TIME"
