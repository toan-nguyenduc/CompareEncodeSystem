import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'

export function ProfileHeatmap() {
  const option = useMemo(() => {
    // This is static mock data for the fallback heatmap
    // since the current DashboardVideoSummary API does not provide per-profile data
    const profiles = ['360p_h264', '720p_h264', '1080p_h264']
    const metrics = ['Δ VMAF', 'Size Savings %', 'Win Rate %']

    // Data format: [metricIndex, profileIndex, value]
    const data = [
      [0, 0, 0.8], [0, 1, 12.5], [0, 2, 85], // 360p
      [1, 0, 1.2], [1, 1, 15.2], [1, 2, 92], // 720p
      [2, 0, -0.5], [2, 1, 8.4], [2, 2, 45], // 1080p
    ]

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'Profile Performance Heatmap (Mock)',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const profile = profiles[params.data[0]]
          const metric = metrics[params.data[1]]
          const val = params.data[2]
          return `<div class="font-medium">${profile}</div><div class="text-sm">${metric}: <b>${val}</b></div>`
        }
      },
      grid: {
        left: 80,
        right: 40,
        bottom: 24,
        top: 60,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: metrics,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#6b7280', fontSize: 11 }
      },
      yAxis: {
        type: 'category',
        data: profiles,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#4b5563', fontSize: 11, fontWeight: 500 }
      },
      visualMap: {
        min: -5,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        show: false, // Hide visual map legend to save space
        inRange: {
          color: ['#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#d1fae5', '#a7f3d0', '#34d399', '#10b981']
        }
      },
      series: [{
        name: 'Profile Heatmap',
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          color: '#374151',
          fontSize: 12
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      }]
    }
  }, [])

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
