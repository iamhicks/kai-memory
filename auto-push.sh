#!/bin/bash

# Auto-push script for Kai's memory files
# Runs every hour to backup to GitHub and create local timestamped backups
# BACKUPS ARE STORED OUTSIDE GIT REPOS to avoid committing them

DATE=$(date '+%d-%m-%y')
TIME=$(date '+%H%M')

echo "=== Auto-Push Started at $(date) ==="

# 1. Create timestamped backup of Kai_Memory (workspace files)
echo "[1/5] Backing up Kai_Memory..."
BACKUP_DIR=~/Documents/Kai/Kai_Memory/$DATE/$TIME
mkdir -p "$BACKUP_DIR"
cp ~/.openclaw/workspace/*.md "$BACKUP_DIR/" 2>/dev/null
cp ~/.openclaw/workspace/*.sh "$BACKUP_DIR/" 2>/dev/null
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

# 3. Timestamped backup of Kai_Obsidian vault (BACKUP OUTSIDE REPO)
echo "[3/5] Backing up Kai_Obsidian vault..."
# Back up to Kai_Memory/Obsidian_Backups instead of inside the repo
OBSIDIAN_BACKUP=~/Documents/Kai/Kai_Memory/Obsidian_Backups/$DATE/$TIME
mkdir -p "$OBSIDIAN_BACKUP"
cd ~/Documents/Kai/Kai_Obsidian/Kai
for item in * .*; do
    [[ "$item" == "." || "$item" == ".." ]] && continue
    if [ -e "$item" ]; then
        cp -r "$item" "$OBSIDIAN_BACKUP/" 2>/dev/null
    fi
done
echo "  ✓ Kai_Obsidian backed up to $OBSIDIAN_BACKUP"

# 4. Push Obsidian vault to GitHub
echo "[4/5] Pushing Obsidian vault to GitHub..."
cd ~/Documents/Kai/Kai_Obsidian/Kai
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Obsidian pushed"
else
    echo "  ℹ No changes to push"
fi

# 5. Timestamped backups for website, mind, flow (BACKUP OUTSIDE REPOS)
echo "[5/5] Creating timestamped backups for products..."
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
echo "  - Kai_Memory: ~/Documents/Kai/Kai_Memory/$DATE/$TIME"
echo "  - Obsidian:   ~/Documents/Kai/Kai_Memory/Obsidian_Backups/$DATE/$TIME"
echo "  - Products:   ~/Documents/Kai/Kai_Memory/Product_Backups/{website,mind,flow}/$DATE/$TIME"
