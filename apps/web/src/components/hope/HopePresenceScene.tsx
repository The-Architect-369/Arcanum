'use client';

import type { ReactNode } from 'react';
import type { HopeRenderState } from '@/lib/hope/render';
import type { HopeVisualState } from '@/lib/hope/visual';
import { HopePresenceAvatar } from './HopePresenceAvatar';
import { HopePresenceField } from './HopePresenceField';

export function HopePresenceScene({
  renderState,
  visualState,
  size = 220,
  footer,
}: {
  renderState: HopeRenderState;
  visualState: HopeVisualState;
  size?: number;
  footer?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 p-6">
      <HopePresenceField visualState={visualState} />
      <div className="relative z-10 flex min-h-[19rem] flex-col items-center justify-center gap-4 text-center">
        <HopePresenceAvatar visualState={visualState} size={size} />
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.22em] text-white/70">
            {renderState.emotionalPreset} · {renderState.presenceMode}
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
            {visualState.motion.profile} motion · {renderState.presencePercent}% presence
          </div>
        </div>
        {footer ? <div className="pt-2">{footer}</div> : null}
      </div>
    </div>
  );
}
