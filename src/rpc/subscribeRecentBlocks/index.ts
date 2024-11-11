import WS from 'ws'

interface CommonWebSocket {
  send(data: string): void
  close(): void
  readyState: number
}

type WebSocketType = CommonWebSocket & (WebSocket | WS)

export type BlockHeaderEvent = {
  result?: {
    data?: {
      value?: {
        header?: BlockHeader
      }
    }
  }
}

export interface BlockHeader {
  version: { block: string }
  chain_id: string
  height: string
  time: string
  last_block_id: {
    hash: string
    parts: {
      total: number
      hash: string
    }
  }
  last_commit_hash: string
  data_hash: string
  validators_hash: string
  next_validators_hash: string
  consensus_hash: string
  app_hash: string
  last_results_hash: string
  evidence_hash: string
  proposer_address: string
}

const createWebSocketConnection = (url: string): WebSocketType => {
  if (typeof window !== 'undefined' && window.WebSocket) {
    return new window.WebSocket(url) as WebSocketType
  } else {
    const WebSocket = require('ws')
    return new WebSocket(url) as WebSocketType
  }
}

const subscribeToBlockHeaders = (ws: WebSocketType): void => {
  const subscriptionMessage = {
    jsonrpc: '2.0',
    method: 'subscribe',
    id: 2,
    params: {
      query: "tm.event='NewBlockHeader'",
    },
  }
  ws.send(JSON.stringify(subscriptionMessage))
}

const handleMessage = (
  event: MessageEvent | WS.Data,
  onData: (header: BlockHeader) => void
): void => {
  try {
    const data = event instanceof MessageEvent ? event.data : event
    const parsedEvent = JSON.parse(
      typeof data === 'string' ? data : data.toString()
    ) as BlockHeaderEvent

    const header = parsedEvent.result?.data?.value?.header
    if (header) {
      onData(header)
    }
  } catch (error) {
    console.error('Error parsing message:', error)
  }
}

const setupWebSocketListeners = (
  ws: WebSocketType,
  onData: (header: BlockHeader) => void
): void => {
  const browserWS = ws as WebSocket
  const nodeWS = ws as WS

  if (typeof window !== 'undefined' && window.WebSocket) {
    browserWS.onopen = () => {
      console.log('Connected to WebSocket')
      subscribeToBlockHeaders(ws)
    }
    browserWS.onmessage = (event: MessageEvent) => handleMessage(event, onData)
    browserWS.onerror = (error: Event) =>
      console.error('WebSocket error:', error)
    browserWS.onclose = () => console.log('WebSocket connection closed')
  } else {
    nodeWS.on('open', () => {
      console.log('Connected to WebSocket')
      subscribeToBlockHeaders(ws)
    })
    nodeWS.on('message', (data: WS.Data) => handleMessage(data, onData))
    nodeWS.on('error', (error: Error) =>
      console.error('WebSocket error:', error)
    )
    nodeWS.on('close', () => console.log('WebSocket connection closed'))
  }
}

export const startBlockMonitor = (
  wsUrl: string = 'wss://rpc.devnet.surge.dev/websocket',
  onData: (header: BlockHeader) => void
): (() => void) => {
  const ws = createWebSocketConnection(wsUrl)
  setupWebSocketListeners(ws, onData)

  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close()
    }
  }
}

export default startBlockMonitor
