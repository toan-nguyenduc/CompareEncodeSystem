import { create } from 'zustand'

interface ComparisonState {
  // The segment currently targeted by the zoom slider
  visibleEndSegment: number | null  
  setVisibleEndSegment: (index: number | null) => void

  // The segment currently hovered by the mouse on the chart
  hoveredSegmentIndex: number | null
  setHoveredSegmentIndex: (index: number | null) => void

  // The specific series selected via click (e.g., 'Old Mean')
  focusedSeries: string | null
  setFocusedSeries: (seriesName: string | null) => void
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  visibleEndSegment: null,
  setVisibleEndSegment: (index) => set({ visibleEndSegment: index }),

  hoveredSegmentIndex: null,
  setHoveredSegmentIndex: (index) => set({ hoveredSegmentIndex: index }),

  focusedSeries: null,
  setFocusedSeries: (seriesName) => set({ focusedSeries: seriesName }),
}))
