import { useQuery } from '@tanstack/react-query'
import { getVideoComparison } from '../api/mockApi'

export function useVideoComparison(videoId: number, profileName: string) {
  return useQuery({
    queryKey: ['comparison', videoId, profileName],
    queryFn: () => getVideoComparison(videoId, profileName),
    enabled: !!videoId && !!profileName,
  })
}
