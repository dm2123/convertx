import { Link } from 'react-router-dom'
import { Monitor, Apple, Terminal, Smartphone, Download, ExternalLink, Zap, ArrowRight } from 'lucide-react'

const DOWNLOADS = [
  {
    os: 'Windows',
    icon: Monitor,
    desc: 'Windows 10/11 ke liye app. Download karo, zip extract karo, ConvertX.exe chalao. Koi installation nahi.',
    file: 'https://github.com/dm2123/convertx/releases/latest/download/ConvertX-Windows.zip',
    size: '~150 MB',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    os: 'macOS',
    icon: Apple,
    desc: 'macOS (Intel + Apple Silicon) ke liye DMG installer. Download karke app folder mein drag & drop karo.',
    file: 'https://github.com/dm2123/convertx/releases/latest/download/ConvertX-macOS.dmg',
    size: '~120 MB',
    accent: 'from-gray-600 to-gray-400',
  },
  {
    os: 'Linux',
    icon: Terminal,
    desc: 'Linux (Ubuntu, Debian, Fedora, Arch) ke liye AppImage. File ko executable banao aur chalao - koi dependency nahi.',
    file: 'https://github.com/dm2123/convertx/releases/latest/download/ConvertX-Linux.AppImage',
    size: '~90 MB',
    accent: 'from-orange-500 to-amber-400',
  },
  {
    os: 'Android',
    icon: Smartphone,
    desc: 'Android 7+ ke liye APK. ConvertX app phone mein install karo - saare 79 tools mobile par.',
    file: 'https://github.com/dm2123/convertx/releases/latest/download/ConvertX-Android.apk',
    size: '~3.4 MB',
    accent: 'from-green-500 to-emerald-400',
  },
]

const APP_STORES = [
  {
    name: 'APKPure',
    desc: 'Sabse popular free Android app store. APK yahan upload karte hain log worldwide download karte hain.',
    file: 'https://apkpure.com/',
    accent: 'from-teal-500 to-emerald-400',
  },
  {
    name: 'Aptoide',
    desc: 'Open Android app store - free account banao aur apna app publish karo.',
    file: 'https://aptoide.com/',
    accent: 'from-rose-500 to-pink-400',
  },
  {
    name: 'F-Droid',
    desc: 'Open-source app store - developer ko source code ke saath app publish karna hota hai.',
    file: 'https://f-droid.org/',
    accent: 'from-indigo-500 to-blue-400',
  },
]

export default function Downloads() {
  return (
    <div className="py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 via-purple-500 to-pink-500 shadow-xl shadow-brand-500/30 mb-6">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Download <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">ConvertX</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            saare 79 tools ab desktop app aur mobile app ke roop mein bhi available hain.
            Apne OS ke liye download karo - bilkul free, koi signup nahi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {DOWNLOADS.map((d, i) => (
            <div key={i} className="card p-6 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${d.accent} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <d.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{d.os}</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{d.size}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 flex-1">{d.desc}</p>
              <a
                href={d.file}
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Download for {d.os} <Download className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="card p-6 md:p-8 mb-12 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Web version try karna chahte ho?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Koi bhi file kholo, koi installation nahi. Browser mein sab kuch free mein chalta hai.
            </p>
          </div>
          <Link to="/tools" className="btn-primary inline-flex items-center gap-2 flex-shrink-0">
            Open Web Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Play Store ke bina bhi free app stores
          </h3>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            ConvertX ab free Android app stores par bhi available hai. Yahan se APK download karke install karo - 100% free.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {APP_STORES.map((s, i) => (
              <a key={i} href={s.file} target="_blank" rel="noopener noreferrer" className="card p-6 block hover:shadow-xl transition-shadow group">
                <div className={`w-12 h-12 bg-gradient-to-br ${s.accent} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Download className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{s.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{s.desc}</p>
                <span className="text-sm font-medium text-brand-600 dark:text-brand-400 inline-flex items-center gap-1">
                  Visit {s.name} <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Problem aa rahi hai download mein?{' '}
          <Link to="/contact" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
            Contact Dinesh Maurya
          </Link>{' '}
          <ExternalLink className="w-3.5 h-3.5 inline" />
        </div>
      </div>
    </div>
  )
}
