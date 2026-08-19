import { useState } from 'react'
import { Shield, Check, X } from 'lucide-react'
import FaqSection from '../components/FaqSection'

export default function PasswordStrengthTool({ tool }) {
  const [password, setPassword] = useState('')

  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: '12+ characters', pass: password.length >= 12 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special character (!@#$...)', pass: /[^A-Za-z0-9]/.test(password) },
    { label: 'No common words', pass: password.length > 0 && !/^(password|123456|qwerty|admin|letmein|welcome|monkey|dragon|login|abc123)/i.test(password) },
  ]

  const passed = checks.filter(c => c.pass).length
  const score = password.length === 0 ? 0 : Math.round((passed / checks.length) * 100)
  const strength = score >= 85 ? 'Very Strong' : score >= 60 ? 'Strong' : score >= 35 ? 'Medium' : 'Weak'
  const color = score >= 85 ? 'text-green-500 bg-green-500' : score >= 60 ? 'text-teal-500 bg-teal-500' : score >= 35 ? 'text-amber-500 bg-amber-500' : 'text-red-500 bg-red-500'
  const textColor = score >= 85 ? 'text-green-600 dark:text-green-400' : score >= 60 ? 'text-teal-600 dark:text-teal-400' : score >= 35 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="card p-6 mb-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apna password type karo</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password type karo..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
        </div>

        {password && (
          <>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{score}<span className="text-lg text-gray-500">/100</span></div>
              <div className={`text-lg font-semibold ${textColor}`}>{strength}</div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className={`${color} h-3 rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {c.pass ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                  <span className={c.pass ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>{c.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <FaqSection tool={tool} />
    </div>
  )
}