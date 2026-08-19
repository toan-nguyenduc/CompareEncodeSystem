import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import { useDashboardSummary } from '@/hooks/useQueries'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { WinRateChart } from '@/components/dashboard/WinRateChart'
import { SavingsHistogram } from '@/components/dashboard/SavingsHistogram'
import { VideoScatter } from '@/components/dashboard/VideoScatter'
import { TopBottomTable } from '@/components/dashboard/TopBottomTable'
import { ProfileHeatmap } from '@/components/dashboard/ProfileHeatmap'

export function Dashboard() {
  const navigate = useNavigate()
  const { data: summaryData, isLoading, error } = useDashboardSummary()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading dashboard data...</p>
      </div>
    )
  }

  if (error || !summaryData) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center text-rose-500">
        Failed to load dashboard data.
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
          
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900 truncate leading-tight">
              Aggregate Dashboard
            </h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrendChart data={summaryData} />
          </div>
          <div className="lg:col-span-1">
            <WinRateChart data={summaryData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SavingsHistogram data={summaryData} />
          <VideoScatter data={summaryData} />
        </div>

        <ProfileHeatmap />

        <TopBottomTable data={summaryData} />
      </div>
    </div>
  )
}
