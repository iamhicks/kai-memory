#!/bin/bash

# Auto-push script for Kai's memory files
# Runs every hour to backup .md files to GitHub and create local timestamped backups

DATE=$(date '+%d-%m-%y')
TIME=$(date '+%H%M')

echo "=== Auto-Push Started at $(date) ==="

# 1. Create timestamped backup of Kai_Memory (workspace files)
echo "[1/4] Backing up Kai_Memory..."
BACKUP_DIR=~/Documents/Kai/Kai_Memory/$DATE/$TIME
mkdir -p "$BACKUP_DIR"
cp -r ~/.openclaw/workspace/*.md "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/memory "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/skills "$BACKUP_DIR/" 2>/dev/null
echo "  ✓ Kai_Memory backed up to $BACKUP_DIR"

# 2. Push OpenClaw workspace to GitHub
echo "[2/4] Pushing Kai_Memory to GitHub..."
cd ~/.openclaw/workspace
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Kai_Memory pushed"
else
    echo "  ℹ No changes to push"
fi

# 3. Push Obsidian vault (simple git push)
echo "[3/4] Pushing Obsidian vault..."
cd ~/Documents/Kai/Kai_Obsidian
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Obsidian pushed"
else
    echo "  ℹ No changes to push"
fi

# 4. Timestamped backups for website, mind, flow (from Repos/)
echo "[4/4] Creating timestamped backups for products..."
for product in website mind flow; do
    if [ -d ~/Documents/Kai/Repos/$product ]; then
        PRODUCT_BACKUP=~/Documents/Kai/Repos/$product-backups/$DATE/$TIME
        mkdir -p "$PRODUCT_BACKUP"
        cp -r ~/Documents/Kai/Repos/$product/* "$PRODUCT_BACKUP/" 2>/dev/null
        echo "  ✓ $product backed up"
    fi
done

echo "=== Auto-Push Complete at $(date) ==="
