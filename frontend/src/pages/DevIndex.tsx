import { Link } from 'react-router-dom'
import { allVideoSummaries } from '@/mock/generator'

export function DevIndex() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dev: Valid Comparison Links (Seed)</h1>
        <p className="text-gray-500 mb-6 border-b border-gray-100 pb-4">
          Click any link below to test the comparison page. These links are dynamically generated based on the current mock data.
        </p>

        <div className="mb-6 flex">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
          >
            View Aggregate Dashboard
          </Link>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {allVideoSummaries.map((video) => (
            <div key={video.video_id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <h2 className="font-semibold text-gray-800 mb-2">
                Video {video.video_id}: {video.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                {video.profiles.map(profile => (
                  <Link
                    key={profile}
                    to={`/comparison/${video.video_id}?profile=${profile}`}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    Test Profile: {profile}
                  </Link>
                ))}
                <Link
                  to={`/cross-profile/${video.video_id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-md hover:bg-emerald-100 transition-colors border border-emerald-200"
                >
                  Cross-Profile Analysis
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
