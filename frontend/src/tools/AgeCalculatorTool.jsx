import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import FaqSection from '../components/FaqSection'

export default function AgeCalculatorTool({ tool }) {
  const [dob, setDob] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const calculate = () => {
    setError(null)
    if (!dob) {
      setError('Apni birth date select karo.')
      return
    }
    const birth = new Date(dob)
    if (isNaN(birth) || birth > new Date()) {
      setError('Invalid date - birth date future mein nahi ho sakti.')
      return
    }
    const now = new Date()
    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    let days = now.getDate() - birth.getDate()

    if (days < 0) {
      months -= 1
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      days += prevMonth.getDate()
    }
    if (months < 0) {
      years -= 1
      months += 12
    }

    const totalDays = Math.floor((now - birth) / 86400000)
    const totalWeeks = Math.floor(totalDays / 7)
    const totalMonths = years * 12 + months
    const totalHours = totalDays * 24

    const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1)
    const daysUntilBirthday = Math.ceil((nextBirthday - now) / 86400000)

    setResult({ years, months, days, totalDays, totalWeeks, totalMonths, totalHours, daysUntilBirthday })
  }

  const stats = result ? [
    { label: 'Years', value: result.years },
    { label: 'Months', value: result.months },
    { label: 'Days', value: result.days },
    { label: 'Total Days', value: result.totalDays.toLocaleString() },
    { label: 'Total Weeks', value: result.totalWeeks.toLocaleString() },
    { label: 'Total Months', value: result.totalMonths.toLocaleString() },
    { label: 'Total Hours', value: result.totalHours.toLocaleString() },
    { label: 'Next Birthday in', value: `${result.daysUntilBirthday} days` },
  ] : []

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="w-7 h-7 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      <div className="card p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Birth Date</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button onClick={calculate} className="w-full btn-primary text-base py-4">
          Calculate Age
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-scale-in">
          {stats.map((s, i) => (
            <div key={i} className="card p-5 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <FaqSection tool={tool} />
    </div>
  )
}