import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useVideoAllProfiles } from '@/hooks/useQueries'
import { ProfileSummaryTable } from '@/components/cross-profile/ProfileSummaryTable'
import { ProfileBarChart } from '@/components/cross-profile/ProfileBarChart'
import { ProfileRadarChart } from '@/components/cross-profile/ProfileRadarChart'

export function CrossProfile() {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  const [showOldSystem, setShowOldSystem] = useState(false)

  const { data: profilesData, isLoading, error } = useVideoAllProfiles(Number(videoId))

  const videoTitle = `Video ${videoId}`

  if (!videoId) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center text-rose-500">
        Missing video ID in URL.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading profiles data...</p>
      </div>
    )
  }

  if (error || !profilesData || profilesData.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center text-rose-500">
        Failed to load profiles data.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 truncate leading-tight">
                {videoTitle} - Cross Profile Analysis
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-sm font-medium text-gray-600">Compare with Old System</span>
            <button 
              onClick={() => setShowOldSystem(!showOldSystem)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${showOldSystem ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOldSystem ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container max-w-7xl mx-auto px-6 py-8 space-y-6">
        <ProfileSummaryTable data={profilesData} showOldSystem={showOldSystem} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfileBarChart data={profilesData} showOldSystem={showOldSystem} />
          <ProfileRadarChart data={profilesData} showOldSystem={showOldSystem} />
        </div>
      </div>
    </div>
  )
}
