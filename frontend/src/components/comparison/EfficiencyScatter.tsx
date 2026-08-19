import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { VideoComparison } from '@/api/types'

interface EfficiencyScatterProps {
  data: VideoComparison
}

export function EfficiencyScatter({ data }: EfficiencyScatterProps) {
  const option = useMemo(() => {
    const oldScatterData = data.segments.map(s => [
      s.old.vmaf_mean,
      Number((s.old.file_size / 1024).toFixed(1)),
      s.segment_index
    ])
    const newScatterData = data.segments.map(s => [
      s.new.vmaf_mean,
      Number((s.new.file_size / 1024).toFixed(1)),
      s.segment_index
    ])

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'VMAF vs File Size Efficiency',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <div class="text-sm font-medium mb-1">${params.seriesName}</div>
            <div class="text-xs text-gray-500">Segment: <span class="font-bold text-gray-900">${params.data[2]}</span></div>
            <div class="text-xs text-gray-500">VMAF Mean: <span class="font-bold text-gray-900">${params.data[0]}</span></div>
            <div class="text-xs text-gray-500">Size: <span class="font-bold text-gray-900">${params.data[1]} KB</span></div>
          `
        }
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
        type: 'value',
        name: 'VMAF Score',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: '#111827', fontWeight: 'bold', fontSize: 11 },
        scale: true,
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'value',
        name: 'Size (KB)',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: { color: '#111827', fontWeight: 'bold', fontSize: 11 },
        scale: true,
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [
        {
          name: 'Old System',
          type: 'scatter',
          data: oldScatterData,
          itemStyle: { color: '#9ca3af', opacity: 0.7 }
        },
        {
          name: 'PE',
          type: 'scatter',
          data: newScatterData,
          itemStyle: { color: '#3b82f6', opacity: 0.7 }
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
