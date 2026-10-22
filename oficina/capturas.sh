#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Regenera as 4 capturas do anexo visual (seção 13 da proposta).
#
#   ./oficina/capturas.sh
#
# Rode sempre depois de mexer na interface — o anexo é re-gerado
# inteiro, sem edição manual.
#
# Requer: node + npm install (Playwright) + python3.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8811}"
OUT="$ROOT/oficina/anexos"

cd "$ROOT"

if [ ! -d node_modules/playwright ]; then
  echo "Playwright ausente — rodando npm install..."
  npm install --no-audit --no-fund
fi

mkdir -p "$OUT"

# ── servidor local (o app usa ES modules: precisa de HTTP) ──
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 2

echo "Gerando capturas em $OUT"
BASE="http://127.0.0.1:$PORT" node "$ROOT/oficina/capturar.mjs"

echo
echo "Pronto. Agora regere o PDF:  ./oficina/build.sh"
