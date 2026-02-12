#!/bin/bash

# Sync workspace memory files to Obsidian vault only
# Note: Full workspace backups are handled by auto-push.sh (hourly cron)
# This script only syncs memory files to Obsidian for easy access

WORKSPACE_MEMORY="$HOME/.openclaw/workspace/memory"
OBSIDIAN_MEMORY="$HOME/Documents/Kai/Kai_Obsidian/Kai/Kai Memory"

echo "=== Syncing Workspace Memory Files to Obsidian ==="
echo ""

# Sync to Obsidian only (auto-push.sh handles Kai_Memory/Workspace/ backups)
echo "→ Syncing to Obsidian..."
mkdir -p "$OBSIDIAN_MEMORY"
cp -r "$WORKSPACE_MEMORY/"* "$OBSIDIAN_MEMORY/" 2>/dev/null
echo "✓ Synced workspace/memory/ → Kai_Obsidian/Kai/Kai Memory/"

echo ""
echo "=== Sync Complete ==="
echo ""
echo "Files synced:"
ls -1 "$WORKSPACE_MEMORY/"
echo ""
echo "Note: Full workspace backups (including .md root files and scripts)"
echo "      are handled by auto-push.sh cron job to Kai_Memory/Workspace/"
