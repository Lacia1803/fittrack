import { useEffect, useState } from 'react'

export interface ToastProps {
  id?: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

type Listener = (toasts: ToastProps[]) => void
let listeners: Listener[] = []
let toasts: ToastProps[] = []

const toastLimit = 5

function addToast(toast: Omit<ToastProps, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9)
  const newToast = { ...toast, id }
  
  toasts = [newToast, ...toasts].slice(0, toastLimit)
  listeners.forEach((listener) => listener(toasts))

  if (toast.duration !== 0) {
    setTimeout(() => {
      dismissToast(id)
    }, toast.duration || 5000)
  }
}

function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  listeners.forEach((listener) => listener(toasts))
}

export function useToast() {
  const [state, setState] = useState<ToastProps[]>(toasts)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  }, [])

  return {
    toasts: state,
    toast: addToast,
    dismiss: dismissToast,
  }
}
