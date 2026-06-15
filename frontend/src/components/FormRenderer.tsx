import { motion } from 'motion/react'

export type Field = {
  id: string
  type: 'text' | 'number' | 'slider' | 'radio' | 'checkbox' | 'textarea'
  label: string
  required: boolean
  options?: string[]
  min?: number
  max?: number
}

export type FormShape = {
  _id?: string
  title: string
  description: string
  fields: Field[]
}

type RendererProps = {
  form: FormShape
  values?: Record<string, any>
  onChange?: (id: string, value: any) => void
  readonly?: boolean
}

const inputClass = 'mt-3 w-full rounded-xl bg-[#d9d9d9] px-4 py-4 text-base outline-none transition placeholder:text-neutral-500 focus:ring-2 focus:ring-[#ef3600]'

const placeholderFor = (field: Field) => {
  if (field.type === 'number') return 'Enter a number'
  if (field.type === 'textarea') return 'Write your detailed answer'
  if (field.type === 'slider') return ''
  return `Write ${field.label.toLowerCase()}`
}

export function FormRenderer({ form, values = {}, onChange, readonly }: RendererProps) {
  const setValue = (id: string, value: any) => {
    if (!readonly && onChange) onChange(id, value)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-black md:text-3xl">{form.title || 'Untitled form'}</h1>
        {form.description && <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 md:text-base">{form.description}</p>}
      </div>
      <div className="space-y-8">
        {form.fields.map((field) => (
          <div key={field.id}>
            <label className="text-xl font-black md:text-2xl">
              {field.label}
              {field.required && <span className="text-[#c60000]"> *</span>}
            </label>
            {field.type === 'textarea' && (
              <textarea
                disabled={readonly}
                value={values[field.id] || ''}
                placeholder={placeholderFor(field)}
                onChange={(event) => setValue(field.id, event.target.value)}
                className={`${inputClass} min-h-28 resize-y`}
              />
            )}
            {(field.type === 'text' || field.type === 'number') && (
              <input
                disabled={readonly}
                type={field.type}
                value={values[field.id] || ''}
                placeholder={placeholderFor(field)}
                onChange={(event) => setValue(field.id, event.target.value)}
                className={inputClass}
              />
            )}
            {field.type === 'slider' && (
              <div className="mt-3 rounded-xl bg-[#d9d9d9] px-5 py-5">
                <input
                  disabled={readonly}
                  type="range"
                  min={field.min ?? 0}
                  max={field.max ?? 100}
                  value={values[field.id] ?? field.min ?? 0}
                  onChange={(event) => setValue(field.id, event.target.value)}
                  className="w-full accent-[#ef3600]"
                />
                <div className="mt-2 text-sm font-bold text-neutral-600">{values[field.id] ?? field.min ?? 0}</div>
              </div>
            )}
            {field.type === 'radio' && (
              <div className="mt-3 grid gap-3 rounded-xl bg-[#d9d9d9] p-4 sm:grid-cols-2">
                {(field.options || []).map((option) => (
                  <label key={option} className="flex items-center gap-3 font-semibold">
                    <input
                      disabled={readonly}
                      type="radio"
                      name={field.id}
                      checked={values[field.id] === option}
                      onChange={() => setValue(field.id, option)}
                      className="accent-[#ef3600]"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
            {field.type === 'checkbox' && (
              <div className="mt-3 grid gap-3 rounded-xl bg-[#d9d9d9] p-4 sm:grid-cols-2">
                {(field.options || []).map((option) => {
                  const current = Array.isArray(values[field.id]) ? values[field.id] : []
                  return (
                    <label key={option} className="flex items-center gap-3 font-semibold">
                      <input
                        disabled={readonly}
                        type="checkbox"
                        checked={current.includes(option)}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...current, option]
                            : current.filter((item: string) => item !== option)
                          setValue(field.id, next)
                        }}
                        className="accent-[#ef3600]"
                      />
                      {option}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
