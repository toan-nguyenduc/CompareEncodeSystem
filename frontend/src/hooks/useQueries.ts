import { useQuery } from '@tanstack/react-query'
import { getVideoComparison, getVideoAllProfiles, getDashboardSummary } from '../api/mockApi'

export function useVideoComparison(videoId: number, profileName: string) {
  return useQuery({
    queryKey: ['comparison', videoId, profileName],
    queryFn: () => getVideoComparison(videoId, profileName),
    enabled: !!videoId && !!profileName,
  })
}

export function useVideoAllProfiles(videoId: number) {
  return useQuery({
    queryKey: ['profiles', videoId],
    queryFn: () => getVideoAllProfiles(videoId),
    enabled: !!videoId,
  })
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(),
  })
}
