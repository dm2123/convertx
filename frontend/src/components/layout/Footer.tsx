import { Link } from 'react-router-dom';
import { Github, Instagram, Mail } from 'lucide-react';

const TOOL_LINKS = [
  { label: 'PDF Tools', to: '/tools?category=PDF' },
  { label: 'Convert', to: '/tools?category=Convert' },
  { label: 'Edit', to: '/tools?category=Edit' },
  { label: 'Security', to: '/tools?category=Security' },
  { label: 'AI Tools', to: '/tools?category=AI' },
  { label: 'Utilities', to: '/tools?category=Utilities' },
];

const COMPANY_LINKS = [
  { label: 'Downloads', to: '/downloads' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

const POPULAR_LINKS = [
  { label: 'Compress PDF', to: '/tools/compress-pdf' },
  { label: 'Merge PDF', to: '/tools/merge-pdf' },
  { label: 'JPG to PDF', to: '/tools/jpg-to-pdf' },
  { label: 'PDF to Word', to: '/tools/pdf-to-word' },
  { label: 'Protect PDF', to: '/tools/protect-pdf' },
];

function LinkColumn({ title, links }: { title: string; links: Array<{ label: string; to: string }> }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to + l.label}>
            <Link
              to={l.to}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="ConvertX logo" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">ConvertX</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              One platform. Every file tool you need — free, fast and private.
            </p>
          </div>
          <LinkColumn title="Tools" links={TOOL_LINKS} />
          <LinkColumn title="Company" links={COMPANY_LINKS} />
          <LinkColumn title="Popular" links={POPULAR_LINKS} />
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} ConvertX. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/dm2123/convertx"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="ConvertX on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com/mr_dinesh_hacker"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="ConvertX on Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="mailto:dm7178072@gmail.com"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Email ConvertX"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
