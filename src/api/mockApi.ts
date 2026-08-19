import { rawDbData } from '../mock/generator'
import { VideoComparison, VmafSegmentMetric, SegmentComparison } from './types'

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
    
    // system_id: 1 => Old/Original
    // system_id: 0 => New/Encoded
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
