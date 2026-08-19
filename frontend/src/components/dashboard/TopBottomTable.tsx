import { Link } from 'react-router-dom'
import { DashboardVideoSummary } from '@/api/types'
import { ChevronRight } from 'lucide-react'

interface TopBottomTableProps {
  data: DashboardVideoSummary[]
}

export function TopBottomTable({ data }: TopBottomTableProps) {
  // Sort data by VMAF improvement (Δ VMAF)
  const sortedData = [...data].sort((a, b) => {
    const diffA = a.avgVmafNew - a.avgVmafOld
    const diffB = b.avgVmafNew - b.avgVmafOld
    return diffB - diffA // descending
  })

  // Top 5 and Bottom 5 (or less if fewer videos)
  const topList = sortedData.slice(0, 5)
  const bottomList = sortedData.slice(-5).reverse() // reverse to show worst at the top of bottom list

  const renderTable = (title: string, list: DashboardVideoSummary[], isTop: boolean) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${isTop ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isTop ? 'Highest Δ VMAF' : 'Lowest Δ VMAF'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
              <th className="px-5 py-3">Video</th>
              <th className="px-5 py-3">Δ VMAF</th>
              <th className="px-5 py-3">Savings</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((item) => {
              const diff = item.avgVmafNew - item.avgVmafOld
              const savings = item.totalSizeOldBytes > 0 ? ((item.totalSizeOldBytes - item.totalSizeNewBytes) / item.totalSizeOldBytes) * 100 : 0
              
              return (
                <tr key={item.videoId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[200px]" title={item.videoName}>
                    {item.videoName}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm tabular-nums">
                    <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm tabular-nums">
                    <span className={savings >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {savings > 0 ? '+' : ''}{savings.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-right text-sm">
                    <Link
                      to={`/cross-profile/${item.videoId}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View <ChevronRight className="w-4 h-4 ml-0.5" />
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {renderTable('Top 5 Performers', topList, true)}
      {renderTable('Bottom 5 Performers', bottomList, false)}
    </div>
  )
}
