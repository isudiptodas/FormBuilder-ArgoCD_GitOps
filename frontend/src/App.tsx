import axios from 'axios'
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell, Loader } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { BuilderPage } from './pages/BuilderPage'
import { FillFormPage } from './pages/FillFormPage'
import { FormsPage } from './pages/FormsPage'
import { LandingPage, LoginPage, SignupPage } from './pages/AuthPages'
import { ResponseDetailPage, ResponsesPage } from './pages/ResponsesPage'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

type User = { name: string; email: string }

function Protected({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const verify = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`${API}/auth/me`, { withCredentials: true })
        setUser(data.user)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [location.pathname])

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />

  return <AppShell user={user}>{children}</AppShell>
}

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/fill/:id" element={<FillFormPage />} />
        <Route path="/forms" element={<Protected><FormsPage /></Protected>} />
        <Route path="/forms/new" element={<Protected><BuilderPage /></Protected>} />
        <Route path="/responses" element={<Protected><ResponsesPage /></Protected>} />
        <Route path="/responses/:id" element={<Protected><ResponseDetailPage /></Protected>} />
        <Route path="*" element={<Navigate to="/forms" replace />} />
      </Routes>
    </ToastProvider>
  )
}

export default App
