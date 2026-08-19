import { rawDbData, allVideoSummaries } from '../mock/generator'
import { VideoComparison, VmafSegmentMetric, SegmentComparison, DashboardVideoSummary } from './types'

// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * ADAPTER FUNCTION:
 * Use this function to transform the flat array of rows from your MySQL Database
 * into the nested VideoComparison format that the React UI expects.
 */
export function parseRawDatabaseRows(videoId: number, profileName: string, rawRows: VmafSegmentMetric[]): VideoComparison | null {
  if (rawRows.length === 0) return null
  
  const segmentsMap = new Map<number, Partial<SegmentComparison>>()
  
  for (const row of rawRows) {
    if (!segmentsMap.has(row.segment_index)) {
      segmentsMap.set(row.segment_index, {
        segment_index: row.segment_index,
        start_time: row.start_time,
        duration: row.duration,
      })
    }
    
    const seg = segmentsMap.get(row.segment_index)!
    const metrics = {
      vmaf_mean: row.vmaf_mean,
      vmaf_min: row.vmaf_min,
      vmaf_max: row.vmaf_max,
      file_size: row.file_size
    }
    
    // system_id: 1 => Old System
    // system_id: 0 => PE (Production Encoder)
    if (row.system_id === 1) {
      seg.old = metrics
    } else if (row.system_id === 0) {
      seg.new = metrics
    }
  }
  
  const segments = Array.from(segmentsMap.values()) as SegmentComparison[]
  segments.sort((a, b) => a.segment_index - b.segment_index)
  
  return {
    video_id: videoId,
    profile_name: profileName,
    segment_count: segments.length,
    segments
  }
}

export async function getVideoComparison(videoId: number, profileName: string): Promise<VideoComparison> {
  await delay(300 + Math.random() * 500) // 300-800ms
  
  // IN THE REAL SYSTEM:
  // const response = await fetch(`https://your-api.com/api/comparison?videoId=${videoId}&profile=${profileName}`)
  // const rows: VmafSegmentMetric[] = await response.json()
  
  // MOCK: filter rows from our fake database
  const rows = rawDbData.filter(r => r.video_id === videoId && r.profile_name === profileName)
  
  // Apply the adapter
  const data = parseRawDatabaseRows(videoId, profileName, rows)
  
  if (!data) throw new Error("Comparison data not found")
    
  return data
}

export async function getVideoAllProfiles(videoId: number): Promise<VideoComparison[]> {
  await delay(300 + Math.random() * 500)
  
  // IN THE REAL SYSTEM:
  // const response = await fetch(`https://your-api.com/api/profiles?videoId=${videoId}`)
  // const rows: VmafSegmentMetric[] = await response.json()
  
  // MOCK: filter rows for the specific video
  const rows = rawDbData.filter(r => r.video_id === videoId)
  
  // Extract unique profiles
  const profiles = Array.from(new Set(rows.map(r => r.profile_name)))
  
  const results: VideoComparison[] = []
  
  for (const profile of profiles) {
    const profileRows = rows.filter(r => r.profile_name === profile)
    const data = parseRawDatabaseRows(videoId, profile, profileRows)
    if (data) results.push(data)
  }
  
  return results
}

export async function getDashboardSummary(): Promise<DashboardVideoSummary[]> {
  await delay(500 + Math.random() * 500)
  
  // IN THE REAL SYSTEM:
  // const response = await fetch(`https://your-api.com/api/dashboard/summary`)
  // return await response.json()
  
  // MOCK: compute from rawDbData
  const summaryMap = new Map<string, DashboardVideoSummary>()
  
  // group rows by video_id
  const videoRows = new Map<number, VmafSegmentMetric[]>()
  rawDbData.forEach(r => {
    if (!videoRows.has(r.video_id)) videoRows.set(r.video_id, [])
    videoRows.get(r.video_id)!.push(r)
  })

  for (const [videoId, rows] of videoRows.entries()) {
    const videoData = allVideoSummaries.find(v => v.video_id === videoId)
    const title = videoData?.title || `Video ${videoId}`
    
    // We need to compare old vs new.
    // For simplicity in mock, just use the first profile or average all profiles.
    // Let's aggregate all segments for this video.
    
    let totalOldV = 0, totalNewV = 0
    let totalOldS = 0, totalNewS = 0
    let winCount = 0, loseCount = 0
    
    // Group by profile and segment index to match old vs new
    const segmentsMap = new Map<string, { old?: VmafSegmentMetric, new?: VmafSegmentMetric }>()
    
    rows.forEach(r => {
      const key = `${r.profile_name}-${r.segment_index}`
      if (!segmentsMap.has(key)) segmentsMap.set(key, {})
      if (r.system_id === 1) segmentsMap.get(key)!.old = r
      if (r.system_id === 0) segmentsMap.get(key)!.new = r
    })
    
    let validPairs = 0
    segmentsMap.forEach(pair => {
      if (pair.old && pair.new) {
        totalOldV += pair.old.vmaf_mean
        totalNewV += pair.new.vmaf_mean
        totalOldS += pair.old.file_size
        totalNewS += pair.new.file_size
        if (pair.new.vmaf_mean > pair.old.vmaf_mean) winCount++
        else if (pair.new.vmaf_mean < pair.old.vmaf_mean) loseCount++
        validPairs++
      }
    })
    
    if (validPairs > 0) {
      summaryMap.set(String(videoId), {
        videoId: String(videoId),
        videoName: title,
        avgVmafOld: Number((totalOldV / validPairs).toFixed(2)),
        avgVmafNew: Number((totalNewV / validPairs).toFixed(2)),
        totalSizeOldBytes: totalOldS,
        totalSizeNewBytes: totalNewS,
        winCount,
        loseCount
      })
    }
  }
  
  return Array.from(summaryMap.values())
}
