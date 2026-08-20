import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Comparison } from './pages/Comparison'
import { CrossProfile } from './pages/CrossProfile'
import { DevIndex } from './pages/DevIndex'
import { Dashboard } from './pages/Dashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<DevIndex />} />
            <Route path="/comparison/:videoId" element={<Comparison />} />
            <Route path="/cross-profile/:videoId" element={<CrossProfile />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}