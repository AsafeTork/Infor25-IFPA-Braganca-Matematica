#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Regenera o PDF da proposta (A4, pronto para submissão).
#
#   ./oficina/build.sh            # só o PDF
#   ./oficina/build.sh --com-capturas   # atualiza as capturas antes
#
# Requer: python3 + Google Chrome.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8811}"
CHROME="${CHROME:-$(command -v google-chrome || command -v chromium || echo /opt/google/chrome/chrome)}"
BUDGET="${BUDGET:-12000}"

cd "$ROOT"

if [ "${1:-}" = "--com-capturas" ]; then
  "$ROOT/oficina/capturas.sh"
fi

python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 2

"$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
  --virtual-time-budget="$BUDGET" --no-pdf-header-footer \
  --print-to-pdf="$ROOT/oficina/oficina-proposta.pdf" \
  "http://127.0.0.1:$PORT/oficina/oficina-proposta.html" 2>&1 | grep -E "written" || true

python3 - "$ROOT/oficina/oficina-proposta.pdf" <<'PY'
import re, sys, os
p = sys.argv[1]
d = open(p, "rb").read()
print(f"  ✓ {os.path.basename(p)} — {len(re.findall(rb'/Type\s*/Page[^s]', d))} páginas · {len(d)//1024} KB")
PY
