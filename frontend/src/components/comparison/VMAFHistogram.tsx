import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { VideoComparison } from '@/api/types'

interface VMAFHistogramProps {
  data: VideoComparison
}

export function VMAFHistogram({ data }: VMAFHistogramProps) {
  const option = useMemo(() => {
    // Manually bucket into ranges of 5 (e.g., 60-65, 65-70... 95-100)
    const minScore = Math.floor(
      Math.min(...data.segments.map(s => Math.min(s.old.vmaf_mean, s.new.vmaf_mean))) / 5
    ) * 5

    const bins: string[] = []
    const oldCounts: Record<string, number> = {}
    const newCounts: Record<string, number> = {}

    for (let i = minScore; i <= 100; i += 5) {
      const binLabel = `${i}-${i + 5}`
      bins.push(binLabel)
      oldCounts[binLabel] = 0
      newCounts[binLabel] = 0
    }

    data.segments.forEach(s => {
      // old
      let oldBinStart = Math.floor(s.old.vmaf_mean / 5) * 5
      if (oldBinStart > 95) oldBinStart = 95
      oldCounts[`${oldBinStart}-${oldBinStart + 5}`]++

      // new
      let newBinStart = Math.floor(s.new.vmaf_mean / 5) * 5
      if (newBinStart > 95) newBinStart = 95
      newCounts[`${newBinStart}-${newBinStart + 5}`]++
    })

    const oldData = bins.map(b => oldCounts[b])
    const newData = bins.map(b => newCounts[b])

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'VMAF Distribution',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Old System', 'PE'],
        top: 12,
        right: 16,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: '#6b7280', fontSize: 12 }
      },
      grid: { left: 55, right: 24, bottom: 45, top: 50, containLabel: false },
      xAxis: {
        type: 'category',
        name: 'VMAF Score Range',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: '#111827', fontWeight: 'bold', fontSize: 11 },
        data: bins,
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'Segments Count',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: { color: '#111827', fontWeight: 'bold', fontSize: 11 },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [
        {
          name: 'Old System',
          type: 'bar',
          data: oldData,
          barGap: '-100%', // Overlap bars to see distribution
          itemStyle: { color: 'rgba(156, 163, 175, 0.5)' }
        },
        {
          name: 'PE',
          type: 'bar',
          data: newData,
          itemStyle: { color: 'rgba(59, 130, 246, 0.5)' }
        }
      ]
    }
  }, [data.segments])

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[300px]">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}
