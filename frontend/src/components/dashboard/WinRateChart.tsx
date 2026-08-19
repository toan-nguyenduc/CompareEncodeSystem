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
      backgroundColor: '#ffffff',
      title: {
        text: 'Video Win Rate',
        left: 'center',
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        bottom: 12,
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: '#6b7280', fontSize: 12 }
      },
      series: [
        {
          name: 'Win Rate',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
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
