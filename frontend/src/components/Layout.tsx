import axios from 'axios'
import { motion } from 'motion/react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiLogOut, FiSidebar } from 'react-icons/fi'
import { useToast } from './Toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function Loader() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#120000] text-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="h-14 w-14 rounded-full border-4 border-white/20 border-t-[#ff3d00]"
      />
    </div>
  )
}

export function AppShell({ user, children }: { user: { name: string }; children: React.ReactNode }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [collapsed, setCollapsed] = useState(false)

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true })
      toast('Logged out successfully', 'success')
      navigate('/login')
    } catch (error: any) {
      toast(error.response?.data?.message || 'Could not logout')
    }
  }

  return (
    <div className="min-h-screen bg-white font-['Inter',system-ui,sans-serif] text-black lg:flex">
      <aside
        className={`hidden min-h-screen shrink-0 flex-col bg-[linear-gradient(180deg,#f54800_0%,#d71000_52%,#170000_100%)] p-5 text-white transition-all duration-300 lg:flex ${
          collapsed ? 'w-[92px]' : 'w-[280px]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/80 pb-7">
          {!collapsed && <h1 className="text-2xl font-black">FormBuilder</h1>}
          <button
            onClick={() => setCollapsed((value) => !value)}
            className="ml-auto rounded-xl p-2 transition hover:bg-white/15"
            title={collapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            <FiSidebar size={24} />
          </button>
        </div>
        <nav className="mt-8 space-y-3 text-lg font-black">
          <NavLink
            to="/forms"
            className={({ isActive }) =>
              `block rounded-full px-5 py-4 text-center transition ${isActive ? 'bg-white !text-black' : 'text-white hover:bg-white/12'}`
            }
          >
            <span>{collapsed ? 'Forms' : 'All Forms'}</span>
          </NavLink>
          <NavLink
            to="/responses"
            className={({ isActive }) =>
              `block rounded-full px-5 py-4 text-center transition ${isActive ? 'bg-white !text-black' : 'text-white hover:bg-white/12'}`
            }
          >
            <span>{collapsed ? 'Resp' : 'Responses'}</span>
          </NavLink>
        </nav>
        <button
          onClick={logout}
          className="mt-auto rounded-full border-2 border-[#ff3b30] bg-white/10 px-5 py-4 text-base font-black transition hover:bg-white/20 active:scale-95"
        >
          {collapsed ? <FiLogOut className="mx-auto" size={22} /> : 'Log out'}
        </button>
      </aside>

      <header className="flex h-24 items-center justify-between bg-[linear-gradient(105deg,#f54800_0%,#c50000_62%,#140000_100%)] px-6 text-white lg:hidden">
        <h1 className="text-3xl font-black">FormBuilder</h1>
        <button onClick={logout} className="text-[#ff2c22]">
          <FiLogOut size={34} />
        </button>
      </header>

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 xl:px-14">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-4xl font-black leading-tight sm:text-[42px] lg:text-5xl"
        >
          Welcome, {user.name}
        </motion.h2>
        {children}
      </main>
    </div>
  )
}
