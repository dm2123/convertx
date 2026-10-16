import { useEffect } from 'react';

const SITE = 'https://dm2123.github.io/convertx';

interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string[];
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function upsertMeta(name: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertCanonical(path: string): void {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = SITE + path;
}

function upsertJsonLd(data: SeoProps['jsonLd']): void {
  const ID = 'page-jsonld';
  let el = document.getElementById(ID);
  if (data) {
    if (!el) {
      el = document.createElement('script');
      el.id = ID;
      (el as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  } else if (el) {
    el.remove();
  }
}

/** Keeps <title>, meta description/keywords, canonical and JSON-LD in sync per page. */
export function Seo({ title, description, canonicalPath, keywords, jsonLd }: SeoProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta('description', description);
    if (keywords?.length) upsertMeta('keywords', keywords.join(', '));
    if (canonicalPath) upsertCanonical(canonicalPath);
    upsertJsonLd(jsonLd);
  }, [title, description, canonicalPath, keywords, jsonLd]);

  return null;
}
