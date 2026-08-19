import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { DashboardVideoSummary } from '@/api/types'

interface TrendChartProps {
  data: DashboardVideoSummary[]
}

export function TrendChart({ data }: TrendChartProps) {
  const option = useMemo(() => {
    const videoNames = data.map(d => d.videoName)
    const oldVmaf = data.map(d => d.avgVmafOld)
    const newVmaf = data.map(d => d.avgVmafNew)

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'VMAF Trend Across Videos',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Old System', 'PE'],
        top: 12,
        right: 16,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: '#6b7280', fontSize: 12 }
      },
      grid: { left: 40, right: 24, bottom: 24, top: 50, containLabel: false },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: videoNames,
        axisLabel: { color: '#9ca3af', fontSize: 10, show: false }, // Hide labels if too many
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 'dataMin',
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [
        {
          name: 'Old System',
          type: 'line',
          data: oldVmaf,
          itemStyle: { color: '#9ca3af' },
          lineStyle: { width: 2, type: 'dashed' },
          symbol: 'none'
        },
        {
          name: 'PE',
          type: 'line',
          data: newVmaf,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 2 },
          symbol: 'circle',
          symbolSize: 4
        }
      ]
    }
  }, [data])

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
