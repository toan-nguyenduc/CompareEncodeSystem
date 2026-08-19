import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { VideoComparison } from '@/api/types'

interface ProfileRadarChartProps {
  data: VideoComparison[]
  showOldSystem: boolean
}

const PROFILE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function ProfileRadarChart({ data, showOldSystem }: ProfileRadarChartProps) {
  const option = useMemo(() => {
    const sortedData = [...data].sort((a, b) => a.profile_name.localeCompare(b.profile_name))
    
    const categories = ['Avg VMAF', 'Min VMAF', 'Stability']
    const series: any[] = []
    
    sortedData.forEach((p, idx) => {
      let tOldV = 0, tNewV = 0, minOldV = 100, minNewV = 100
      p.segments.forEach(s => {
        tOldV += s.old.vmaf_mean
        tNewV += s.new.vmaf_mean
        if (s.old.vmaf_min < minOldV) minOldV = s.old.vmaf_min
        if (s.new.vmaf_min < minNewV) minNewV = s.new.vmaf_min
      })
      const avgOldV = tOldV / p.segments.length
      const avgNewV = tNewV / p.segments.length
      const stabOld = (minOldV / avgOldV) * 100
      const stabNew = (minNewV / avgNewV) * 100
      
      const color = PROFILE_COLORS[idx % PROFILE_COLORS.length]
      
      if (showOldSystem) {
        // Old System Series
        series.push({
          name: `${p.profile_name} (Old)`,
          type: 'bar',
          data: [
            Number(avgOldV.toFixed(1)),
            Number(minOldV.toFixed(1)),
            Number(stabOld.toFixed(1))
          ],
          itemStyle: { 
            color: hexToRgba(color, 0.3),
            borderColor: color,
            borderWidth: 1
          },
          barGap: '0%', // Group old and PE closely
          barCategoryGap: '20%'
        })
      }
      
      // PE Series
      series.push({
        name: showOldSystem ? `${p.profile_name} (PE)` : p.profile_name,
        type: 'bar',
        data: [
          Number(avgNewV.toFixed(1)),
          Number(minNewV.toFixed(1)),
          Number(stabNew.toFixed(1))
        ],
        itemStyle: { color: color },
        barGap: '0%',
        barCategoryGap: '20%'
      })
    })

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'Profile Comparison',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 0,
        top: 'middle',
        itemWidth: 16,
        itemHeight: 16,
        textStyle: { color: '#4b5563', fontSize: 13, fontWeight: '500' }
      },
      grid: { left: 90, right: 140, bottom: 45, top: 40, containLabel: false },
      xAxis: {
        type: 'value',
        name: 'Score (0 - 100)',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: '#111827', fontWeight: 'bold', fontSize: 11 },
        max: 100,
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: '#111827', fontWeight: 'bold', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false }
      },
      series: series
    }
  }, [data, showOldSystem])

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[350px]">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}
