import { createContext, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

type ToastType = 'success' | 'error'
type Toast = { id: number; message: string; type: ToastType }

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useMemo(
    () => (message: string, type: ToastType = 'error') => {
      const id = Date.now()
      setToasts((items) => [...items, { id, message, type }])
      window.setTimeout(() => {
        setToasts((items) => items.filter((toast) => toast.id !== id))
      }, 5000)
    },
    [],
  )

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed left-1/2 top-5 z-50 flex w-[min(92vw,460px)] -translate-x-1/2 flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.96 }}
              className={`flex items-center gap-3 rounded-[22px] border px-5 py-4 text-sm font-semibold shadow-2xl backdrop-blur-xl ${
                toast.type === 'success'
                  ? 'border-emerald-200 bg-white/95 text-emerald-700'
                  : 'border-red-200 bg-white/95 text-red-700'
              }`}
            >
              {toast.type === 'success' ? <FiCheckCircle size={22} /> : <FiXCircle size={22} />}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
