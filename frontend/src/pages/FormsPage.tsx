import axios from 'axios'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCopy, FiTrash2, FiArrowDown, FiExternalLink } from 'react-icons/fi'
import { useToast } from '../components/Toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

type FormCard = { _id: string; title: string; description: string; createdAt: string; responseCount?: number }

const dateLabel = (value: string) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value))
const smallDate = (value: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(value))

function groupByDate(forms: FormCard[]) {
  return forms.reduce<Record<string, FormCard[]>>((groups, form) => {
    const label = dateLabel(form.createdAt)
    groups[label] = [...(groups[label] || []), form]
    return groups
  }, {})
}

export function FormsPage() {
  const [forms, setForms] = useState<FormCard[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest')
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const loadForms = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API}/forms?search=${encodeURIComponent(search)}&sort=${sort}`, { withCredentials: true })
      setForms(data.forms)
    } catch (error: any) {
      toast(error.response?.data?.message || 'Could not load forms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = window.setTimeout(loadForms, 250)
    return () => window.clearTimeout(id)
  }, [search, sort])

  const grouped = useMemo(() => groupByDate(forms), [forms])

  const copyLink = async (id: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/fill/${id}`)
    toast('Public form link copied', 'success')
  }

  const deleteForm = async (id: string) => {
    try {
      await axios.delete(`${API}/forms/${id}`, { withCredentials: true })
      toast('Form deleted', 'success')
      loadForms()
    } catch (error: any) {
      toast(error.response?.data?.message || 'Could not delete form')
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search forms" className="py-4 flex-1 rounded-full bg-[#dedede] px-5 text-sm outline-none focus:ring-2 focus:ring-[#ef3600]" />
        <Link to="/forms/new" className="grid h-12 min-w-36 place-items-center rounded-full bg-[linear-gradient(90deg,#f44500,#c90000)] px-8 text-xl font-semibold text-white transition hover:shadow-xl active:scale-95"><span className={`text-white`}>Create</span></Link>
        <button onClick={() => setSort(sort === 'latest' ? 'oldest' : 'latest')} className="flex h-12 min-w-36 items-center justify-center gap-3 rounded-full bg-black px-7 text-xl font-black text-white transition active:scale-95">
          {sort === 'latest' ? 'Latest' : 'Oldest'} <FiArrowDown size={20} />
        </button>
      </div>
      <div className="my-8 flex items-center gap-5 border-t border-neutral-500 pt-5 lg:hidden">
        <Link to="/forms" className="inline-block rounded-full bg-[linear-gradient(90deg,#f44500,#c90000)] px-8 py-3 text-xl font-black text-white">All Forms</Link>
        <Link to="/responses" className="text-xl font-black text-[#b40000]">Responses</Link>
      </div>
      {loading ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-[18px] bg-[#e1e1e1]" />)}</div>
      ) : forms.length === 0 ? (
        <EmptyState title="No forms yet" text="Create your first form and it will appear here." />
      ) : (
        <div className="space-y-14">
          {Object.entries(grouped).map(([date, items]) => (
            <section key={date}>
              <h3 className="mb-6 lg:mt-4 pl-3 text-xl font-black text-neutral-600">{date}</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <AnimatePresence>
                  {items.map((form) => (
                    <motion.article key={form._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="group rounded-[18px] bg-[#e1e1e1] p-5 transition hover:-translate-y-1 hover:shadow-xl">
                      <h4 className="break-words text-2xl font-black leading-tight">{form.title}</h4>
                      <p className="mt-3 text-sm">{smallDate(form.createdAt)}</p>
                      <div className="mt-4 flex gap-2 opacity-100 lg:opacity-0 lg:transition lg:group-hover:opacity-100">
                        <button title="Copy public link" onClick={() => copyLink(form._id)} className="rounded-full bg-white p-3"><FiCopy /></button>
                        <Link title="Open public form" to={`/fill/${form._id}`} className="rounded-full bg-white p-3"><FiExternalLink /></Link>
                        <button title="Delete form" onClick={() => deleteForm(form._id)} className="rounded-full bg-white p-3 text-red-700"><FiTrash2 /></button>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto mt-16 max-w-md text-center">
      <svg viewBox="0 0 240 160" className="mx-auto h-32 w-48">
        <rect x="35" y="28" width="170" height="104" rx="22" fill="#e1e1e1" />
        <circle cx="82" cy="76" r="12" fill="#ef3600" />
        <circle cx="158" cy="76" r="12" fill="#111" />
        <path d="M90 104c18 16 42 16 60 0" stroke="#c90000" strokeWidth="8" fill="none" strokeLinecap="round" />
      </svg>
      <h3 className="text-3xl font-black">{title}</h3>
      <p className="mt-3 text-sm text-neutral-500">{text}</p>
    </motion.div>
  )
}
