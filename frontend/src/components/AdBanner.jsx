import { useEffect, useRef } from 'react'

export default function AdBanner({ slot, autorelaxed = false }) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    const t = setTimeout(() => {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {
        /* ad script not loaded yet */
      }
    }, 100)
    return () => clearTimeout(t)
  }, [])

  if (autorelaxed) {
    return (
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="autorelaxed"
          data-ad-client="ca-pub-1547520859488681"
          data-ad-slot={slot}
        />
      </div>
    )
  }

  return (
    <div className="flex justify-center py-4 min-h-[90px]">
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '728px', height: '90px' }}
        data-ad-client="ca-pub-1547520859488681"
        data-ad-slot={slot}
      />
    </div>
  )
}
