#!/bin/bash

# Auto-push script for Kai's memory files
# Runs every hour to backup .md files to GitHub and create local timestamped backups

DATE=$(date '+%d-%m-%y')
TIME=$(date '+%H%M')

echo "=== Auto-Push Started at $(date) ==="

# 1. Create timestamped backup of Kai_Memory (workspace files)
echo "[1/5] Backing up Kai_Memory..."
BACKUP_DIR=~/Documents/Kai/Kai_Memory/$DATE/$TIME
mkdir -p "$BACKUP_DIR"
cp -r ~/.openclaw/workspace/*.md "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/memory "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/skills "$BACKUP_DIR/" 2>/dev/null
echo "  ✓ Kai_Memory backed up to $BACKUP_DIR"

# 2. Push OpenClaw workspace to GitHub
echo "[2/5] Pushing Kai_Memory to GitHub..."
cd ~/.openclaw/workspace
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Kai_Memory pushed"
else
    echo "  ℹ No changes to push"
fi

# 3. Timestamped backup of Kai_Obsidian
echo "[3/5] Backing up Kai_Obsidian..."
OBSIDIAN_BACKUP=~/Documents/Kai/Kai_Obsidian/$DATE/$TIME
mkdir -p "$OBSIDIAN_BACKUP"
cp -r ~/Documents/Kai/Kai_Obsidian/*.md "$OBSIDIAN_BACKUP/" 2>/dev/null
cp -r ~/Documents/Kai/Kai_Obsidian/* "$OBSIDIAN_BACKUP/" 2>/dev/null
find "$OBSIDIAN_BACKUP" -name "$DATE" -type d -exec rm -rf {} + 2>/dev/null
echo "  ✓ Kai_Obsidian backed up"

# 4. Push Obsidian vault to GitHub
echo "[4/5] Pushing Obsidian vault to GitHub..."
cd ~/Documents/Kai/Kai_Obsidian
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Obsidian pushed"
else
    echo "  ℹ No changes to push"
fi

# 5. Timestamped backups for website, mind, flow (inside each folder)
echo "[5/5] Creating timestamped backups for products..."
for product in website mind flow; do
    if [ -d ~/Documents/Kai/Repos/$product ]; then
        PRODUCT_BACKUP=~/Documents/Kai/Repos/$product/$DATE/$TIME
        mkdir -p "$PRODUCT_BACKUP"
        # Copy everything except existing backup folders
        find ~/Documents/Kai/Repos/$product -maxdepth 1 -not -path "*/\.*" -not -path "*/$DATE" -not -path ~/Documents/Kai/Repos/$product -exec cp -r {} "$PRODUCT_BACKUP/" \; 2>/dev/null
        echo "  ✓ $product backed up to $PRODUCT_BACKUP"
    fi
done

echo "=== Auto-Push Complete at $(date) ==="
