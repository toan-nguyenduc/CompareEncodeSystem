import ReactECharts from 'echarts-for-react'
import { useMemo, useRef, useEffect } from 'react'
import * as echarts from 'echarts'
import { VideoComparison } from '@/api/types'
import { useComparisonStore } from '@/store/useComparisonStore'

interface VMAFRangeChartProps {
  data: VideoComparison
}

export function VMAFRangeChart({ data }: VMAFRangeChartProps) {
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
    const xAxisData = segs.map(s => s.segment_index)
    
    // We use a stacked line chart trick for the range band.
    // Series 1: old_min (transparent)
    // Series 2: old_max - old_min (area)
    const oldMin = segs.map(s => s.old.vmaf_min)
    const oldRange = segs.map(s => s.old.vmaf_max - s.old.vmaf_min)
    
    const newMin = segs.map(s => s.new.vmaf_min)
    const newRange = segs.map(s => s.new.vmaf_max - s.new.vmaf_min)

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'VMAF Min-Max Range',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          const segIdx = params[0].name
          const seg = segs.find(s => String(s.segment_index) === String(segIdx))
          if (!seg) return ''
          
          return `
            <div class="text-sm font-medium mb-1">Segment ${segIdx}</div>
            <div class="text-xs">
              <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#9ca3af;"></span>
              Old System: ${seg.old.vmaf_min.toFixed(2)} - ${seg.old.vmaf_max.toFixed(2)}
            </div>
            <div class="text-xs mt-1">
              <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#3b82f6;"></span>
              PE: ${seg.new.vmaf_min.toFixed(2)} - ${seg.new.vmaf_max.toFixed(2)}
            </div>
          `
        }
      },
      legend: {
        data: ['Old System Range', 'PE Range'],
        top: 12,
        right: 16,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: '#6b7280', fontSize: 12 }
      },
      grid: { left: 55, right: 24, bottom: 45, top: 50, containLabel: false },
      xAxis: {
        type: 'category',
        name: 'Segment Index',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: '#111827', fontWeight: 'bold', fontSize: 11 },
        data: xAxisData,
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 'dataMin',
        name: 'VMAF Score',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: { color: '#111827', fontWeight: 'bold', fontSize: 11 },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [
        {
          name: 'Old System Base',
          type: 'line',
          data: oldMin,
          stack: 'old',
          lineStyle: { opacity: 0 },
          itemStyle: { opacity: 0 },
          symbol: 'none'
        },
        {
          name: 'Old System Range',
          type: 'line',
          data: oldRange,
          stack: 'old',
          lineStyle: { opacity: 0 },
          itemStyle: { color: '#d1d5db' },
          areaStyle: { color: '#d1d5db', opacity: 0.4 }, // gray-300
          symbol: 'none'
        },
        {
          name: 'PE Base',
          type: 'line',
          data: newMin,
          stack: 'new',
          lineStyle: { opacity: 0 },
          itemStyle: { opacity: 0 },
          symbol: 'none'
        },
        {
          name: 'PE Range',
          type: 'line',
          data: newRange,
          stack: 'new',
          lineStyle: { opacity: 0 },
          itemStyle: { color: '#93c5fd' },
          areaStyle: { color: '#93c5fd', opacity: 0.4 }, // blue-300
          symbol: 'none'
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
