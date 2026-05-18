'use client'

import { useToast } from '@/hooks/use-toast'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2">
      {toasts.map(({ id, title, description, variant }) => {
        const isDestructive = variant === 'destructive'
        const isSuccess = variant === 'success'

        return (
          <div
            key={id}
            className={cn(
              'group pointer-events-auto relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-auto sm:slide-in-from-right-5',
              {
                'border-red-500/20 bg-red-950/90 text-red-100': isDestructive,
                'border-green-500/20 bg-green-950/90 text-green-100': isSuccess,
                'border-slate-700 bg-slate-800/95 text-slate-100': !isDestructive && !isSuccess,
              }
            )}
          >
            <div className="flex gap-3">
              {isDestructive && <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
              {isSuccess && <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />}
              {!isDestructive && !isSuccess && <Info className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />}
              
              <div className="grid gap-1">
                {title && <h3 className="font-semibold text-sm leading-none">{title}</h3>}
                {description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => id && dismiss(id)}
              className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
