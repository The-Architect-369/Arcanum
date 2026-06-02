import { StargateClient } from '@cosmjs/stargate'

export type ArcnetManaBalance = {
  address: string
  amount: string
}

export type ArcnetChaincodeAnchor = {
  tokenId: string
  owner: string
  metadata: string
}

function trimSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function getRpcEndpoint(explicit?: string) {
  return explicit || process.env.NEXT_PUBLIC_ARCANUM_RPC || 'http://127.0.0.1:26657'
}

function getApiEndpoint(explicit?: string) {
  const configured = explicit || process.env.NEXT_PUBLIC_ARCANUM_API || process.env.NEXT_PUBLIC_ARCANUM_REST
  if (configured) return trimSlash(configured)

  const rpc = getRpcEndpoint()
  try {
    const url = new URL(rpc)
    if (url.port === '26657') {
      url.port = '1317'
    } else if (!url.port) {
      url.port = '1317'
    }
    url.pathname = ''
    return trimSlash(url.toString())
  } catch {
    return 'http://127.0.0.1:1317'
  }
}

async function queryJSON<T>(path: string, options?: { api?: string; allowNotFound?: boolean }): Promise<T | null> {
  const response = await fetch(`${getApiEndpoint(options?.api)}${path}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (response.status === 404 && options?.allowNotFound) {
    return null
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `ARCnet query failed for ${path}`)
  }

  return await response.json() as T
}

export async function getBalance({ rpc, address, denom }:{rpc:string; address:string; denom:string}) {
  const client = await StargateClient.connect(getRpcEndpoint(rpc))
  return await client.getBalance(address, denom)
}

export async function getManaBalance({ address, api }: { address: string; api?: string }) {
  const data = await queryJSON<{ balance?: { address?: string; amount?: string } }>(
    `/arcanum/mana/v1/balance/${address}`,
    { api }
  )

  return {
    address: data?.balance?.address ?? address,
    amount: data?.balance?.amount ?? '0',
  } satisfies ArcnetManaBalance
}

export async function getManaSupply({ api }: { api?: string } = {}) {
  const data = await queryJSON<{ amount?: string }>(`/arcanum/mana/v1/supply`, { api })
  return data?.amount ?? '0'
}

export async function getChaincodeAnchor({ address, api }: { address: string; api?: string }) {
  const data = await queryJSON<{
    anchor?: {
      tokenId?: string
      token_id?: string
      owner?: string
      metadata?: string
    }
  }>(`/arcanum/chaincode/v1/sbi/${address}`, { api, allowNotFound: true })

  const anchor = data?.anchor
  if (!anchor) return null

  return {
    tokenId: anchor.tokenId ?? anchor.token_id ?? '',
    owner: anchor.owner ?? address,
    metadata: anchor.metadata ?? '',
  } satisfies ArcnetChaincodeAnchor
}
