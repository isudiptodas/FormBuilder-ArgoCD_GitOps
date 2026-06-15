import axios from 'axios'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi'
import { FormRenderer } from '../components/FormRenderer'
import type { Field } from '../components/FormRenderer'
import { useToast } from '../components/Toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const fieldTypes: Field['type'][] = ['text', 'number', 'slider', 'radio', 'checkbox', 'textarea']
const fieldTypeLabels: Record<Field['type'], string> = {
  text: 'Text',
  number: 'Number',
  slider: 'Slider',
  radio: 'Radio',
  checkbox: 'Checkbox',
  textarea: 'Long text',
}

export function BuilderPage() {
  const [title, setTitle] = useState('Business enquiry')
  const [description, setDescription] = useState('Tell us about your request and we will get back to you.')
  const [fields, setFields] = useState<Field[]>([])
  const [mode, setMode] = useState<'editor' | 'preview'>('editor')
  const navigate = useNavigate()
  const toast = useToast()

  const addField = () => {
    setFields((items) => [
      ...items,
      {
        id: `field-${Date.now()}`,
        type: 'text',
        label: 'Enter your name',
        required: true,
        options: ['Option 1', 'Option 2'],
        min: 0,
        max: 100,
      },
    ])
  }

  const updateField = (id: string, patch: Partial<Field>) => {
    setFields((items) => items.map((field) => (field.id === id ? { ...field, ...patch } : field)))
  }

  const setOptionCount = (field: Field, count: number) => {
    const safeCount = Math.max(1, Math.min(10, count))
    const current = field.options || []
    const next = Array.from({ length: safeCount }, (_, index) => current[index] || `Option ${index + 1}`)
    updateField(field.id, { options: next })
  }

  const publish = async () => {
    try {
      await axios.post(`${API}/forms`, { title, description, fields }, { withCredentials: true })
      toast('Form published successfully', 'success')
      navigate('/forms')
    } catch (error: any) {
      toast(error.response?.data?.message || 'Could not publish form')
    }
  }

  const editor = (
    <div className={`flex flex-col lg:pr-6`}>
      <div className="mb-5 grid gap-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Form title, for example Business enquiry"
          className="rounded-xl bg-[#dedede] px-4 py-3 text-lg font-black outline-none placeholder:font-semibold placeholder:text-neutral-500 focus:ring-2 focus:ring-[#ef3600]"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Short form description shown to people before they fill it"
          className="min-h-24 rounded-xl bg-[#dedede] px-4 py-3 text-sm outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-[#ef3600]"
        />
      </div>
      <button onClick={addField} className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#d9d9d9] px-5 py-4 text-xl font-black text-neutral-600 transition hover:bg-neutral-300">
        <FiPlus /> Add a new section
      </button>
      <div className="space-y-5">
        {fields.map((field, index) => (
          <motion.div key={field.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">Section {index + 1}</h3>
              <button onClick={() => setFields((items) => items.filter((item) => item.id !== field.id))} className="rounded-full bg-red-50 p-2.5 text-red-700 transition hover:bg-red-100"><FiTrash2 /></button>
            </div>
            <div className="grid gap-4">
              <input
                value={field.label}
                onChange={(event) => updateField(field.id, { label: event.target.value })}
                placeholder="Question label, for example Write your name"
                className="rounded-full bg-[#e3e3e3] px-5 py-3 text-sm outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-[#ef3600]"
              />
              <div>
                <p className="mb-2 text-sm font-black text-neutral-600">Field type</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {fieldTypes.map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateField(field.id, { type })}
                      className={`rounded-full px-4 py-2.5 text-sm font-black transition ${
                        field.type === type
                          ? 'bg-[linear-gradient(90deg,#f44500,#c90000)] text-white shadow-lg'
                          : 'bg-[#e3e3e3] text-neutral-700 hover:bg-neutral-300'
                      }`}
                    >
                      {fieldTypeLabels[type]}
                    </motion.button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-full bg-[#e3e3e3] px-5 py-3 text-sm font-bold">
                <input type="checkbox" checked={field.required} onChange={(event) => updateField(field.id, { required: event.target.checked })} className="accent-[#ef3600]" />
                Required
              </label>
              {(field.type === 'radio' || field.type === 'checkbox') && (
                <div className="rounded-2xl bg-[#f2f2f2] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-neutral-600">Options ({field.options?.length || 1}/10)</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setOptionCount(field, (field.options?.length || 1) - 1)} className="rounded-full bg-white p-2 text-neutral-700 transition hover:bg-neutral-200"><FiMinus /></button>
                      <button type="button" onClick={() => setOptionCount(field, (field.options?.length || 1) + 1)} className="rounded-full bg-white p-2 text-neutral-700 transition hover:bg-neutral-200"><FiPlus /></button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(field.options || ['Option 1']).map((option, optionIndex) => (
                      <input
                        key={optionIndex}
                        value={option}
                        maxLength={40}
                        placeholder={`Option ${optionIndex + 1}`}
                        onChange={(event) => {
                          const next = [...(field.options || ['Option 1'])]
                          next[optionIndex] = event.target.value
                          updateField(field.id, { options: next })
                        }}
                        className="rounded-full bg-white px-4 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#ef3600]"
                      />
                    ))}
                  </div>
                </div>
              )}
              {field.type === 'slider' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="number" value={field.min} placeholder="Minimum slider value" onChange={(event) => updateField(field.id, { min: Number(event.target.value) })} className="rounded-full bg-[#e3e3e3] px-5 py-3 text-sm outline-none placeholder:text-neutral-500" />
                  <input type="number" value={field.max} placeholder="Maximum slider value" onChange={(event) => updateField(field.id, { max: Number(event.target.value) })} className="rounded-full bg-[#e3e3e3] px-5 py-3 text-sm outline-none placeholder:text-neutral-500" />
                </div>
              )}
            </div>
          </motion.div> 
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <button onClick={publish} className="rounded-full bg-[linear-gradient(90deg,#f44500,#c90000)] px-9 py-3.5 text-lg font-black text-white transition active:scale-95">Publish</button>
        <button onClick={() => navigate('/forms')} className="rounded-full bg-black px-9 py-3.5 text-lg font-black text-white transition active:scale-95">Cancel</button>
      </div>
    </div>
  )

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(360px,520px)_1fr]">
      <div>
        <div className="mb-6 flex items-center gap-4 xl:hidden">
          <button onClick={() => setMode('editor')} className={`rounded-full px-8 py-3 text-lg font-black ${mode === 'editor' ? 'bg-[linear-gradient(90deg,#f44500,#c90000)] text-white' : 'text-[#b40000]'}`}>Editor</button>
          <button onClick={() => setMode('preview')} className={`text-lg font-black ${mode === 'preview' ? 'rounded-full bg-[linear-gradient(90deg,#f44500,#c90000)] px-8 py-3 text-white' : 'text-[#b40000]'}`}>Preview</button>
        </div>
        <div className={`${mode === 'preview' ? 'hidden xl:block' : ''}`}>{editor}</div>
      </div>
      <div className={`${mode === 'editor' ? 'hidden xl:block' : ''} -mx-5 -mb-8 bg-linear-to-b from-[#f54800] via-[#d50c00] to-[#160000] p-5 sm:-mx-8 lg:-mx-10 xl:-my-8 xl:mr-[-56px] xl:p-8`}>
        <div className="mx-auto min-h-[65vh] rounded-[34px] bg-white p-6 md:p-8">
          <FormRenderer form={{ title, description, fields }} readonly />
        </div>
      </div>
    </div>
  )
}
