import { Link } from 'react-router-dom'
import { FileText, ArrowRightLeft, Shield, Sparkles, Users, Zap, Globe, Heart } from 'lucide-react'

export default function About() {
  const stats = [
    { num: '71', label: 'Professional Tools', icon: Zap },
    { num: '5', label: 'Categories', icon: Globe },
    { num: '100%', label: 'Free to Use', icon: Heart },
    { num: '24/7', label: 'Always Available', icon: Users },
  ]

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">ConvertX</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ConvertX is a multiple-file-tools platform created by <strong className="text-gray-900 dark:text-white">Dinesh Maurya</strong>.
            We provide powerful, easy-to-use tools for processing, converting, and managing your documents.
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

        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Our goal is to provide a comprehensive suite of file processing tools that are accessible to everyone.
            Whether you need to compress a PDF, convert images, edit documents, or leverage AI for document analysis,
            ConvertX has you covered.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              { icon: FileText, title: 'PDF Tools', desc: 'Compress, merge, split, rotate, edit, sign, protect and manage your PDF documents with 30+ specialized tools.' },
              { icon: ArrowRightLeft, title: 'Conversion Tools', desc: 'Convert between PDF, Word, Excel, PowerPoint, HTML, images and many more file formats seamlessly.' },
              { icon: Shield, title: 'Security Tools', desc: 'Protect your documents with passwords, remove restrictions, add digital signatures and redact sensitive content.' },
              { icon: Sparkles, title: 'AI-Powered Tools', desc: 'Leverage artificial intelligence to summarize documents, chat with PDFs, generate questions and analyze content.' },
            ].map((item, i) => (
              <div key={i} className="card p-6 flex gap-4">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Privacy First</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We take your privacy seriously. All client-side processing happens directly in your browser.
            Files uploaded for server-side processing are automatically deleted after processing. We never store,
            share, or access your documents.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Creator</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            ConvertX was created by <strong className="text-gray-900 dark:text-white">Dinesh Maurya</strong> with the vision
            of making professional file tools accessible to everyone, everywhere.
          </p>
        </div>

        <div className="text-center mt-12">
          <Link to="/tools" className="btn-primary inline-flex items-center gap-2">
            Explore Our Tools <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
