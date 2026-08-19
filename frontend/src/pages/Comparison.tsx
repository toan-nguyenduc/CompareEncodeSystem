import { useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useVideoComparison } from '@/hooks/useQueries'
import { VMAFChart } from '@/components/comparison/VMAFChart'
import { SegmentSlider } from '@/components/comparison/SegmentSlider'
import { ComparisonPanel } from '@/components/comparison/ComparisonPanel'
import { useComparisonStore } from '@/store/useComparisonStore'

export function Comparison() {
  const { videoId } = useParams<{ videoId: string }>()
  const [searchParams] = useSearchParams()
  const profileName = searchParams.get('profile')
  const navigate = useNavigate()

  const setVisibleEndSegment = useComparisonStore(state => state.setVisibleEndSegment)

  useEffect(() => {
    return () => setVisibleEndSegment(null)
  }, [setVisibleEndSegment])

  const { data: comparisonData, isLoading, error } = useVideoComparison(
    Number(videoId),
    profileName || ''
  )

  // In a real system, the video title might be returned inside the comparison data or a separate /video/:id API.
  // For now, since VideoList was removed, we use a fallback title.
  const videoTitle = `Video ${videoId}`

  if (!videoId || !profileName) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center text-rose-500">
        Missing video ID or profile name in URL.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading comparison data...</p>
      </div>
    )
  }

  if (error || !comparisonData) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center text-rose-500">
        Failed to load comparison data.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex-1">
            <h1
              className="text-lg font-bold text-gray-900 truncate leading-tight"
              title={videoTitle}
            >
              {videoTitle}
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                {profileName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container max-w-7xl mx-auto px-6 py-8 space-y-6">
        <VMAFChart data={comparisonData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SegmentSlider data={comparisonData} />
          <ComparisonPanel data={comparisonData} />
        </div>
      </div>
    </div>
  )
}
