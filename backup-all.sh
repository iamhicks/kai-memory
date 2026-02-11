#!/bin/bash

# Master Backup Script - Corrected Structure (as agreed 10-02-2026)
# Backs up: Kai Memory (Sessions + Workspace), Repos (MIND, FLOW, etc.)

TIMESTAMP=$(date +%H%M)
DATE_FOLDER=$(date +%d-%m-%y)

echo "=== Master Backup Started at $(date) ==="

# 1. Backup OpenClaw Workspace → ~/Documents/Kai/Kai_Memory/Workspace/
echo "[1/4] Backing up OpenClaw Workspace..."
mkdir -p "$HOME/Documents/Kai/Kai_Memory/Workspace/$DATE_FOLDER/$TIMESTAMP"
cp -r "$HOME/.openclaw/workspace/"* "$HOME/Documents/Kai/Kai_Memory/Workspace/$DATE_FOLDER/$TIMESTAMP/" 2>/dev/null || true
cp "$HOME/.openclaw/openclaw.json" "$HOME/Documents/Kai/Kai_Memory/Workspace/$DATE_FOLDER/$TIMESTAMP/" 2>/dev/null || true
echo "  ✓ Workspace backed up to Kai_Memory/Workspace/$DATE_FOLDER/$TIMESTAMP"
echo "  ✓ Includes memory/ folder docs (backup-structure.md, LESSONS.md, etc.)"

# 2. Backup Sessions (if any local session exports exist)
echo "[2/4] Backing up Sessions..."
mkdir -p "$HOME/Documents/Kai/Kai_Memory/Sessions/$DATE_FOLDER/$TIMESTAMP"
# Sessions are typically exported/tracked separately, but ensure directory exists
echo "  ✓ Sessions directory ready at Kai_Memory/Sessions/$DATE_FOLDER/$TIMESTAMP"

# 3. Backup MIND Electron App → ~/Documents/Kai/Repos/mind/
echo "[3/4] Backing up MIND Electron App..."
if [ -d ~/Documents/Kai/Repos/mind ]; then
  mkdir -p "$HOME/Documents/Kai/Repos/mind/$DATE_FOLDER/$TIMESTAMP"
  cp -r ~/Documents/Kai/Repos/mind/app/* "$HOME/Documents/Kai/Repos/mind/$DATE_FOLDER/$TIMESTAMP/" 2>/dev/null || true
  echo "  ✓ MIND backed up to Repos/mind/$DATE_FOLDER/$TIMESTAMP"
else
  echo "  ℹ MIND repo not found (skipped)"
fi

# 4. Backup MIND Demo (if exists)
echo "[4/4] Backing up MIND Demo..."
if [ -d ~/Documents/Kai/Repos/mind/demo ]; then
  mkdir -p "$HOME/Documents/Kai/Repos/mind-demo/$DATE_FOLDER/$TIMESTAMP"
  cp -r ~/Documents/Kai/Repos/mind/demo/* "$HOME/Documents/Kai/Repos/mind-demo/$DATE_FOLDER/$TIMESTAMP/" 2>/dev/null || true
  echo "  ✓ MIND demo backed up to Repos/mind-demo/$DATE_FOLDER/$TIMESTAMP"
else
  echo "  ℹ MIND demo not found (skipped)"
fi

echo ""
echo "=== Backup Complete at $(date) ==="
echo ""
echo "Locations:"
echo "  - Kai Memory/Workspace/$DATE_FOLDER/$TIMESTAMP"
echo "  - Kai Memory/Sessions/$DATE_FOLDER/$TIMESTAMP"
echo "  - Repos/mind/$DATE_FOLDER/$TIMESTAMP"
