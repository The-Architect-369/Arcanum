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
  children,
  variant = 'full',
}: {
  renderState: HopeRenderState;
  visualState: HopeVisualState;
  size?: number;
  footer?: ReactNode;
  children?: ReactNode;
  variant?: 'full' | 'compact';
}) {
  const compact = variant === 'compact';

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 p-6">
      <HopePresenceField visualState={visualState} />
      <div
        className={compact ? 'relative z-10 grid min-h-[12rem] gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center' : 'relative z-10 flex min-h-[19rem] flex-col items-center justify-center gap-4 text-center'}
      >
        <div className={compact ? 'flex justify-center md:justify-start' : undefined}>
          <HopePresenceAvatar visualState={visualState} size={size} />
        </div>
        <div className={compact ? 'space-y-3 text-left' : 'space-y-1'}>
          <div className={compact ? 'space-y-1' : undefined}>
            <div className="text-xs uppercase tracking-[0.22em] text-white/70">
              {renderState.emotionalPreset} · {renderState.presenceMode}
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
              {visualState.motion.profile} motion · {renderState.presencePercent}% presence
            </div>
          </div>
          {children ? <div>{children}</div> : null}
          {footer ? <div className={compact ? 'pt-1' : 'pt-2'}>{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
