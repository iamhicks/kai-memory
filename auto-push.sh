#!/bin/bash

# Auto-push script for Kai's memory files
# Runs every hour to backup to GitHub and create local timestamped backups

DATE=$(date '+%d-%m-%y')
TIME=$(date '+%H%M')

echo "=== Auto-Push Started at $(date) ==="

# Helper function: copy folder contents excluding date folders (dd-mm-yy pattern)
copy_excluding_dates() {
    local src="$1"
    local dst="$2"
    mkdir -p "$dst"
    cd "$src" || return
    for item in * .*; do
        [[ "$item" == "." || "$item" == ".." ]] && continue
        # Skip date-pattern folders (dd-mm-yy)
        if [[ "$item" =~ ^[0-9]{2}-[0-9]{2}-[0-9]{2}$ ]]; then
            continue
        fi
        if [ -e "$item" ]; then
            cp -r "$item" "$dst/" 2>/dev/null
        fi
    done
}

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

# 3. Timestamped backup of Kai_Obsidian vault (the actual vault at Kai_Obsidian/Kai/)
echo "[3/5] Backing up Kai_Obsidian vault..."
OBSIDIAN_BACKUP=~/Documents/Kai/Kai_Obsidian/Kai/$DATE/$TIME
copy_excluding_dates ~/Documents/Kai/Kai_Obsidian/Kai "$OBSIDIAN_BACKUP"
echo "  ✓ Kai_Obsidian backed up to $OBSIDIAN_BACKUP"

# 4. Push Obsidian vault to GitHub (from Kai_Obsidian/Kai/)
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

# 5. Timestamped backups for website, mind, flow (inside each folder, exclude dates)
echo "[5/5] Creating timestamped backups for products..."
for product in website mind flow; do
    if [ -d ~/Documents/Kai/Repos/$product ]; then
        PRODUCT_BACKUP=~/Documents/Kai/Repos/$product/$DATE/$TIME
        copy_excluding_dates ~/Documents/Kai/Repos/$product "$PRODUCT_BACKUP"
        echo "  ✓ $product backed up"
    fi
done

echo "=== Auto-Push Complete at $(date) ==="
