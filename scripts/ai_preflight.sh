#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[preflight] checking required docs..."
required_docs=(
  "docs/START_HERE.md"
  "docs/HANDOFF.md"
  "docs/WORKFLOW.md"
  "docs/ARCHITECTURE.md"
  "docs/WORLD_DATA_SCHEMA.md"
)

for file in "${required_docs[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "missing required doc: $file"
    exit 1
  fi
done

echo "[preflight] importing main scene module..."
node --input-type=module -e "await import('./src/scenes/gameScene.js'); console.log('scene-ok')"

echo "[preflight] validating world data references..."
node --input-type=module -e "const { validateWorldData } = await import('./src/systems/worldValidation.js'); const warnings = validateWorldData(); console.log('warnings', warnings.length); if (warnings.length) { console.log(warnings.join('\\n')); process.exitCode = 1; }"

echo "[preflight] done"
