#!/bin/bash

# Sync workspace memory files to Obsidian vault and Kai_Memory
# Run after making changes to workspace memory files

WORKSPACE_MEMORY="$HOME/.openclaw/workspace/memory"
OBSIDIAN_MEMORY="$HOME/Documents/Kai/Kai_Obsidian/Kai/Kai Memory"
KAI_MEMORY_WORKSPACE="$HOME/Documents/Kai/Kai_Memory/Workspace"

# Get today's date in DD-MM-YY format
TODAY=$(date +%d-%m-%y)
TODAY_FOLDER="$KAI_MEMORY_WORKSPACE/$TODAY"

echo "=== Syncing Workspace Memory Files ==="
echo ""

# 1. Sync to Obsidian
echo "→ Syncing to Obsidian..."
mkdir -p "$OBSIDIAN_MEMORY"
cp -r "$WORKSPACE_MEMORY/"* "$OBSIDIAN_MEMORY/" 2>/dev/null
echo "✓ Synced workspace/memory/ → Kai_Obsidian/Kai/Kai Memory/"

# 2. Sync to Kai_Memory/Workspace/DD-MM-YY/
echo ""
echo "→ Syncing to Kai_Memory Workspace..."
mkdir -p "$TODAY_FOLDER"
cp -r "$WORKSPACE_MEMORY/"* "$TODAY_FOLDER/" 2>/dev/null
echo "✓ Synced workspace/memory/ → Kai_Memory/Workspace/$TODAY/"

echo ""
echo "=== Sync Complete ==="
echo ""
echo "Files synced:"
ls -1 "$WORKSPACE_MEMORY/"
