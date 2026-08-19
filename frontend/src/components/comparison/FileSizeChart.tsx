import ReactECharts from 'echarts-for-react'
import { useMemo, useRef, useEffect } from 'react'
import * as echarts from 'echarts'
import { VideoComparison } from '@/api/types'
import { useComparisonStore } from '@/store/useComparisonStore'

interface FileSizeChartProps {
  data: VideoComparison
}

export function FileSizeChart({ data }: FileSizeChartProps) {
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
    const oldSizeData = segs.map(s => Number((s.old.file_size / 1024).toFixed(1))) // KB
    const newSizeData = segs.map(s => Number((s.new.file_size / 1024).toFixed(1))) // KB

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'File Size (KB)',
        left: 16,
        top: 12,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Old System', 'PE'],
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
        data: segs.map(s => s.segment_index),
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'Size (KB)',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: { color: '#111827', fontWeight: 'bold', fontSize: 11 },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [
        {
          name: 'Old System',
          type: 'bar',
          data: oldSizeData,
          itemStyle: { color: '#9ca3af' }
        },
        {
          name: 'PE',
          type: 'bar',
          data: newSizeData,
          itemStyle: { color: '#3b82f6' }
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
