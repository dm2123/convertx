import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send, MessageSquare, User, FileText, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSending(true)
    // Simulate sending
    await new Promise(r => setTimeout(r, 1500))
    setSending(false)
    setSubmitted(true)
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get in <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Have a question, suggestion, or need help? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Mail, title: 'Email', desc: 'dm7178072@gmail.com', detail: 'We respond within 24 hours' },
            { icon: MessageSquare, title: 'Feedback', desc: 'Share your ideas', detail: 'Help us improve ConvertX' },
            { icon: FileText, title: 'Documentation', desc: 'Browse our guides', detail: 'Learn how to use every tool' },
          ].map((item, i) => (
            <div key={i} className="card p-6 text-center">
              <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="card p-8 text-center animate-scale-in">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
              <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }} className="btn-secondary">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="name" value={form.name} onChange={handleChange} required
                    placeholder="Your name" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    placeholder="your@email.com" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Subject</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="subject" value={form.subject} onChange={handleChange}
                    placeholder="How can we help?" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                  placeholder="Tell us more..." className="input-field resize-none" />
              </div>
              <button type="submit" disabled={sending} className="w-full btn-primary flex items-center justify-center gap-2">
                {sending ? 'Sending...' : (<><Send className="w-4 h-4" /> Send Message</>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
