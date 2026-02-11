#!/bin/bash

# Sync workspace memory files to Obsidian vault
# Run after making changes to workspace memory files

WORKSPACE_MEMORY="$HOME/.openclaw/workspace/memory"
OBSIDIAN_MEMORY="$HOME/Documents/Kai/Kai_Obsidian/Kai/Kai Memory"

echo "=== Syncing Workspace Memory to Obsidian ==="

# Ensure Obsidian directory exists
mkdir -p "$OBSIDIAN_MEMORY"

# Copy all files from workspace memory to Obsidian
# Using cp -r to include subdirectories (archive/, weekly-reviews/)
cp -r "$WORKSPACE_MEMORY/"* "$OBSIDIAN_MEMORY/" 2>/dev/null

echo "✓ Synced workspace/memory/ → Kai_Obsidian/Kai/Kai Memory/"
echo ""
echo "Files synced:"
ls -1 "$WORKSPACE_MEMORY/"
