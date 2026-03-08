import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import {
  selectTxEvent,
  selectBlocks,
  selectTotalActiveValidator,
  setTotalActiveValidator,
} from '@/store/streamSlice'
import { selectTmClient } from '@/store/connectSlice'
import { queryActiveValidators } from '@/rpc/abci'

export const useHomeData = () => {
  const dispatch = useDispatch()
  const { connectState } = useSelector((state: RootState) => state.connect)
  const tmClient = useSelector(selectTmClient)
  const totalActiveValidator = useSelector(selectTotalActiveValidator)
  const persistentBlocks = useSelector(selectBlocks)
  const txEvent = useSelector(selectTxEvent)
  
  const [isLoading, setIsLoading] = useState(true)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [blockTime, setBlockTime] = useState('--')

  const isConnected = connectState

  // Real blockchain data - get latest block from persistent blocks
  const latestBlock =
    persistentBlocks.length > 0
      ? parseInt(persistentBlocks[0].header.height)
      : null

  // Calculate average block time based on first and most recent blocks
  useEffect(() => {
    if (persistentBlocks.length >= 2) {
      const recentBlock = persistentBlocks[0] // Most recent block
      const firstBlock = persistentBlocks[persistentBlocks.length - 1] // Oldest block in the array

      const recentHeight = parseInt(recentBlock.header.height)
      const firstHeight = parseInt(firstBlock.header.height)
      const recentTime = new Date(recentBlock.header.time).getTime()
      const firstTime = new Date(firstBlock.header.time).getTime()

      const heightDiff = recentHeight - firstHeight
      const timeDiff = (recentTime - firstTime) / 1000 // Convert to seconds

      if (heightDiff > 0) {
        const avgBlockTime = timeDiff / heightDiff
        setBlockTime(`${avgBlockTime.toFixed(1)}s`)
      }
    } else if (persistentBlocks.length === 1) {
      // Fallback to default when only one block is available
      setBlockTime('--')
    }
  }, [persistentBlocks])

  // Count transactions
  useEffect(() => {
    if (txEvent) {
      setTotalTransactions((prev) => prev + 1)
    }
  }, [txEvent])

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Fetch active validators if connected
    if (tmClient) {
      queryActiveValidators(tmClient, 0, 10).then((response) => {
        if (response.pagination?.total) {
          dispatch(setTotalActiveValidator(Number(response.pagination.total)))
        }
      })
    }

    return () => clearTimeout(timer)
  }, [tmClient, dispatch])

  return {
    isConnected,
    isLoading,
    latestBlock,
    totalTransactions,
    blockTime,
    totalActiveValidator,
  }
}
