import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={`rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-gray-50 ${error ? 'border-red-500' : ''} ${className ?? ''}`}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
