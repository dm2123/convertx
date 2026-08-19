import { useState } from 'react'
import { RefreshCw, Copy, Check, Shield } from 'lucide-react'
import FaqSection from '../components/FaqSection'

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

export default function PasswordGeneratorTool({ tool }) {
  const [length, setLength] = useState(16)
  const [useUpper, setUseUpper] = useState(true)
  const [useLower, setUseLower] = useState(true)
  const [useDigits, setUseDigits] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = () => {
    let chars = ''
    if (useUpper) chars += UPPER
    if (useLower) chars += LOWER
    if (useDigits) chars += DIGITS
    if (useSymbols) chars += SYMBOLS
    if (!chars) {
      chars = LOWER
      setUseLower(true)
    }

    const arr = new Uint32Array(length)
    crypto.getRandomValues(arr)
    let result = Array.from(arr, (n) => chars[n % chars.length]).join('')

    // guarantee at least one of each selected type
    if (useUpper && !result.match(/[A-Z]/)) result = result.slice(1) + UPPER[crypto.getRandomValues(new Uint32Array(1))[0] % UPPER.length]
    if (useLower && !result.match(/[a-z]/)) result = result.slice(1) + LOWER[crypto.getRandomValues(new Uint32Array(1))[0] % LOWER.length]
    if (useDigits && !result.match(/[0-9]/)) result = result.slice(1) + DIGITS[crypto.getRandomValues(new Uint32Array(1))[0] % DIGITS.length]
    if (useSymbols && !result.match(/[^A-Za-z0-9]/)) result = result.slice(1) + SYMBOLS[crypto.getRandomValues(new Uint32Array(1))[0] % SYMBOLS.length]

    setPassword(result)
    setCopied(false)
  }

  const copy = () => {
    navigator.clipboard?.writeText(password).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const entropy = password.length * Math.log2(
    (useUpper ? 26 : 0) + (useLower ? 26 : 0) + (useDigits ? 10 : 0) + (useSymbols ? 31 : 0)
  )
  const strength = entropy >= 90 ? 'Very Strong' : entropy >= 60 ? 'Strong' : entropy >= 36 ? 'Medium' : 'Weak'
  const strengthColor =
    strength === 'Very Strong' ? 'text-green-600 dark:text-green-400' :
    strength === 'Strong' ? 'text-teal-600 dark:text-teal-400' :
    strength === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'

  const toggles = [
    { label: 'Uppercase (ABC)', checked: useUpper, set: setUseUpper },
    { label: 'Lowercase (abc)', checked: useLower, set: setUseLower },
    { label: 'Numbers (123)', checked: useDigits, set: setUseDigits },
    { label: 'Symbols (!@#)', checked: useSymbols, set: setUseSymbols },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="card p-6 mb-6 space-y-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="font-mono text-lg md:text-xl break-all text-gray-900 dark:text-white min-h-7">{password || 'Click generate karo...'}</p>
            {password && (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={copy} className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-200 transition-colors" aria-label="Copy">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={generate} className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition-colors" aria-label="Regenerate">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {password && <p className={`text-sm font-medium ${strengthColor}`}>Strength: {strength} ({Math.round(entropy)} bits)</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Length: {length} characters</label>
          <input type="range" min="6" max="40" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {toggles.map((t, i) => (
            <label key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer">
              <input type="checkbox" checked={t.checked} onChange={(e) => t.set(e.target.checked)} className="w-4 h-4 accent-teal-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t.label}</span>
            </label>
          ))}
        </div>

        <button onClick={generate} className="w-full btn-primary text-base py-4">
          Generate Password
        </button>
      </div>
      <FaqSection tool={tool} />
    </div>
  )
}