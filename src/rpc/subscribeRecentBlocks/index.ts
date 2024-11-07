// Import WebSocket type from ws package for Node.js
import WS from 'ws'

// Create a type that includes only the methods we need from both WebSocket implementations
interface CommonWebSocket {
  send(data: string): void
  close(): void
  readyState: number
}

// Define the base WebSocket type that works for both browser and Node.js
type WebSocketType = CommonWebSocket & (WebSocket | WS)

type BlockHeaderEvent = {
  result?: {
    data?: {
      value?: {
        header?: {
          height: string
          chain_id: string
          time: string
          data_hash: string
          proposer_address: string
          last_block_id?: {
            hash: string
          }
        }
      }
    }
  }
}

const createWebSocketConnection = (url: string): WebSocketType => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.WebSocket) {
    return new window.WebSocket(url) as WebSocketType
  } else {
    // Node.js environment
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

const handleMessage = (event: MessageEvent | WS.Data): void => {
  try {
    // Handle both browser MessageEvent and Node.js WebSocket data
    const data = event instanceof MessageEvent ? event.data : event
    const parsedEvent = JSON.parse(
      typeof data === 'string' ? data : data.toString()
    ) as BlockHeaderEvent

    console.log('\n=== New Block Header Event ===')
    console.log(JSON.stringify(parsedEvent, null, 2))

    if (parsedEvent.result?.data?.value?.header) {
      const header = parsedEvent.result.data.value.header
      console.log('\n=== Block Header Details ===')
      console.log(`Height: ${header.height}`)
      console.log(`Chain ID: ${header.chain_id}`)
      console.log(`Time: ${header.time}`)
      console.log(`Proposer Address: ${header.proposer_address}`)
      console.log(`Last Block ID: ${header.last_block_id?.hash}`)
      console.log(`Block Hash: ${header.last_block_id?.hash}`)
      console.log(`Data Hash: ${header?.data_hash}`)
    }
  } catch (error) {
    console.error('Error parsing message:', error)
  }
}

const setupWebSocketListeners = (ws: WebSocketType): void => {
  const browserWS = ws as WebSocket
  const nodeWS = ws as WS

  // Browser environment
  if (typeof window !== 'undefined' && window.WebSocket) {
    browserWS.onopen = () => {
      console.log('Connected to WebSocket')
      subscribeToBlockHeaders(ws)
    }

    browserWS.onmessage = (event: MessageEvent) => handleMessage(event)

    browserWS.onerror = (error: Event) => {
      console.error('WebSocket error:', error)
    }

    browserWS.onclose = () => {
      console.log('WebSocket connection closed')
    }
  } else {
    // Node.js environment
    nodeWS.on('open', () => {
      console.log('Connected to WebSocket')
      subscribeToBlockHeaders(ws)
    })

    nodeWS.on('message', (data: WS.Data) => handleMessage(data))

    nodeWS.on('error', (error: Error) => {
      console.error('WebSocket error:', error)
    })

    nodeWS.on('close', () => {
      console.log('WebSocket connection closed')
    })
  }
}

export const startBlockMonitor = (
  wsUrl: string = 'ws://146.190.149.75:26657/websocket'
): (() => void) => {
  const ws = createWebSocketConnection(wsUrl)
  setupWebSocketListeners(ws)

  // Return cleanup function
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close()
    }
  }
}

export default startBlockMonitor
