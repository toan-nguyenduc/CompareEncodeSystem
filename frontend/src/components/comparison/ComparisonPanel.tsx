import { VideoComparison } from '@/api/types'
import { useComparisonStore } from '@/store/useComparisonStore'

interface ComparisonPanelProps {
  data: VideoComparison
}

export function ComparisonPanel({ data }: ComparisonPanelProps) {
  const hoveredSegmentIndex = useComparisonStore(state => state.hoveredSegmentIndex)
  const focusedSeries = useComparisonStore(state => state.focusedSeries)

  // Find the hovered segment, but don't fallback to the last segment. If null, it's null.
  const segment = hoveredSegmentIndex !== null
    ? data.segments.find(s => s.segment_index === hoveredSegmentIndex)
    : null

  let fileSizeUnit = 'KB'
  let oldSizeFormatted = '_ _'
  let newSizeFormatted = '_ _'

  if (segment) {
    const maxBytes = Math.max(segment.old.file_size, segment.new.file_size)
    if (maxBytes > 0) {
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(maxBytes) / Math.log(k))
      fileSizeUnit = sizes[i] || 'B'
      
      oldSizeFormatted = (segment.old.file_size / Math.pow(k, i)).toFixed(2)
      newSizeFormatted = (segment.new.file_size / Math.pow(k, i)).toFixed(2)
    } else {
      fileSizeUnit = 'B'
      oldSizeFormatted = '0.00'
      newSizeFormatted = '0.00'
    }
  }

  const rows = [
    {
      label: 'VMAF Mean',
      color: '#3b82f6',
      old: segment ? segment.old.vmaf_mean.toFixed(2) : '_ _',
      new: segment ? segment.new.vmaf_mean.toFixed(2) : '_ _',
      relatedSeries: ['Mean']
    },
    {
      label: 'VMAF Min',
      color: '#f59e0b',
      old: segment ? segment.old.vmaf_min.toFixed(2) : '_ _',
      new: segment ? segment.new.vmaf_min.toFixed(2) : '_ _',
      relatedSeries: ['Min']
    },
    {
      label: 'VMAF Max',
      color: '#10b981',
      old: segment ? segment.old.vmaf_max.toFixed(2) : '_ _',
      new: segment ? segment.new.vmaf_max.toFixed(2) : '_ _',
      relatedSeries: ['Max']
    },
    {
      label: `File Size (${fileSizeUnit})`,
      color: '#6b7280',
      old: oldSizeFormatted,
      new: newSizeFormatted,
      relatedSeries: [] // File size is always shown unless a specific VMAF series is focused
    },
  ]

  // Filter rows if a specific series is focused
  const visibleRows = focusedSeries
    ? rows.filter(r => r.relatedSeries.includes(focusedSeries))
    : rows

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Hovered Segment:{' '}
          <span className="text-blue-600">{segment ? segment.segment_index : '_ _'}</span>
        </h3>
        <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Old System vs PE</span>
      </div>

      {/* Metrics table */}
      <div className="px-5 py-4 flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100">
              <th className="text-left pb-2.5 font-semibold">Metric</th>
              <th className="text-right pb-2.5 font-semibold w-[80px]">Old System</th>
              <th className="text-right pb-2.5 font-semibold w-[80px]">PE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visibleRows.map(row => (
              <tr key={row.label}>
                <td className="py-3 font-medium text-sm" style={{ color: row.color }}>
                  {row.label}
                </td>
                <td className="py-3 text-right text-gray-600 tabular-nums text-sm w-[80px]">{row.old}</td>
                <td className="py-3 text-right text-gray-800 tabular-nums text-sm font-medium w-[80px]">{row.new}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
