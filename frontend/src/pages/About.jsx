import { Link } from 'react-router-dom'
import { FileText, ArrowRightLeft, Shield, Sparkles, Zap, Globe, Heart, Users, Phone, Mail, Instagram, MessageCircle, ArrowRight } from 'lucide-react'

export default function About() {
  const stats = [
    { num: '82', label: 'Professional Tools', icon: Zap },
    { num: '5', label: 'Categories', icon: Globe },
    { num: '100%', label: 'Free to Use', icon: Heart },
    { num: '24/7', label: 'Always Available', icon: Users },
  ]

  const contact = [
    { icon: Phone, label: 'Phone / WhatsApp', value: '+91 7808658872', href: 'https://wa.me/917808658872' },
    { icon: Mail, label: 'Email', value: 'dm7178072@gmail.com', href: 'mailto:dm7178072@gmail.com' },
    { icon: Instagram, label: 'Instagram', value: '@mr_dinesh_hacker', href: 'https://instagram.com/mr_dinesh_hacker' },
    { icon: MessageCircle, label: 'Contact Page', value: 'Message bhejo - fast reply', href: '/contact' },
  ]

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 via-purple-500 to-pink-500 shadow-xl shadow-brand-500/30 mb-6">
            <img src="/logo.svg" alt="ConvertX logo" className="w-16 h-16 rounded-2xl" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">ConvertX</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ConvertX is a multiple-file-tools platform developed by <strong className="text-gray-900 dark:text-white">Maurya Software Technologies</strong>.
            Powerful, easy-to-use tools for processing, converting, and managing your documents - 100% free.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((s, i) => (
            <div key={i} className="card p-6 text-center">
              <s.icon className="w-6 h-6 text-brand-600 dark:text-brand-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.num}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: FileText, title: 'PDF Tools', desc: 'Compress, merge, split, rotate, edit, sign, protect and manage your PDF documents with 30+ specialized tools.' },
              { icon: ArrowRightLeft, title: 'Conversion Tools', desc: 'Convert between PDF, Word, Excel, PowerPoint, HTML, images and many more file formats seamlessly.' },
              { icon: Shield, title: 'Security Tools', desc: 'Protect your documents with passwords, remove restrictions, add digital signatures and redact sensitive content.' },
              { icon: Sparkles, title: 'AI-Powered Tools', desc: 'Leverage artificial intelligence to summarize documents, chat with PDFs, generate questions and analyze content.' },
            ].map((item, i) => (
              <div key={i} className="card p-6 flex gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/40 dark:to-purple-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our goal is to provide a comprehensive suite of file processing tools that are accessible to everyone,
            everywhere - completely free. No signup, no watermarks, no limits. Whether you need to compress a PDF,
            convert documents, edit files, or leverage AI for document analysis, ConvertX has you covered.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Privacy First</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We take your privacy seriously. All client-side processing happens directly in your browser.
            Files uploaded for server-side processing are automatically deleted after processing. We never store,
            share, or access your documents.
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-purple-600 to-pink-500 p-8 md:p-12 text-white mb-16 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-white/10 rounded-full" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Maurya Software Technologies</h2>
            <p className="text-white/85 mb-8 max-w-xl">
              ConvertX was developed by Maurya Software Technologies with the vision of making professional file tools
              accessible to everyone. Koi sawal, suggestion ya bug report ho toh bina jhijhak contact karo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contact.map((c, i) => {
                const inner = (
                  <>
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                      <c.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-white/70 font-medium uppercase tracking-wide">{c.label}</div>
                      <div className="font-semibold">{c.value}</div>
                    </div>
                  </>
                )
                const cls = 'flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur rounded-2xl p-4 transition-colors'
                return c.href && c.href.startsWith('http') ? (
                  <a key={i} href={c.href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
                ) : (
                  <Link key={i} to={c.href} className={cls}>{inner}</Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/tools" className="btn-primary inline-flex items-center gap-2">
            Explore Our Tools <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

