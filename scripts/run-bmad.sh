#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <workflow-name> [agent]"
  exit 2
fi

WF="$1"
AGENT="${2:-bmad-master}"
MANIFEST="_bmad/_config/workflow-manifest.csv"

ENTRY=$(grep -i "\"$WF\"" "$MANIFEST" || true)
if [ -z "$ENTRY" ]; then
  echo "Workflow '$WF' not found in $MANIFEST"
  exit 1
fi

WF_PATH=$(echo "$ENTRY" | awk -F, '{print $4}' | tr -d '"')

echo "Starting workflow '$WF' using agent '$AGENT'"
echo
echo "== Workflow file: $WF_PATH =="
if [ -f "$WF_PATH" ]; then
  sed -n '1,200p' "$WF_PATH"
else
  echo "Workflow file not found: $WF_PATH"
fi

AGENT_MANIFEST="_bmad/_config/agent-manifest.csv"
AGENT_ENTRY=$(grep -i "\"$AGENT\"" "$AGENT_MANIFEST" || true)
AGENT_PATH=$(echo "$AGENT_ENTRY" | awk -F, '{print $NF}' | tr -d '"' )

echo
echo "== Agent file: $AGENT_PATH =="
if [ -f "$AGENT_PATH" ]; then
  sed -n '1,200p' "$AGENT_PATH"
else
  echo "Agent file not found: $AGENT_PATH"
fi

echo
echo "Simulating run: listing steps..."
STEPS_DIR=$(dirname "$WF_PATH")/steps
if [ -d "$STEPS_DIR" ]; then
  for f in "$STEPS_DIR"/*.md; do
    echo "- $(basename "$f")"
    sed -n '1,6p' "$f"
    echo
  done
else
  echo "No steps directory found at $STEPS_DIR"
fi

echo "Workflow simulation complete."
