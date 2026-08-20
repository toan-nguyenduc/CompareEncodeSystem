import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { DashboardVideoSummary } from '@/api/types'

interface WinRateChartProps {
  data: DashboardVideoSummary[]
}

export function WinRateChart({ data }: WinRateChartProps) {
  const option = useMemo(() => {
    let peWins = 0
    let oldWins = 0
    let draws = 0

    data.forEach(d => {
      if (d.avgVmafNew > d.avgVmafOld) peWins++
      else if (d.avgVmafNew < d.avgVmafOld) oldWins++
      else draws++
    })

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 0,
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#6b7280', fontSize: 11 }
      },
      series: [
        {
          name: 'VMAF Improvement',
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          data: [
            { value: peWins, name: 'PE Wins', itemStyle: { color: '#10b981' } },
            { value: oldWins, name: 'Old Wins', itemStyle: { color: '#ef4444' } },
            { value: draws, name: 'Draw', itemStyle: { color: '#d1d5db' } }
          ]
        }
      ]
    }
  }, [data])

  let peWins = 0
  data.forEach(d => {
    if (d.avgVmafNew > d.avgVmafOld) peWins++
  })
  
  const winRatePercent = data.length > 0 ? ((peWins / data.length) * 100).toFixed(0) : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[160px] p-5 flex items-center justify-between">
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">VMAF Improvement Rate</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">{winRatePercent}%</span>
          <span className="text-sm font-medium text-green-600">PE Superiority</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Overall videos tested</p>
      </div>
      <div className="w-[200px] h-full">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          opts={{ renderer: 'svg' }}
        />
      </div>
    </div>
  )
}
