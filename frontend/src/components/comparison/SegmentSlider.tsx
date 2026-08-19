import { Slider } from '@/components/ui/slider'
import { VideoComparison } from '@/api/types'
import { useComparisonStore } from '@/store/useComparisonStore'

interface SegmentSliderProps {
  data: VideoComparison
}

export function SegmentSlider({ data }: SegmentSliderProps) {
  const visibleEndSegment = useComparisonStore(state => state.visibleEndSegment)
  const setVisibleEndSegment = useComparisonStore(state => state.setVisibleEndSegment)

  const minIndex = data.segments[0]?.segment_index ?? 0
  const maxIndex = data.segments[data.segments.length - 1]?.segment_index ?? 0

  // Slider value = end of visible range; null (all) maps to maxIndex
  const sliderValue = visibleEndSegment ?? maxIndex

  const handleValueChange = (val: number[]) => {
    const newEnd = val[0]
    // When dragged to max, reset to show all (null)
    setVisibleEndSegment(newEnd >= maxIndex ? null : newEnd)
  }

  const endSegment = data.segments.find(s => s.segment_index === sliderValue)
    ?? data.segments[data.segments.length - 1]

  const isShowingAll = visibleEndSegment === null

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      {/* Info row */}
      <div className="flex items-baseline justify-between mb-1">
        <div>
          <span className="text-sm font-semibold text-gray-900">Segment </span>
          <span className="text-sm font-bold text-blue-600">{sliderValue}</span>
          <span className="text-sm text-gray-400"> / {maxIndex}</span>
        </div>
        {isShowingAll ? (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">All segments</span>
        ) : (
          <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            Showing 0 – {sliderValue}
          </span>
        )}
      </div>

      {/* Segment detail */}
      {endSegment && (
        <p className="text-xs text-gray-400 mb-4">
          Start: {endSegment.start_time}s &nbsp;·&nbsp; Duration: {endSegment.duration}s
        </p>
      )}

      {/* Slider */}
      <div className="px-1">
        <Slider
          min={minIndex}
          max={maxIndex}
          step={1}
          value={[sliderValue]}
          onValueChange={handleValueChange}
          className="py-2"
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-1.5 font-medium">
          <span>{minIndex}</span>
          <span className="text-gray-500 font-bold text-[10px]">← drag to zoom in · slide right to zoom out →</span>
          <span>{maxIndex}</span>
        </div>
      </div>
    </div>
  )
}
