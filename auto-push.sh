#!/bin/bash

# Auto-push script for Kai's memory files
# Runs every hour to backup to GitHub and create local timestamped backups

DATE=$(date '+%d-%m-%y')
TIME=$(date '+%H%M')

echo "=== Auto-Push Started at $(date) ==="

# 1. Backup workspace files to Kai_Memory
echo "[1/6] Backing up workspace..."
BACKUP_DIR=~/Documents/Kai/Kai_Memory/Workspace/$DATE/$TIME
mkdir -p "$BACKUP_DIR"
cp ~/.openclaw/workspace/*.md "$BACKUP_DIR/" 2>/dev/null
cp ~/.openclaw/workspace/*.sh "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/memory "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/skills "$BACKUP_DIR/" 2>/dev/null
echo "  ✓ Workspace backed up to $BACKUP_DIR"

# 2. Backup session transcripts
echo "[2/6] Backing up sessions..."
SESSION_BACKUP=~/Documents/Kai/Kai_Memory/Sessions/$DATE/$TIME
mkdir -p "$SESSION_BACKUP"
cp ~/.openclaw/agents/main/sessions/*.jsonl "$SESSION_BACKUP/" 2>/dev/null
echo "  ✓ Sessions backed up to $SESSION_BACKUP"

# 3. Backup Obsidian vault to Backups folder
echo "[3/6] Backing up Obsidian..."
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
echo "[4/6] Pushing workspace to GitHub..."
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
        PRODUCT_BACKUP=~/Documents/Kai/Repos/$product/Backups/$DATE/$TIME
        mkdir -p "$PRODUCT_BACKUP"
        cd ~/Documents/Kai/Repos/$product
        for item in *; do
            [[ "$item" == "Backups" ]] && continue
            if [ -e "$item" ]; then
                cp -r "$item" "$PRODUCT_BACKUP/" 2>/dev/null
            fi
        done
        echo "  ✓ $product backed up"
    fi
done

echo "=== Auto-Push Complete at $(date) ==="
