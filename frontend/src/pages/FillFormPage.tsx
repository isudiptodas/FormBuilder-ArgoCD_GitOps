import axios from 'axios'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiCheckCircle } from 'react-icons/fi'
import { FormRenderer } from '../components/FormRenderer'
import type { FormShape } from '../components/FormRenderer'
import { useToast } from '../components/Toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function FillFormPage() {
  const { id } = useParams()
  const [form, setForm] = useState<FormShape | null>(null)
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API}/forms/public/${id}`)
        setForm(data.form)
      } catch (error: any) {
        toast(error.response?.data?.message || 'Could not load form')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, toast])

  const submit = async () => {
    if (Object.keys(answers).length === 0) return toast('Madarchod empty form submit hobe na, form fill kor');
    try {
      await axios.post(`${API}/forms/public/${id}/submit`, { email, answers })
      setSubmitted(true)
      toast('Form submitted successfully', 'success')
    } catch (error: any) {
      toast(error.response?.data?.message || 'Could not submit form')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-orange-500 via-orange-800 to-black">
      <div className="bg-[linear-gradient(105deg,#f54800,#180000)] px-6 py-6 text-white lg:bg-none lg:px-7 lg:py-10">
        <h1 className="text-3xl font-black lg:text-2xl">FormBuilder</h1>
      </div>
      <main className="mx-auto w-full min-h-screen bg-[#ffffff] px-5 py-8 sm:px-8 lg:px-10 lg:py-12 flex flex-col justify-start items-center">
        {loading || !form ? (
          <div className="h-96 animate-pulse bg-[#d0d0d0]" />
        ) : (
          <>
            <FormRenderer form={form} values={answers} onChange={(fieldId, value) => setAnswers((current) => ({ ...current, [fieldId]: value }))} />
            <div className="mb-8 mt-3 w-full lg:w-[70%]">
              <label className="text-xl font-black md:text-2xl">Validated email <span className="text-[#c60000]">*</span></label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="Enter valid email address for form submission"
                className="mt-3 w-full rounded-xl bg-[#d2d2d2] px-4 py-4 outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-[#ef3600]"
              />
            </div>
            <button onClick={submit} className="mt-10 w-full lg:w-[70%] rounded-full bg-[linear-gradient(90deg,#f44500,#c90000)] px-10 py-3.5 text-lg font-black text-white transition hover:shadow-xl active:scale-95">Submit</button>
          </>
        )}
      </main>
      <div className="hidden lg:block" />
      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 grid place-items-center bg-black/45 px-5">
            <motion.div initial={{ scale: 0.82, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="max-w-md rounded-[34px] bg-white p-9 text-center shadow-2xl">
              <FiCheckCircle className="mx-auto text-emerald-500" size={72} />
              <h2 className="mt-5 text-4xl font-black">Submitted</h2>
              <p className="mt-3 text-neutral-500">Your form was submitted with a smooth little celebration.</p>
              <button onClick={() => setSubmitted(false)} className="mt-7 rounded-full bg-black px-8 py-3 text-lg font-black text-white">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
