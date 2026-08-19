import ReactECharts from 'echarts-for-react'
import { useMemo, useRef, useEffect } from 'react'
import * as echarts from 'echarts'
import { VideoComparison } from '@/api/types'
import { useComparisonStore } from '@/store/useComparisonStore'

interface VMAFDiffChartProps {
  data: VideoComparison
}

export function VMAFDiffChart({ data }: VMAFDiffChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReactECharts>(null)
  const visibleEndSegment = useComparisonStore(state => state.visibleEndSegment)
  const setHoveredSegmentIndex = useComparisonStore(state => state.setHoveredSegmentIndex)

  const visibleSegments = useMemo(() => {
    if (visibleEndSegment === null) return data.segments
    return data.segments.filter(s => s.segment_index <= visibleEndSegment)
  }, [data.segments, visibleEndSegment])

  useEffect(() => {
    if (chartRef.current) {
      const instance = chartRef.current.getEchartsInstance()
      instance.group = 'sync-charts'
      echarts.connect('sync-charts')
    }
    return () => {
      echarts.disconnect('sync-charts')
    }
  }, [])

  const option = useMemo(() => {
    const segs = visibleSegments
    const diffData = segs.map(s => {
      const diff = s.new.vmaf_mean - s.old.vmaf_mean
      return {
        value: Number(diff.toFixed(2)),
        itemStyle: {
          color: diff >= 0 ? '#10b981' : '#ef4444' // Green if PE is better, Red if worse
        }
      }
    })

    const avgDiff = diffData.reduce((sum, item) => sum + item.value, 0) / (diffData.length || 1)

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'VMAF Difference (PE - Old System)',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const val = params[0].value
          const color = val >= 0 ? '#10b981' : '#ef4444'
          const sign = val > 0 ? '+' : ''
          return `
            <div class="text-sm font-medium">Segment ${params[0].name}</div>
            <div style="color: ${color}; font-weight: bold;">Δ ${sign}${val} VMAF</div>
          `
        }
      },
      grid: { left: 40, right: 24, bottom: 24, top: 50, containLabel: false },
      xAxis: {
        type: 'category',
        data: segs.map(s => s.segment_index),
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [
        {
          name: 'Difference',
          type: 'bar',
          data: diffData,
          markLine: {
            data: [{ type: 'average', name: 'Avg Diff', yAxis: avgDiff }],
            lineStyle: { color: '#3b82f6', type: 'dashed' },
            label: { formatter: 'Avg: {c}', position: 'insideEndTop' }
          }
        }
      ]
    }
  }, [visibleSegments])

  const onEvents = useMemo(() => ({
    updateAxisPointer: (params: any) => {
      const dataIndex = params?.axesInfo?.[0]?.value
      if (dataIndex !== undefined && visibleSegments[dataIndex]) {
        setHoveredSegmentIndex(visibleSegments[dataIndex].segment_index)
      }
    },
    globalout: () => {
      setHoveredSegmentIndex(null)
    }
  }), [setHoveredSegmentIndex, visibleSegments])

  return (
    <div ref={containerRef} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[300px]">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: '100%', width: '100%' }}
        onEvents={onEvents}
        notMerge={true}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}
