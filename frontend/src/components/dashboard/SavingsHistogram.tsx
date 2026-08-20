import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { DashboardVideoSummary } from '@/api/types'

interface SavingsHistogramProps {
  data: DashboardVideoSummary[]
}

export function SavingsHistogram({ data }: SavingsHistogramProps) {
  const option = useMemo(() => {
    // Calculate savings %: (old - new) / old * 100
    // Positive means savings, negative means PE is larger.
    const savings = data.map(d => {
      if (d.totalSizeOldBytes === 0) return 0
      return ((d.totalSizeOldBytes - d.totalSizeNewBytes) / d.totalSizeOldBytes) * 100
    })

    // Create bins: e.g., -10 to -5, -5 to 0, 0 to 5, 5 to 10...
    const bins = [-20, -10, -5, 0, 5, 10, 20, 30, 40, 50]
    const binLabels = ['<-20%', '-20% to -10%', '-10% to -5%', '-5% to 0%', '0% to 5%', '5% to 10%', '10% to 20%', '20% to 30%', '30% to 40%', '>40%']
    const counts = new Array(binLabels.length).fill(0)

    savings.forEach(val => {
      if (val < bins[0]) counts[0]++
      else if (val >= bins[bins.length - 1]) counts[counts.length - 1]++
      else {
        for (let i = 0; i < bins.length - 1; i++) {
          if (val >= bins[i] && val < bins[i+1]) {
            counts[i+1]++
            break
          }
        }
      }
    })

    const filteredChartData: any[] = []
    const filteredBinLabels: string[] = []

    counts.forEach((count, i) => {
      if (count > 0) {
        const isPositive = i >= 4 // 0% and above
        filteredChartData.push({
          value: count,
          itemStyle: { color: isPositive ? '#10b981' : '#ef4444' }
        })
        filteredBinLabels.push(binLabels[i])
      }
    })

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'File Size Savings Distribution',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: { left: 40, right: 24, bottom: 40, top: 50, containLabel: false },
      xAxis: {
        type: 'category',
        data: filteredBinLabels,
        axisLabel: { color: '#9ca3af', fontSize: 10, rotate: 45 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'Videos',
        nameTextStyle: { color: '#6b7280' },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [
        {
          name: 'Count',
          type: 'bar',
          data: filteredChartData
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
