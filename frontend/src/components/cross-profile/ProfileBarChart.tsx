import ReactECharts from 'echarts-for-react'
import { useMemo, useState } from 'react'
import { VideoComparison } from '@/api/types'

interface ProfileBarChartProps {
  data: VideoComparison[]
  showOldSystem: boolean
}

type MetricType = 'vmaf' | 'size'

export function ProfileBarChart({ data, showOldSystem }: ProfileBarChartProps) {
  const [metric, setMetric] = useState<MetricType>('vmaf')
  
  const option = useMemo(() => {
    // Sort profiles
    const sortedData = [...data].sort((a, b) => a.profile_name.localeCompare(b.profile_name))
    const profiles = sortedData.map(p => p.profile_name)
    
    // Compute data
    const oldVmaf: number[] = []
    const newVmaf: number[] = []
    const oldSize: number[] = [] // MB
    const newSize: number[] = [] // MB
    
    sortedData.forEach(p => {
      let tOldV = 0, tNewV = 0, tOldS = 0, tNewS = 0
      p.segments.forEach(s => {
        tOldV += s.old.vmaf_mean
        tNewV += s.new.vmaf_mean
        tOldS += s.old.file_size
        tNewS += s.new.file_size
      })
      oldVmaf.push(Number((tOldV / p.segments.length).toFixed(2)))
      newVmaf.push(Number((tNewV / p.segments.length).toFixed(2)))
      oldSize.push(Number((tOldS / (1024 * 1024)).toFixed(1)))
      newSize.push(Number((tNewS / (1024 * 1024)).toFixed(1)))
    })

    const isVmaf = metric === 'vmaf'
    
    let series: any[] = []
    if (showOldSystem) {
      series = [
        {
          name: 'Old System',
          type: 'bar',
          data: isVmaf ? oldVmaf : oldSize,
          itemStyle: { color: '#9ca3af' }
        },
        {
          name: 'PE',
          type: 'bar',
          data: isVmaf ? newVmaf : newSize,
          itemStyle: { color: '#3b82f6' }
        }
      ]
    } else {
      series = [
        {
          name: 'PE',
          type: 'bar',
          data: isVmaf ? newVmaf : newSize,
          itemStyle: { color: '#3b82f6' }
        }
      ]
    }

    return {
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: showOldSystem ? ['Old System', 'PE'] : ['PE'],
        top: 16,
        right: 16,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: '#6b7280', fontSize: 12 }
      },
      grid: { left: 45, right: 24, bottom: 24, top: 60, containLabel: false },
      xAxis: {
        type: 'category',
        data: profiles,
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: isVmaf ? 'Score' : 'MB',
        nameTextStyle: { color: '#6b7280', padding: [0, 0, 0, 20] },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series
    }
  }, [data, showOldSystem, metric])

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[350px]">
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="text-sm font-semibold text-gray-700">Metrics by Profile</h3>
        <select 
          value={metric}
          onChange={(e) => setMetric(e.target.value as MetricType)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="vmaf">Avg VMAF</option>
          <option value="size">Total File Size</option>
        </select>
      </div>
      <div className="flex-1">
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
