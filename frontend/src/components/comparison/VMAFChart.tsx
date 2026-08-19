import ReactECharts from 'echarts-for-react'
import { useRef, useMemo, useEffect } from 'react'
import * as echarts from 'echarts'
import { VideoComparison } from '@/api/types'
import { useComparisonStore } from '@/store/useComparisonStore'

interface VMAFChartProps {
  data: VideoComparison
}

const meanColor = '#3b82f6'
const minColor = '#f59e0b'
const maxColor = '#10b981'

interface SeriesConfig {
  name: string
  color: string
  dash: boolean
  width: number
  dataKey: 'oldMean' | 'newMean' | 'oldMin' | 'newMin' | 'oldMax' | 'newMax'
}

const OLD_SERIES: SeriesConfig[] = [
  { name: 'Mean', color: meanColor, dash: false, width: 2.5, dataKey: 'oldMean' },
  { name: 'Min', color: minColor, dash: false, width: 1.5, dataKey: 'oldMin' },
  { name: 'Max', color: maxColor, dash: false, width: 1.5, dataKey: 'oldMax' },
]

const NEW_SERIES: SeriesConfig[] = [
  { name: 'Mean', color: meanColor, dash: false, width: 2.5, dataKey: 'newMean' },
  { name: 'Min', color: minColor, dash: false, width: 1.5, dataKey: 'newMin' },
  { name: 'Max', color: maxColor, dash: false, width: 1.5, dataKey: 'newMax' },
]

function DashLine({ color }: { color: string }) {
  return (
    <svg width="28" height="12" viewBox="0 0 28 12" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <line x1="0" y1="6" x2="28" y2="6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function VMAFChart({ data }: VMAFChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const oldChartRef = useRef<ReactECharts>(null)
  const newChartRef = useRef<ReactECharts>(null)

  const visibleEndSegment = useComparisonStore(state => state.visibleEndSegment)
  const focusedSeries = useComparisonStore(state => state.focusedSeries)
  const setFocusedSeries = useComparisonStore(state => state.setFocusedSeries)
  const setHoveredSegmentIndex = useComparisonStore(state => state.setHoveredSegmentIndex)

  // Slice segments based on slider zoom position
  const visibleSegments = useMemo(() => {
    if (visibleEndSegment === null) return data.segments
    return data.segments.filter(s => s.segment_index <= visibleEndSegment)
  }, [data.segments, visibleEndSegment])

  // Click outside chart container → deselect series
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocusedSeries(null)
      }
    }
    document.addEventListener('mousedown', handleDocClick)
    return () => document.removeEventListener('mousedown', handleDocClick)
  }, [setFocusedSeries])

  // Connect the two charts for synchronized tooltips/crosshairs
  useEffect(() => {
    if (oldChartRef.current && newChartRef.current) {
      const oldInstance = oldChartRef.current.getEchartsInstance()
      const newInstance = newChartRef.current.getEchartsInstance()
      oldInstance.group = 'sync-charts'
      newInstance.group = 'sync-charts'
      echarts.connect('sync-charts')
    }
    return () => {
      echarts.disconnect('sync-charts')
    }
  }, [])

  const textColor = '#9ca3af'
  const splitLineColor = '#f3f4f6'
  const borderColor = '#e5e7eb'

  const buildOption = (seriesConfigs: SeriesConfig[]) => {
    const segs = visibleSegments

    const dataMap: Record<SeriesConfig['dataKey'], number[]> = {
      oldMean: segs.map(s => s.old.vmaf_mean),
      newMean: segs.map(s => s.new.vmaf_mean),
      oldMin: segs.map(s => s.old.vmaf_min),
      newMin: segs.map(s => s.new.vmaf_min),
      oldMax: segs.map(s => s.old.vmaf_max),
      newMax: segs.map(s => s.new.vmaf_max),
    }

    const getOp = (name: string) => {
      if (!focusedSeries) return 1
      return name === focusedSeries ? 1 : 0.08
    }

    return {
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { show: false } },
        showContent: false, // Don't show the default tooltip popover
      },
      legend: { show: false }, // replaced by custom HTML legend
      animation: false,        // instant update when slider moves
      grid: {
        left: 32,
        right: 16,
        bottom: 24,
        top: 12,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: segs.map(s => s.segment_index),
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: textColor, fontSize: 11 },
        axisLabel: { color: textColor, fontSize: 11 },
        axisLine: { lineStyle: { color: borderColor } },
        axisTick: { lineStyle: { color: borderColor } },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        nameTextStyle: { color: textColor, fontSize: 11 },
        axisLabel: { color: textColor, fontSize: 11 },
        splitLine: { lineStyle: { color: splitLineColor } },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: seriesConfigs.map(cfg => ({
        name: cfg.name,
        type: 'line',
        data: dataMap[cfg.dataKey],
        itemStyle: { color: cfg.color, opacity: getOp(cfg.name) },
        lineStyle: {
          type: cfg.dash ? 'dashed' : 'solid',
          width: cfg.width,
          color: cfg.color,
          opacity: getOp(cfg.name),
        },
        showSymbol: false,
        // No emphasis blur — we handle it manually via opacity
        emphasis: { disabled: true },
        blur: { lineStyle: { opacity: 0 } },
      })),
    }
  }

  const oldOption = useMemo(() => buildOption(OLD_SERIES), [visibleSegments, focusedSeries])
  const newOption = useMemo(() => buildOption(NEW_SERIES), [visibleSegments, focusedSeries])

  // Chart events
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

  const handleLegendClick = (name: string) => {
    setFocusedSeries(focusedSeries === name ? null : name)
  }

  const renderLegend = (configs: SeriesConfig[], title: string) => (
    <div className="flex-1 px-5 pt-3 pb-3 border-b border-gray-100 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
        {configs.map(cfg => {
          const isFocused = focusedSeries === null || focusedSeries === cfg.name
          return (
            <button
              key={cfg.name}
              onClick={() => handleLegendClick(cfg.name)}
              title={`Click to focus ${cfg.name}`}
              className={`flex items-center gap-1.5 text-sm font-medium rounded px-1 py-0.5 transition-all duration-200 select-none
                ${isFocused ? 'opacity-100' : 'opacity-25'}
                hover:opacity-100`}
            >
              <DashLine color={cfg.color} />
              <span style={{ color: cfg.color }}>{cfg.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* ── Custom Legends ── */}
      <div className="flex flex-col md:flex-row border-b border-gray-100">
        {renderLegend(OLD_SERIES, "Old System")}
        <div className="hidden md:block w-px bg-gray-200"></div>
        {renderLegend(NEW_SERIES, "PE")}
      </div>

      {focusedSeries && (
        <div className="px-5 py-2 bg-gray-50 flex justify-center border-b border-gray-100">
          <button
            onClick={() => setFocusedSeries(null)}
            className="text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2"
          >
            Clear focus
          </button>
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 h-[400px]">
        <div className="h-full px-2 pb-2 pt-1 border-r border-gray-100">
          <ReactECharts
            ref={oldChartRef}
            option={oldOption}
            style={{ height: '100%', width: '100%' }}
            onEvents={onEvents}
            notMerge={true}
            lazyUpdate={false}
            opts={{ renderer: 'svg' }}
          />
        </div>
        <div className="h-full px-2 pb-2 pt-1">
          <ReactECharts
            ref={newChartRef}
            option={newOption}
            style={{ height: '100%', width: '100%' }}
            onEvents={onEvents}
            notMerge={true}
            lazyUpdate={false}
            opts={{ renderer: 'svg' }}
          />
        </div>
      </div>
    </div>
  )
}
