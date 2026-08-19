import { VmafSegmentMetric, VideoSummary } from '../api/types'
import { subDays, formatISO } from 'date-fns'

const TITLES = [
  "Ấn tượng tháng 8 Bundesliga 2025/26",
  "Champions League Highlights 2026",
  "Premier League Weekly Review",
  "Bundesliga Matchday Highlights",
  "UEFA Champions League Top Moments",
  "Vietnam Football Highlights",
  "European Football Recap",
  "Weekend Football Collection",
  "Bundesliga Best Goals",
  "Champions League Final Highlights",
]

const PROFILES = ["360p_h264", "480p_h264", "720p_h264", "1080p_h264", "1080p_h265"]

// Generate raw DB data
function generateRawData(): VmafSegmentMetric[] {
  const data: VmafSegmentMetric[] = []
  let globalId = 1
  
  // Generate 60 videos
  for (let videoId = 1; videoId <= 60; videoId++) {
    const title = TITLES[videoId % TITLES.length] + ` - Part ${Math.floor(videoId / TITLES.length) + 1}`
    const createdAt = formatISO(subDays(new Date("2026-08-14T00:00:00Z"), Math.floor(Math.random() * 100)))
    const numProfiles = 2 + Math.floor(Math.random() * 3) // 2 to 4 profiles
    const videoProfiles = PROFILES.slice(0, numProfiles)
    
    // Each video has random segment count between 60 and 180
    const segmentCount = 60 + Math.floor(Math.random() * 121)
    
    for (const profile of videoProfiles) {
      // Base characteristics for this video/profile combo
      const baseVmaf = 65 + Math.random() * 20 // 65-85
      const baseFileSize = 150000 + Math.random() * 300000 // 150KB - 450KB per segment
      
      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
        // Create realistic vmaf curve using sine wave + noise
        const curveOffset = Math.sin(segmentIndex / 10) * 10
        const segmentOldVmafMean = Math.min(100, Math.max(0, baseVmaf + curveOffset + (Math.random() * 5 - 2.5)))
        const segmentOldVmafMin = Math.max(0, segmentOldVmafMean - (10 + Math.random() * 10))
        const segmentOldVmafMax = Math.min(100, segmentOldVmafMean + (5 + Math.random() * 5))
        
        const segmentOldFileSize = baseFileSize * (0.8 + Math.random() * 0.4)
        
        // New encoder (system_id = 0)
        // Let's make it slightly better or worse randomly but generally better
        const vmafImprovement = (Math.random() * 3) - 0.5 // -0.5 to +2.5 improvement
        const sizeReductionFactor = 0.85 + (Math.random() * 0.1) // 85% to 95% of old size
        
        const segmentNewVmafMean = Math.min(100, Math.max(0, segmentOldVmafMean + vmafImprovement))
        const segmentNewVmafMin = Math.max(0, segmentNewVmafMean - (10 + Math.random() * 8))
        const segmentNewVmafMax = Math.min(100, segmentNewVmafMean + (5 + Math.random() * 5))
        
        const segmentNewFileSize = segmentOldFileSize * sizeReductionFactor
        
        const duration = 4 // 4s segments
        const startTime = segmentIndex * duration
        
        // Push System 1 (Old)
        data.push({
          id: globalId++,
          video_id: videoId,
          system_id: 1,
          profile_name: profile,
          segment_index: segmentIndex,
          start_time: startTime,
          duration: duration,
          vmaf_mean: Number(segmentOldVmafMean.toFixed(2)),
          vmaf_min: Number(segmentOldVmafMin.toFixed(2)),
          vmaf_max: Number(segmentOldVmafMax.toFixed(2)),
          created_at: createdAt,
          meta_info: { title },
          file_size: Math.round(segmentOldFileSize)
        })
        
        // Push System 0 (New)
        data.push({
          id: globalId++,
          video_id: videoId,
          system_id: 0,
          profile_name: profile,
          segment_index: segmentIndex,
          start_time: startTime,
          duration: duration,
          vmaf_mean: Number(segmentNewVmafMean.toFixed(2)),
          vmaf_min: Number(segmentNewVmafMin.toFixed(2)),
          vmaf_max: Number(segmentNewVmafMax.toFixed(2)),
          created_at: createdAt,
          meta_info: { title },
          file_size: Math.round(segmentNewFileSize)
        })
      }
    }
  }
  
  return data
}

export const rawDbData = generateRawData()

// Aggregation layer
export function getAggregatedVideos(): VideoSummary[] {
  // Collect sizes per (video, profile, system) so we can pick the smallest profile
  type ProfileSizes = Record<string, { old: number; new: number }>
  const videProfileSizes = new Map<number, ProfileSizes>()
  const videoMap = new Map<number, Omit<VideoSummary, 'smallest_profile' | 'old_profile_size' | 'new_profile_size'>>()

  for (const row of rawDbData) {
    if (!videoMap.has(row.video_id)) {
      videoMap.set(row.video_id, {
        video_id: row.video_id,
        title: row.meta_info.title,
        created_at: row.created_at,
        old_total_size: 0,
        new_total_size: 0,
        old_segment_count: 0,
        new_segment_count: 0,
        profiles: []
      })
      videProfileSizes.set(row.video_id, {})
    }

    const summary = videoMap.get(row.video_id)!
    const profileSizes = videProfileSizes.get(row.video_id)!

    if (!summary.profiles.includes(row.profile_name)) {
      summary.profiles.push(row.profile_name)
      profileSizes[row.profile_name] = { old: 0, new: 0 }
    }

    if (row.system_id === 1) {
      summary.old_total_size += row.file_size
      summary.old_segment_count += 1
      profileSizes[row.profile_name].old += row.file_size
    } else {
      summary.new_total_size += row.file_size
      summary.new_segment_count += 1
      profileSizes[row.profile_name].new += row.file_size
    }
  }

  return Array.from(videoMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(v => {
      const profileSizes = videProfileSizes.get(v.video_id)!
      // Sort profiles by resolution order; pick the first (smallest)
      const orderedProfiles = [...v.profiles].sort((a, b) => a.localeCompare(b))
      const smallestProfile = orderedProfiles[0]
      const sizes = profileSizes[smallestProfile] ?? { old: 0, new: 0 }
      return {
        ...v,
        smallest_profile: smallestProfile,
        old_profile_size: sizes.old,
        new_profile_size: sizes.new,
      }
    })
}

export const allVideoSummaries = getAggregatedVideos()

