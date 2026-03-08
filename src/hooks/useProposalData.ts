import { useEffect, useState } from 'react'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1/gov'
import { queryProposalById } from '@/rpc/abci'
import { useClientStore } from '@/store/clientStore'

export const useProposalData = (id: string | undefined) => {
  const tmClient = useClientStore((state) => state.tmClient)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tmClient && id) {
      setIsLoading(true)
      setError(null)
      queryProposalById(tmClient, parseInt(id))
        .then((response) => {
          if (response.proposal) {
            setProposal(response.proposal)
          } else {
            setError('Proposal not found')
          }
        })
        .catch((err) => {
          console.error('Error fetching proposal:', err)
          setError('Failed to fetch proposal details')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [tmClient, id])

  return {
    proposal,
    isLoading,
    error,
  }
}
