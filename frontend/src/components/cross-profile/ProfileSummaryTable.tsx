import { Link } from 'react-router-dom'
import { VideoComparison } from '@/api/types'
import { ChevronRight } from 'lucide-react'

interface ProfileSummaryTableProps {
  data: VideoComparison[]
  showOldSystem: boolean
}

export function ProfileSummaryTable({ data, showOldSystem }: ProfileSummaryTableProps) {
  // Sort profiles by name (e.g. 1080p, 360p, 720p - actually we might want to sort by resolution or size)
  // Simple alphabetical sort for now
  const sortedData = [...data].sort((a, b) => a.profile_name.localeCompare(b.profile_name))

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
              <th className="px-6 py-4">Profile</th>
              
              {showOldSystem ? (
                <>
                  <th className="px-6 py-4">Old Avg VMAF</th>
                  <th className="px-6 py-4">PE Avg VMAF</th>
                  <th className="px-6 py-4">Δ VMAF</th>
                  <th className="px-6 py-4">Old Size</th>
                  <th className="px-6 py-4">PE Size</th>
                  <th className="px-6 py-4">% Savings</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4">PE Avg VMAF</th>
                  <th className="px-6 py-4">PE Min VMAF</th>
                  <th className="px-6 py-4">PE Total Size</th>
                  <th className="px-6 py-4">Stability</th>
                </>
              )}
              
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((profile) => {
              // Calculate metrics
              let totalOldVmaf = 0
              let totalNewVmaf = 0
              let totalOldSize = 0
              let totalNewSize = 0
              let minNewVmaf = 100
              
              profile.segments.forEach(seg => {
                totalOldVmaf += seg.old.vmaf_mean
                totalNewVmaf += seg.new.vmaf_mean
                totalOldSize += seg.old.file_size
                totalNewSize += seg.new.file_size
                if (seg.new.vmaf_min < minNewVmaf) minNewVmaf = seg.new.vmaf_min
              })

              const avgOldVmaf = totalOldVmaf / profile.segments.length
              const avgNewVmaf = totalNewVmaf / profile.segments.length
              const vmafDiff = avgNewVmaf - avgOldVmaf
              const savingsPercent = totalOldSize > 0 ? (1 - totalNewSize / totalOldSize) * 100 : 0
              
              // Simple stability metric: min/avg ratio
              const stability = minNewVmaf / avgNewVmaf

              return (
                <tr key={profile.profile_name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {profile.profile_name}
                  </td>
                  
                  {showOldSystem ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 tabular-nums">
                        {avgOldVmaf.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tabular-nums">
                        {avgNewVmaf.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm tabular-nums">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vmafDiff >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {vmafDiff >= 0 ? '+' : ''}{vmafDiff.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 tabular-nums">
                        {formatBytes(totalOldSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tabular-nums">
                        {formatBytes(totalNewSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm tabular-nums">
                        <span className={`font-medium ${savingsPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {savingsPercent > 0 ? '-' : '+'}{Math.abs(savingsPercent).toFixed(1)}%
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tabular-nums">
                        {avgNewVmaf.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 tabular-nums">
                        {minNewVmaf.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tabular-nums">
                        {formatBytes(totalNewSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm tabular-nums">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${stability >= 0.9 ? 'bg-green-500' : stability >= 0.8 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${stability * 100}%` }}
                            />
                          </div>
                          <span className="text-gray-500 text-xs">{stability.toFixed(2)}</span>
                        </div>
                      </td>
                    </>
                  )}
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/comparison/${profile.video_id}?profile=${profile.profile_name}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Chi tiết <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
