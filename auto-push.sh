#!/bin/bash

# Auto-push script for Kai's memory files
# Runs every hour to backup .md files to GitHub

echo "=== Auto-Push Started at $(date) ==="

# 1. Push Obsidian vault
echo "[1/2] Pushing Obsidian vault..."
cd ~/Documents/Kai/Kai_Obsidian
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Obsidian pushed"
else
    echo "  ℹ No changes to push"
fi

# 2. Push OpenClaw workspace
echo "[2/2] Pushing OpenClaw workspace..."
cd ~/.openclaw/workspace
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-sync: $(date '+%d-%m-%Y %H:%M')"
    git push origin main
    echo "  ✓ Workspace pushed"
else
    echo "  ℹ No changes to push"
fi

echo "=== Auto-Push Complete at $(date) ==="
