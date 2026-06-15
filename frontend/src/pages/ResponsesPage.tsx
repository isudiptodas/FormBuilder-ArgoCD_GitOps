import axios from 'axios'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowDown, FiChevronsLeft } from 'react-icons/fi'
import { EmptyState } from './FormsPage'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

type FormCard = { _id: string; title: string; createdAt: string; responseCount: number; fields?: any[] }
type Submission = { _id: string; email: string; answers: { fieldId: string; label: string; value: any }[]; createdAt: string }

const dateLabel = (value: string) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value))
const smallDate = (value: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(value))

function groupByDate(forms: FormCard[]) {
  return forms.reduce<Record<string, FormCard[]>>((groups, form) => {
    const label = dateLabel(form.createdAt)
    groups[label] = [...(groups[label] || []), form]
    return groups
  }, {})
}

export function ResponsesPage() {
  const [forms, setForms] = useState<FormCard[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest')
  const [loading, setLoading] = useState(true)
  const grouped = useMemo(() => groupByDate(forms), [forms])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`${API}/responses?search=${encodeURIComponent(search)}&sort=${sort}`, { withCredentials: true })
        setForms(data.forms)
      } finally {
        setLoading(false)
      }
    }
    const id = window.setTimeout(load, 250)
    return () => window.clearTimeout(id)
  }, [search, sort])

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search form responses" className="h-12 min-w-[220px] flex-1 rounded-full bg-[#dedede] px-5 text-sm outline-none focus:ring-2 focus:ring-[#ef3600]" />
        <button onClick={() => setSort(sort === 'latest' ? 'oldest' : 'latest')} className="flex h-12 min-w-36 items-center justify-center gap-3 rounded-full bg-black px-7 text-xl font-black text-white transition active:scale-95">
          {sort === 'latest' ? 'Latest' : 'Oldest'} <FiArrowDown size={20} />
        </button>
      </div>
      <div className="my-8 px-3 flex items-center gap-5 border-t border-neutral-500 pt-5 lg:hidden">
        <Link to="/forms" className="text-xl font-black text-[#b40000]">All Forms</Link>
        <Link to="/responses" className="inline-block rounded-full bg-[linear-gradient(90deg,#f44500,#c90000)] px-8 py-3 text-xl font-black text-white">Responses</Link>
      </div>
      {loading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4"><div className="h-28 animate-pulse rounded-[18px] bg-[#e1e1e1]" /></div>
      ) : forms.length === 0 ? (
        <EmptyState title="No responses yet" text="Submitted forms will be gathered here." />
      ) : (
        <div className="space-y-14">
          {Object.entries(grouped).map(([date, items]) => (
            <section key={date}>
              <h3 className="mb-6 lg:mt-4 ml-3 text-xl font-black text-neutral-600">{date}</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {items.map((form) => (
                  <Link to={`/responses/${form._id}`} key={form._id}>
                    <motion.article whileHover={{ y: -5 }} className="rounded-[18px] bg-[#e1e1e1] p-5">
                      <h4 className="break-words text-2xl font-black leading-tight">{form.title}</h4>
                      <p className="mt-3 text-sm">{smallDate(form.createdAt)}</p>
                      <p className="mt-3 text-sm font-bold text-[#c90000]">{form.responseCount} responses</p>
                    </motion.article>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export function ResponseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormCard | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [widths, setWidths] = useState<Record<string, number>>({})

  useEffect(() => {
    const load = async () => {
      const { data } = await axios.get(`${API}/responses/${id}`, { withCredentials: true })
      setForm(data.form)
      setSubmissions(data.submissions)
    }
    load()
  }, [id])

  const startResize = (fieldId: string, event: React.MouseEvent) => {
    const startX = event.clientX
    const startWidth = widths[fieldId] || 250
    const move = (moveEvent: MouseEvent) => setWidths((current) => ({ ...current, [fieldId]: Math.max(150, startWidth + moveEvent.clientX - startX) }))
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  if (!form) return <div className="h-72 animate-pulse rounded-[20px] bg-[#e1e1e1]" />

  const fields = form.fields || []

  return (
    <div>
      <button onClick={() => navigate('/responses')} className="mb-6 text-neutral-600 transition hover:text-black">
        <FiChevronsLeft size={42} />
      </button>
      <div className="hide-scrollbar max-h-[72vh] overflow-auto">
        <table className="min-w-max border-collapse text-center">
          <thead>
            <tr className="border-b border-neutral-500">
              <th className="relative min-w-[80px] border-r border-black px-5 py-4 text-xl font-black text-neutral-600">ID</th>
              <th className="relative min-w-[220px] border-r border-black px-5 py-4 text-xl font-black text-neutral-600">Email</th>
              {fields.map((field: any) => (
                <th key={field.id} style={{ width: widths[field.id] || 230 }} className="relative border-r border-black px-5 py-4 text-xl font-black text-neutral-600">
                  {field.label}
                  <span onMouseDown={(event) => startResize(field.id, event)} className="absolute right-0 top-0 h-full w-2 cursor-col-resize" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => (
              <tr key={submission._id} className="border-b border-black">
                <td className="border-r border-black px-5 py-4 text-sm">{index + 1}</td>
                <td className="border-r border-black px-5 py-4 text-sm">{submission.email}</td>
                {fields.map((field: any) => {
                  const answer = submission.answers.find((item) => item.fieldId === field.id)
                  return <td key={field.id} className="border-r border-black px-5 py-4 text-sm">{Array.isArray(answer?.value) ? answer?.value.join(', ') : answer?.value || '-'}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
