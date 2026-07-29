export type ArchitectCommandRisk = 'read_only' | 'verification'

export type ArchitectCommandDescriptor = {
  id: string
  label: string
  description: string
  risk: ArchitectCommandRisk
  timeoutSeconds: number
}

export type ArchitectBrokerHealth = {
  schemaVersion: '1.0'
  service: 'arcanum-termux-broker'
  status: 'ready'
  repository: string
  branch: string | null
  commit: string | null
  commands: ArchitectCommandDescriptor[]
  startedAt: string
}

export type ArchitectExecutionRequest = {
  schemaVersion: '1.0'
  commandId: string
  approvedByHumanArchitect: true
  requestedAt: string
}

export type ArchitectExecutionReceipt = {
  schemaVersion: '1.0'
  receiptType: 'architect_execution_receipt'
  receiptId: string
  command: ArchitectCommandDescriptor
  repository: string
  branch: string | null
  commitBefore: string | null
  commitAfter: string | null
  startedAt: string
  completedAt: string
  durationMs: number
  exitCode: number
  stdout: string
  stderr: string
  stdoutTruncated: boolean
  stderrTruncated: boolean
  requestSha256: string
  resultSha256: string
  status: 'pass' | 'fail'
}

export type ArchitectBrokerError = {
  schemaVersion: '1.0'
  error: string
  detail?: string
}

export const DEFAULT_ARCHITECT_BROKER_URL = 'http://127.0.0.1:8765'
