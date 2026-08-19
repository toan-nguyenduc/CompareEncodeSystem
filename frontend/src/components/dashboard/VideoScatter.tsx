import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardVideoSummary } from '@/api/types'

interface VideoScatterProps {
  data: DashboardVideoSummary[]
}

export function VideoScatter({ data }: VideoScatterProps) {
  const navigate = useNavigate()

  const option = useMemo(() => {
    const scatterData = data.map(d => {
      const vmafDiff = d.avgVmafNew - d.avgVmafOld
      const sizeSavings = d.totalSizeOldBytes > 0 
        ? ((d.totalSizeOldBytes - d.totalSizeNewBytes) / d.totalSizeOldBytes) * 100 
        : 0

      // Quadrants:
      // Q1 (Top Right): Positive VMAF, Positive Savings (Best)
      // Q2 (Top Left): Negative VMAF, Positive Savings (Compromise)
      // Q3 (Bottom Left): Negative VMAF, Negative Savings (Worst)
      // Q4 (Bottom Right): Positive VMAF, Negative Savings (Compromise)
      let color = '#d1d5db' // gray
      if (vmafDiff >= 0 && sizeSavings >= 0) color = '#10b981' // green
      else if (vmafDiff < 0 && sizeSavings < 0) color = '#ef4444' // red
      else if (vmafDiff >= 0 && sizeSavings < 0) color = '#f59e0b' // yellow
      else if (vmafDiff < 0 && sizeSavings >= 0) color = '#8b5cf6' // purple

      return {
        name: d.videoName,
        value: [Number(vmafDiff.toFixed(2)), Number(sizeSavings.toFixed(2)), d.videoId],
        itemStyle: { color }
      }
    })

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'VMAF Diff vs Size Savings',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <div class="font-medium text-gray-900 mb-1">${params.data.name}</div>
            <div class="text-xs text-gray-500">Δ VMAF: <span class="font-semibold ${params.data.value[0] >= 0 ? 'text-green-600' : 'text-red-600'}">${params.data.value[0] > 0 ? '+' : ''}${params.data.value[0]}</span></div>
            <div class="text-xs text-gray-500">Savings: <span class="font-semibold ${params.data.value[1] >= 0 ? 'text-green-600' : 'text-red-600'}">${params.data.value[1] > 0 ? '+' : ''}${params.data.value[1]}%</span></div>
            <div class="text-[10px] text-gray-400 mt-2">Click to view details</div>
          `
        }
      },
      grid: { left: 45, right: 24, bottom: 40, top: 50, containLabel: false },
      xAxis: {
        type: 'value',
        name: 'Δ VMAF',
        nameLocation: 'middle',
        nameGap: 24,
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'value',
        name: 'Savings (%)',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [
        {
          name: 'Videos',
          type: 'scatter',
          data: scatterData,
          symbolSize: 8,
          markLine: {
            animation: false,
            lineStyle: { type: 'solid', color: '#e5e7eb' },
            data: [
              { xAxis: 0, label: { show: false }, symbol: 'none' },
              { yAxis: 0, label: { show: false }, symbol: 'none' }
            ]
          }
        }
      ]
    }
  }, [data])

  const onEvents = useMemo(() => ({
    click: (params: any) => {
      const videoId = params.data.value[2]
      if (videoId) {
        navigate(`/cross-profile/${videoId}`)
      }
    }
  }), [navigate])

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[300px]">
      <ReactECharts
        option={option}
        onEvents={onEvents}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}
