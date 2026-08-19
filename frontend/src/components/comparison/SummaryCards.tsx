import { VideoComparison } from '@/api/types'
import { Activity, HardDrive, Zap, AlertTriangle } from 'lucide-react'

interface SummaryCardsProps {
  data: VideoComparison
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const { segments } = data
  
  if (!segments || segments.length === 0) return null

  // Calculate metrics
  let totalOldVmaf = 0
  let totalNewVmaf = 0
  let totalOldSize = 0
  let totalNewSize = 0
  let worstNewVmaf = 100
  let worstNewVmafSegment = 0
  let peWins = 0

  for (const seg of segments) {
    totalOldVmaf += seg.old.vmaf_mean
    totalNewVmaf += seg.new.vmaf_mean
    totalOldSize += seg.old.file_size
    totalNewSize += seg.new.file_size

    if (seg.new.vmaf_min < worstNewVmaf) {
      worstNewVmaf = seg.new.vmaf_min
      worstNewVmafSegment = seg.segment_index
    }

    if (seg.new.vmaf_mean > seg.old.vmaf_mean) {
      peWins++
    }
  }

  const avgOldVmaf = totalOldVmaf / segments.length
  const avgNewVmaf = totalNewVmaf / segments.length
  const vmafDiff = avgNewVmaf - avgOldVmaf
  
  const sizeSavingsPercent = totalOldSize > 0 ? (1 - totalNewSize / totalOldSize) * 100 : 0
  
  const winRate = (peWins / segments.length) * 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Avg VMAF */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Average VMAF</h3>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-gray-900">{avgNewVmaf.toFixed(2)}</span>
          <span className="text-sm text-gray-500">/ 100</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">vs Old: {avgOldVmaf.toFixed(2)}</span>
          <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${vmafDiff >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {vmafDiff >= 0 ? '+' : ''}{vmafDiff.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Card 2: Size Savings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <HardDrive className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Size Savings</h3>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-gray-900">{sizeSavingsPercent.toFixed(1)}%</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">Total reduction</span>
          <span className={`font-medium ${sizeSavingsPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {sizeSavingsPercent > 0 ? 'Smaller' : 'Larger'}
          </span>
        </div>
      </div>

      {/* Card 3: PE Win Rate */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Positive ΔVMAF Ratio</h3>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-gray-900">{winRate.toFixed(1)}%</span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          PE has better VMAF in {peWins} of {segments.length} segments
        </div>
      </div>

      {/* Card 4: Worst Segment */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Worst Segment (PE)</h3>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-gray-900">{worstNewVmaf.toFixed(2)}</span>
          <span className="text-sm text-gray-500">min VMAF</span>
        </div>
        <div className="mt-2 text-sm text-gray-500 flex justify-between">
          <span>Found at segment</span>
          <span className="font-semibold text-gray-700">#{worstNewVmafSegment}</span>
        </div>
      </div>
    </div>
  )
}
