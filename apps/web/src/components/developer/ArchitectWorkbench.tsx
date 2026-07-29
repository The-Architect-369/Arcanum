'use client'

import * as React from 'react'
import {
  DEFAULT_ARCHITECT_BROKER_URL,
  type ArchitectBrokerError,
  type ArchitectBrokerHealth,
  type ArchitectCommandDescriptor,
  type ArchitectExecutionReceipt,
  type ArchitectExecutionRequest,
} from '@/lib/architect/execution'

type BrokerState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'ready'; health: ArchitectBrokerHealth }
  | { status: 'error'; message: string }

function errorMessage(value: unknown): string {
  if (value instanceof Error) return value.message
  return 'Unknown broker error'
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) throw new Error(`Broker returned HTTP ${response.status} without JSON`)

  let parsed: T | ArchitectBrokerError
  try {
    parsed = JSON.parse(text) as T | ArchitectBrokerError
  } catch {
    throw new Error(`Broker returned invalid JSON with HTTP ${response.status}`)
  }

  if (!response.ok) {
    const brokerError = parsed as ArchitectBrokerError
    throw new Error(brokerError.detail || brokerError.error || `Broker returned HTTP ${response.status}`)
  }

  return parsed as T
}

export default function ArchitectWorkbench() {
  const [brokerUrl, setBrokerUrl] = React.useState(DEFAULT_ARCHITECT_BROKER_URL)
  const [brokerState, setBrokerState] = React.useState<BrokerState>({ status: 'idle' })
  const [selectedCommandId, setSelectedCommandId] = React.useState('')
  const [confirmed, setConfirmed] = React.useState(false)
  const [executing, setExecuting] = React.useState(false)
  const [receipt, setReceipt] = React.useState<ArchitectExecutionReceipt | null>(null)

  const commands = brokerState.status === 'ready' ? brokerState.health.commands : []
  const selectedCommand = commands.find((command) => command.id === selectedCommandId) ?? null

  const checkBroker = React.useCallback(async () => {
    setBrokerState({ status: 'checking' })
    setReceipt(null)
    try {
      const response = await fetch(`${brokerUrl.replace(/\/$/, '')}/health`, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      })
      const health = await readJson<ArchitectBrokerHealth>(response)
      setBrokerState({ status: 'ready', health })
      setSelectedCommandId((current) => current || health.commands[0]?.id || '')
    } catch (error) {
      setBrokerState({ status: 'error', message: errorMessage(error) })
    }
  }, [brokerUrl])

  const executeCommand = React.useCallback(async () => {
    if (!selectedCommand || !confirmed) return

    setExecuting(true)
    setReceipt(null)
    try {
      const request: ArchitectExecutionRequest = {
        schemaVersion: '1.0',
        commandId: selectedCommand.id,
        approvedByHumanArchitect: true,
        requestedAt: new Date().toISOString(),
      }
      const response = await fetch(`${brokerUrl.replace(/\/$/, '')}/execute`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout((selectedCommand.timeoutSeconds + 5) * 1000),
      })
      const nextReceipt = await readJson<ArchitectExecutionReceipt>(response)
      setReceipt(nextReceipt)
      setConfirmed(false)
      await checkBroker()
      setReceipt(nextReceipt)
    } catch (error) {
      setBrokerState({ status: 'error', message: errorMessage(error) })
    } finally {
      setExecuting(false)
    }
  }, [brokerUrl, checkBroker, confirmed, selectedCommand])

  const exportReceipt = React.useCallback(() => {
    if (!receipt) return
    const blob = new Blob([`${JSON.stringify(receipt, null, 2)}\n`], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${receipt.receiptId}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [receipt])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Local execution broker</h3>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-400">
                Connects this Workbench to the Termux loopback broker. The broker accepts only fixed,
                repository-confined commands and never receives arbitrary shell text.
              </p>
            </div>
            <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-sky-200">
              read-only
            </span>
          </div>

          <label className="mt-4 block text-xs font-medium text-zinc-300" htmlFor="architect-broker-url">
            Broker URL
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="architect-broker-url"
              value={brokerUrl}
              onChange={(event) => setBrokerUrl(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none ring-sky-300/30 focus:ring"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={checkBroker}
              disabled={brokerState.status === 'checking'}
              className="rounded-xl border border-sky-300/25 bg-sky-300/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {brokerState.status === 'checking' ? 'Checking…' : 'Check broker'}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-white/8 bg-black/35 p-3 text-xs">
            {brokerState.status === 'idle' && <p className="text-zinc-400">Broker has not been checked.</p>}
            {brokerState.status === 'checking' && <p className="text-sky-200">Checking local broker…</p>}
            {brokerState.status === 'error' && <p className="text-rose-200">{brokerState.message}</p>}
            {brokerState.status === 'ready' && (
              <dl className="grid gap-2 text-zinc-300 sm:grid-cols-2">
                <div><dt className="text-zinc-500">Status</dt><dd className="text-emerald-200">Ready</dd></div>
                <div><dt className="text-zinc-500">Repository</dt><dd className="break-all">{brokerState.health.repository}</dd></div>
                <div><dt className="text-zinc-500">Branch</dt><dd>{brokerState.health.branch || 'unknown'}</dd></div>
                <div><dt className="text-zinc-500">Commit</dt><dd className="break-all font-mono">{brokerState.health.commit || 'unknown'}</dd></div>
              </dl>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <h3 className="text-sm font-semibold text-zinc-100">Authority boundary</h3>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-zinc-400">
            <p>The Human Architect must select and confirm every command.</p>
            <p>No command accepts arguments from the browser.</p>
            <p>No commit, push, merge, deployment, chain transaction, secret read, or arbitrary shell is registered.</p>
            <p>Every execution returns a deterministic request hash and a result receipt hash.</p>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <label className="block text-xs font-medium text-zinc-300" htmlFor="architect-command">
              Registered command
            </label>
            <select
              id="architect-command"
              value={selectedCommandId}
              onChange={(event) => {
                setSelectedCommandId(event.target.value)
                setConfirmed(false)
                setReceipt(null)
              }}
              disabled={commands.length === 0 || executing}
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-300/30 focus:ring disabled:opacity-50"
            >
              {commands.length === 0 && <option value="">Connect to broker first</option>}
              {commands.map((command) => (
                <option key={command.id} value={command.id}>{command.label}</option>
              ))}
            </select>

            {selectedCommand && (
              <div className="mt-3 rounded-xl border border-white/8 bg-black/35 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-amber-100">{selectedCommand.id}</span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase text-zinc-400">
                    {selectedCommand.risk.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{selectedCommand.description}</p>
                <p className="mt-2 text-[11px] text-zinc-500">Timeout: {selectedCommand.timeoutSeconds}s</p>
              </div>
            )}

            <label className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-3 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                disabled={!selectedCommand || executing}
                className="mt-0.5"
              />
              <span>I authorize this exact registered command for this execution only.</span>
            </label>

            <button
              type="button"
              onClick={executeCommand}
              disabled={!selectedCommand || !confirmed || executing}
              className="mt-3 w-full rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {executing ? 'Executing…' : 'Execute registered command'}
            </button>
          </div>

          <div className="min-w-0 rounded-xl border border-white/8 bg-[#05070d] p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Execution receipt</h3>
              <button
                type="button"
                onClick={exportReceipt}
                disabled={!receipt}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-zinc-300 disabled:opacity-40"
              >
                Export JSON
              </button>
            </div>
            {!receipt ? (
              <p className="mt-4 text-xs text-zinc-500">No command has been executed in this session.</p>
            ) : (
              <div className="mt-3 space-y-3">
                <dl className="grid gap-2 text-[11px] text-zinc-300 sm:grid-cols-2">
                  <div><dt className="text-zinc-600">Receipt</dt><dd className="break-all font-mono">{receipt.receiptId}</dd></div>
                  <div><dt className="text-zinc-600">Status</dt><dd className={receipt.status === 'pass' ? 'text-emerald-200' : 'text-rose-200'}>{receipt.status}</dd></div>
                  <div><dt className="text-zinc-600">Exit code</dt><dd>{receipt.exitCode}</dd></div>
                  <div><dt className="text-zinc-600">Duration</dt><dd>{receipt.durationMs} ms</dd></div>
                  <div className="sm:col-span-2"><dt className="text-zinc-600">Result SHA-256</dt><dd className="break-all font-mono">{receipt.resultSha256}</dd></div>
                </dl>
                <div>
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-600">stdout</div>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/5 bg-black/50 p-3 text-xs leading-relaxed text-zinc-200">{receipt.stdout || '(empty)'}</pre>
                </div>
                {receipt.stderr && (
                  <div>
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-600">stderr</div>
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-rose-300/10 bg-rose-950/10 p-3 text-xs leading-relaxed text-rose-100">{receipt.stderr}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
