import { useState, ReactNode } from 'react'
import Sidebar from '../Sidebar'

export default function Layout({ children } : { children: ReactNode } ) {
    const [isConnected, setIsConnected] = useState(true)

    return (
      <>
        {
            isConnected ?
            <Sidebar>
                {children}
            </Sidebar> :
            <div>{children}</div>
        }
      </>
    )
}
