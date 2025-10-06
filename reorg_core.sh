#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$HOME/dev/arcanum/apps/web/src}"
BACKUP="$ROOT/_backup_$(date +%Y%m%d_%H%M%S)"
DRY_RUN="${DRY_RUN:-1}"  # 1 = dry-run (print only), 0 = actually change

say(){ printf '%s\n' "$*"; }
do_run(){ if [ "$DRY_RUN" = "0" ]; then eval "$*"; else say "[dry-run] $*"; fi; }
do_mv(){ mkdir -p "$BACKUP"; do_run "mv -v \"$1\" \"$2\""; }
do_mkdir(){ do_run "mkdir -p \"$1\""; }
do_write(){ # $1=file $2=heredoc-tag $3=content
  if [ "$DRY_RUN" = "0" ]; then cat > "$1" <<$2
$3
$2
  else
    say "[dry-run] write $1"
  fi
}

say "== Reorganizing Arcanum Core UI at: $ROOT =="
test -d "$ROOT" || { say "ERROR: $ROOT not found"; exit 1; }

# 0) Create target folders
do_mkdir "$ROOT/app/acc" "$ROOT/app/contacts" "$ROOT/app/messages" "$ROOT/app/stories" "$ROOT/app/feed" "$ROOT/app/rooms"
do_mkdir "$ROOT/components/ui" "$ROOT/components/panels/core" "$ROOT/components/panels/nexus" "$ROOT/state"

# 1) Unify Carousel: prefer arrow-button version
ARROW_SRC_CANDIDATES=(
  "$ROOT/components/ui/Carousel.tsx"         # maybe already correct
  "$ROOT/components/carousel.tsx"            # alternate filename
  "$ROOT/../../../../carousel.tsx"           # if dropped at repo root
)
FRAMER_FLAG=0
if [ -f "$ROOT/components/ui/Carousel.tsx" ] && grep -q "framer-motion" "$ROOT/components/ui/Carousel.tsx"; then
  FRAMER_FLAG=1
fi

if [ $FRAMER_FLAG -eq 1 ]; then
  # backup draggable carousel
  do_mkdir "$BACKUP/components/ui"
  do_mv "$ROOT/components/ui/Carousel.tsx" "$BACKUP/components/ui/Carousel.draggable.tsx"
fi

# if arrow version exists at alternate path, move it into place
if [ -f "$ROOT/components/carousel.tsx" ]; then
  do_mv "$ROOT/components/carousel.tsx" "$ROOT/components/ui/Carousel.tsx"
fi

# 2) PanelShell location
if [ -f "$ROOT/PanelShell.tsx" ]; then
  do_mv "$ROOT/PanelShell.tsx" "$ROOT/components/PanelShell.tsx"
fi

# 3) Fix routes: ensure Home is the carousels and ACC is /acc
# Case A: stray capitalized Page.tsx (ignored by Next, but we’ll relocate as ACC if it looks like Chain Code)
if [ -f "$ROOT/app/Page.tsx" ]; then
  if grep -qi "Chain Code" "$ROOT/app/Page.tsx"; then
    do_mv "$ROOT/app/Page.tsx" "$ROOT/app/acc/page.tsx"
  else
    do_mv "$ROOT/app/Page.tsx" "$BACKUP/Page.tsx"
  fi
fi

# Case B: if app/page.tsx contains Chain Code, move it to /acc and create a new Home
if [ -f "$ROOT/app/page.tsx" ] && grep -qi "Chain Code" "$ROOT/app/page.tsx"; then
  do_mv "$ROOT/app/page.tsx" "$ROOT/app/acc/page.tsx"
fi

# 4) Ensure a Home page exists with two carousels
if [ ! -f "$ROOT/app/page.tsx" ]; then
  do_write "$ROOT/app/page.tsx" "TSX" "$(cat <<'EOF'
"use client";
import { useState } from "react";
import Carousel from "@/components/ui/Carousel";
import PanelShell from "@/components/PanelShell";
import HopePanel from "@/components/panels/core/HopePanel";
import ChainCodePanel from "@/components/panels/core/ChainCodePanel";
import ManaPanel from "@/components/panels/core/ManaPanel";
import ExchangePanel from "@/components/panels/core/ExchangePanel";
import PreferencesPanel from "@/components/panels/core/PreferencesPanel";

export default function Home() {
  const [open, setOpen] = useState<string|null>(null);
  const core = [
    { k:"Hope", cmp:<HopePanel onOpen={()=>setOpen("Hope")} /> },
    { k:"Chain Code", cmp:<ChainCodePanel onOpen={()=>setOpen("Chain Code")} /> },
    { k:"MANA", cmp:<ManaPanel onOpen={()=>setOpen("MANA")} /> },
    { k:"Exchange", cmp:<ExchangePanel onOpen={()=>setOpen("Exchange")} /> },
    { k:"Preferences", cmp:<PreferencesPanel onOpen={()=>setOpen("Preferences")} /> },
  ];
  const nexus = ["Contacts","Messages","Stories","Global Feed","Rooms"].map(n => (
    <div key={n}>
      <h3 className="text-lg font-semibold">{n}</h3>
      <p className="text-sm opacity-80">Read-only for guests; actions gated.</p>
      <button onClick={()=>setOpen(n)} className="mt-3 px-3 py-1 rounded-lg border border-white/20">Open</button>
    </div>
  ));
  return (
    <main className="column-of-light scroll-snap-y">
      <section className="min-h-[100svh] snap-section flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold">Arcanum Core</h1>
        <Carousel loop={false}>{core.map(c => c.cmp)}</Carousel>
      </section>
      <section className="min-h-[100svh] snap-section flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-semibold">Nexus</h2>
        <Carousel loop={false}>{nexus}</Carousel>
      </section>
      <PanelShell open={!!open} onClose={()=>setOpen(null)} title={open ?? ""}>
        <div className="text-sm opacity-80">Full panel content goes here.</div>
      </PanelShell>
    </main>
  );
}
EOF
)"
fi

# 5) Ensure stub routes for Nexus (avoid 404s if linked later)
for R in contacts messages stories feed rooms; do
  if [ ! -f "$ROOT/app/$R/page.tsx" ]; then
    do_write "$ROOT/app/$R/page.tsx" "TSX" "export default function ${R^}(){return <div style={{padding:16}}><h1>${R^}</h1><p>Stub route</p></div>}"
  fi
done

# 6) Ensure globals.css is imported in layout.tsx
LAYOUT="$ROOT/app/layout.tsx"
if [ -f "$LAYOUT" ] && ! grep -q 'globals.css' "$LAYOUT"; then
  do_mv "$LAYOUT" "$BACKUP/layout.tsx.bak"
  do_write "$LAYOUT" "TSX" "$(cat "$BACKUP/layout.tsx.bak" 2>/dev/null | sed '1i\\import \"./globals.css\";')"
fi

# 7) Correct obvious “Hope” copy-pastes in core panels (titles)
fix_panel_title(){
  local FILE="$1"; local TITLE="$2"; local DESC="$3";
  if [ -f "$FILE" ]; then
    if grep -q '<h3' "$FILE"; then
      do_mv "$FILE" "$BACKUP/$(basename "$FILE").bak"
      do_write "$FILE" "TSX" "$(cat "$BACKUP/$(basename "$FILE").bak" \
        | sed -E "s#<h3[^>]*>.*</h3>#<h3 className=\"text-lg font-semibold\">$TITLE</h3>#; s#<p[^>]*>.*</p>#<p className=\\\"text-sm opacity-80\\\">$DESC</p>#")"
    fi
  fi
}
fix_panel_title "$ROOT/components/panels/core/ManaPanel.tsx" "MANA" "Balances, activity, send/receive."
fix_panel_title "$ROOT/components/panels/core/ExchangePanel.tsx" "Exchange" "Buy/sell MANA via provider; on/off-ramp."
fix_panel_title "$ROOT/components/panels/core/PreferencesPanel.tsx" "Preferences" "Privacy, security thresholds, default spend wallet, Hope persona."

say "== Done. DRY_RUN=$DRY_RUN | Backup dir (if any): $BACKUP =="
