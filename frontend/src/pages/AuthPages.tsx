import axios from 'axios'
import { motion } from 'motion/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useToast } from '../components/Toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function AuthCard({ mode }: { mode: 'login' | 'signup' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        await axios.post(`${API}/auth/signup`, { name, email, password }, { withCredentials: true })
        toast('Account created successfully', 'success')
      } else {
        await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true })
        toast('Welcome back', 'success')
      }
      navigate('/forms')
    } catch (error: any) {
      toast(error.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-[34px] bg-white p-8 shadow-2xl"
    >
      <h1 className="text-4xl font-black">{mode === 'signup' ? 'Create account' : 'Login'}</h1>
      <p className="mt-3 text-neutral-500">Build, publish and track beautiful forms.</p>
      <div className="mt-8 space-y-4">
        {mode === 'signup' && (
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-full bg-[#e7e7e7] px-6 py-4 outline-none focus:ring-2 focus:ring-[#f04300]"
          />
        )}
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          type="email"
          className="w-full rounded-full bg-[#e7e7e7] px-6 py-4 outline-none focus:ring-2 focus:ring-[#f04300]"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          className="w-full rounded-full bg-[#e7e7e7] px-6 py-4 outline-none focus:ring-2 focus:ring-[#f04300]"
        />
      </div>
      <button
        disabled={loading}
        className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(90deg,#f54800,#c90000)] px-7 py-4 text-xl font-black text-white transition hover:shadow-xl active:scale-95 disabled:opacity-60"
      >
        {loading ? 'Please wait...' : mode === 'signup' ? 'Sign up' : 'Login'}
        <FiArrowRight />
      </button>
      <p className="mt-6 text-center font-semibold">
        {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
        <Link className="text-[#c60000]" to={mode === 'signup' ? '/login' : '/signup'}>
          {mode === 'signup' ? 'Login' : 'Create one'}
        </Link>
      </p>
    </motion.form>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(115deg,#f54800_0%,#c90000_45%,#130000_100%)] px-6 py-8 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <h1 className="text-3xl font-black">FormBuilder</h1>
        <Link to="/login" className="rounded-full bg-white px-6 py-3 font-bold text-black">
          <span className={`text-black`}>Login</span>
        </Link>
      </nav>
      <section className="mx-auto grid max-w-6xl items-center gap-12 py-24 md:grid-cols-[1fr_420px]">
        <div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl text-6xl font-black leading-tight">
            Build forms that feel clean, fast and alive.
          </motion.h2>
          <p className="mt-6 max-w-2xl text-xl text-white/80">Create dynamic forms, publish public links, prevent duplicate submissions and review responses in a crisp table view.</p>
          <Link className="mt-9 inline-flex rounded-full bg-white px-8 py-4 text-xl font-bold text-orange-500 transition hover:scale-105" to="/signup">
            <span className={`text-black`}>Start building</span>
          </Link>
        </div>
        <div className="rounded-[34px] bg-white/95 p-8 text-black shadow-2xl">
          <div className="mb-7 text-center text-2xl font-black">Business enquiry</div>
          {['Enter your name', 'Project budget', 'Skills needed'].map((label) => (
            <div key={label} className="mb-6">
              <div className="mb-3 text-xl font-black">{label}</div>
              <div className="h-14 bg-[#d9d9d9]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(115deg,#f54800,#bd0000,#120000)] px-6">
      <AuthCard mode="login" />
    </div>
  )
}

export function SignupPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(115deg,#f54800,#bd0000,#120000)] px-6">
      <AuthCard mode="signup" />
    </div>
  )
}
