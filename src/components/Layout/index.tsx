import { useState, ReactNode } from 'react'
import Sidebar from '../Sidebar'
import Connect from '../Connect'

export default function Layout({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <>
      {isConnected ? (
        <Sidebar>{children}</Sidebar>
      ) : (
        <div>
          <Connect />
        </div>
      )}
    </>
  )
}
