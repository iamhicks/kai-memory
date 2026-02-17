#!/bin/bash

# FLOW Error Logger
# Saves all errors to a file you can check anytime

LOG_FILE="$HOME/Documents/Kai/Repos/flow-dev/error.log"

echo "=== FLOW Error Log ===" >> "$LOG_FILE"
echo "Started at: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Run FLOW and capture all output
cd "$HOME/Documents/Kai/Repos/flow-dev"
npm start 2>&1 | tee -a "$LOG_FILE"
