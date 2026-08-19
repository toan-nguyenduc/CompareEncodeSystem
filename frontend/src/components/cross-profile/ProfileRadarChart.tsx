import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { VideoComparison } from '@/api/types'

interface ProfileRadarChartProps {
  data: VideoComparison[]
  showOldSystem: boolean
}

export function ProfileRadarChart({ data, showOldSystem }: ProfileRadarChartProps) {
  const option = useMemo(() => {
    // We will render one radar series for PE and one for Old System if toggled.
    // However, a radar chart usually compares multiple dimensions.
    // If we want to compare PROFILES, we could map profiles to the radar indicator axes
    // OR we could map Metrics to the indicator axes and have profiles be the polygons.
    // Plan: Polygon = Profile. Axes = Metrics (Avg VMAF, Min VMAF, Stability, Size Efficiency).
    
    const sortedData = [...data].sort((a, b) => a.profile_name.localeCompare(b.profile_name))
    
    // Normalize metrics so they fit 0-100 scale well on the radar
    // Avg VMAF: 0-100
    // Min VMAF: 0-100
    // Stability (min/avg): 0-1 => 0-100
    // Size Efficiency: Inverse of size, but how to normalize? We can skip Size Efficiency or just use a relative score. Let's just use:
    // Avg VMAF (100)
    // Min VMAF (100)
    // Stability (100)
    // Size Savings % (Old vs New) - but if PE only, we don't have savings. So let's just do VMAF metrics for simplicity.
    
    const indicators = [
      { name: 'Avg VMAF', max: 100 },
      { name: 'Min VMAF', max: 100 },
      { name: 'Stability', max: 100 }
    ]

    const seriesData: any[] = []

    // Distinct colors for up to 5 profiles
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

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

      const color = colors[idx % colors.length]

      // Add PE polygon
      seriesData.push({
        value: [
          Number(avgNewV.toFixed(1)),
          Number(minNewV.toFixed(1)),
          Number(stabNew.toFixed(1))
        ],
        name: `${p.profile_name} (PE)`,
        itemStyle: { color },
        lineStyle: { type: 'solid', width: 2 }
      })

      // Add Old System polygon if toggled
      if (showOldSystem) {
        seriesData.push({
          value: [
            Number(avgOldV.toFixed(1)),
            Number(minOldV.toFixed(1)),
            Number(stabOld.toFixed(1))
          ],
          name: `${p.profile_name} (Old)`,
          itemStyle: { color },
          lineStyle: { type: 'dashed', width: 2 }
        })
      }
    })

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'Profile Radar',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: '#6b7280', fontSize: 11 }
      },
      radar: {
        indicator: indicators,
        radius: '60%',
        center: ['40%', '55%'],
        splitNumber: 4,
        axisName: {
          color: '#6b7280',
          fontSize: 11
        },
        splitArea: {
          areaStyle: {
            color: ['#f9fafb', '#ffffff']
          }
        },
        axisLine: {
          lineStyle: { color: '#e5e7eb' }
        },
        splitLine: {
          lineStyle: { color: '#e5e7eb' }
        }
      },
      series: [
        {
          name: 'Radar',
          type: 'radar',
          data: seriesData,
          symbolSize: 4
        }
      ]
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
