'use client';

import { useState } from 'react';
import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { LockHint } from '@/components/shared/LockHint';
import CTAActivate from '@/components/shared/CTAActivate';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';

const ORDER = ['/hope/inventory', '/hope/character', '/hope/stylize'] as const;

export default function HopeCharacterPage() {
  const [chatTab, setChatTab] = useState<'new' | 'logs'>('new');

  return (
    <SwipeRoutes order={ORDER}>
      <div className="min-h-[calc(100dvh-7rem)] flex flex-col">
        <TabDots
          tabs={[
            { href: ORDER[0], aria: 'Inventory' },
            { href: ORDER[1], aria: 'Character' },
            { href: ORDER[2], aria: 'Stylize' },
          ]}
        />

        {/* Single full-height tile that contains both character sheet + chat */}
        <PanelShell title="Hope — Character" flush className="flex-1">
          {/* Fill the tile height and split: [top auto] + [chat 1fr] */}
          <div className="h-full grid grid-rows-[auto_1fr] gap-4">
            {/* TOP: Character sheet (square avatar + intro) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Square avatar box that adapts at 100% zoom */}
              <div className="w-full">
                <div className="aspect-square rounded-xl border border-white/10 bg-white/[0.03]" />
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-sm text-zinc-300">
                  Welcome, human. Explore freely as a guest. When you’re ready, we’ll set up your ACC and wallet together.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <CTAActivate />
                  <button className="rounded-xl border border-white/20 px-4 py-2 text-sm bg-white/5 hover:bg-white/10">
                    What can I do as a guest?
                  </button>
                </div>
              </div>
            </div>

            {/* BOTTOM: Chat area fills the remaining height and scrolls internally */}
            <div className="min-h-0 flex flex-col">
              {/* Chat tabs */}
              <div className="mb-3 flex items-center gap-2">
                <button
                  onClick={() => setChatTab('new')}
                  className={`rounded-md border px-3 py-1.5 text-xs ${
                    chatTab === 'new'
                      ? 'bg-blue-700 text-amber-300 border-amber-400'
                      : 'bg-neutral-900/60 text-zinc-300 border-zinc-600 hover:bg-white/5'
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => setChatTab('logs')}
                  className={`rounded-md border px-3 py-1.5 text-xs ${
                    chatTab === 'logs'
                      ? 'bg-blue-700 text-amber-300 border-amber-400'
                      : 'bg-neutral-900/60 text-zinc-300 border-zinc-600 hover:bg-white/5'
                  }`}
                >
                  Logs
                </button>
                {chatTab === 'logs' && <LockHint label="ACC required" />}
              </div>

              {/* Chat content area = flex-1 with internal scroll */}
              {chatTab === 'new' ? (
                <div className="min-h-0 flex flex-col">
                  <PanelSection title="Start a conversation" className="min-h-0 flex-1 flex flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400">
                      {/* Messages placeholder */}
                      <div className="opacity-70">Your conversation with Hope will appear here.</div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        placeholder="Ask Hope anything…"
                        className="flex-1 rounded-xl bg-zinc-900 px-3 py-2 outline-none border border-zinc-800"
                      />
                      <button className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20">Send</button>
                    </div>
                  </PanelSection>
                </div>
              ) : (
                <PanelSection title="Chat Logs" className="min-h-0 flex-1">
                  <div className="text-sm text-zinc-400">
                    Logs are available after ACC activation.
                  </div>
                  <div className="mt-3">
                    <CTAActivate />
                  </div>
                </PanelSection>
              )}
            </div>
          </div>
        </PanelShell>
      </div>
    </SwipeRoutes>
  );
}
