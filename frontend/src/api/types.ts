export interface VideoSummary {
  video_id: number
  title: string
  created_at: string
  old_total_size: number
  new_total_size: number
  old_segment_count: number
  new_segment_count: number
  profiles: string[]
  // Per-card display: show the smallest profile's size comparison
  smallest_profile: string
  old_profile_size: number
  new_profile_size: number
}

export interface SegmentMetrics {
  vmaf_mean: number
  vmaf_min: number
  vmaf_max: number
  file_size: number
}

/** Response từ GET /api/dashboard/summary */
export interface DashboardVideoSummary {
  videoId: string
  videoName: string
  avgVmafNew: number
  avgVmafOld: number
  totalSizeNewBytes: number
  totalSizeOldBytes: number
  winCount: number
  loseCount: number
}

export interface SegmentComparison {
  segment_index: number
  start_time: number
  duration: number
  old: SegmentMetrics
  new: SegmentMetrics
}

export interface VideoComparison {
  video_id: number
  profile_name: string
  segment_count: number
  segments: SegmentComparison[]
}

// Raw DB Schema Simulation
export interface VmafSegmentMetric {
  id: number
  video_id: number
  system_id: 0 | 1 // 0 = PE, 1 = Old System
  profile_name: string
  segment_index: number
  start_time: number
  duration: number
  vmaf_mean: number
  vmaf_min: number
  vmaf_max: number
  created_at: string
  meta_info: {
    title: string
    reconvertOldMedia?: number
  }
  file_size: number
}
