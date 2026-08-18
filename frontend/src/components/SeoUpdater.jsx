import { useEffect } from 'react'

const SITE = 'https://convertx2026.netlify.app'

export default function SeoUpdater({ title, description, canonicalPath, jsonLd }) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      let el = document.querySelector('meta[name="description"]')
      if (!el) {
        el = document.createElement('meta')
        el.name = 'description'
        document.head.appendChild(el)
      }
      el.content = description
    }
    if (canonicalPath) {
      let el = document.querySelector('link[rel="canonical"]')
      if (!el) {
        el = document.createElement('link')
        el.rel = 'canonical'
        document.head.appendChild(el)
      }
      el.href = SITE + canonicalPath
    }
    let ld = document.getElementById('page-jsonld')
    if (jsonLd) {
      if (!ld) {
        ld = document.createElement('script')
        ld.type = 'application/ld+json'
        ld.id = 'page-jsonld'
        document.head.appendChild(ld)
      }
      ld.textContent = JSON.stringify(jsonLd)
    } else if (ld) {
      ld.remove()
    }
  }, [title, description, canonicalPath, jsonLd])

  return null
}