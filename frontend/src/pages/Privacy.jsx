import { Link } from 'react-router-dom'
import { ChevronRight, Home, Shield } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/"><Home className="w-4 h-4" /></Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">Privacy Policy</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Last updated: August 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              ConvertX is designed with privacy in mind. We collect minimal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li>Files you upload for processing (temporarily stored, automatically deleted)</li>
              <li>Basic analytics data (page views, usage patterns)</li>
              <li>Contact information if you reach out to us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Files</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Files uploaded for processing are used solely for the requested operation. They are automatically
              deleted from our servers within minutes of processing. We never access, read, share, or store your files
              beyond what is necessary to complete the requested operation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Client-Side Processing</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Many ConvertX tools process files entirely in your browser using JavaScript. These files never leave
              your device and are not uploaded to any server. Look for the "processed in browser" indicator on
              supported tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Cookies, Advertising and Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We use essential cookies for theme preferences and basic functionality. We may use privacy-respecting
              analytics to understand how our tools are used.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
              <strong>Advertising:</strong> ConvertX is free to use and is supported by advertising. We use Google
              AdSense, a third-party advertising service provided by Google LLC, to display advertisements on our site.
              Google, as a third-party vendor, uses cookies (including the DART cookie) to serve ads based on your
              prior visits to our site and other websites. Google's use of advertising cookies enables it and its
              partners to serve ads to you based on your visits to this site and/or other sites on the Internet.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
              You can opt out of personalized advertising by visiting{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">
                Google Ads Settings
              </a>. You can also opt out of some third-party vendors' use of cookies for personalized advertising by
              visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">www.aboutads.info</a>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
              When you visit our site, third-party ad networks may collect information such as your IP address,
              browser type, and pages visited to measure ad performance and deliver relevant ads. To learn more
              about how Google uses data, visit{' '}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">
                How Google uses information from sites that use its services
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We implement industry-standard security measures including HTTPS encryption, secure file handling,
              input validation, and regular security audits. Our infrastructure is designed to protect your data
              at every step.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              ConvertX does not sell, trade, or otherwise transfer your personal information to third parties.
              Third-party advertising partners (including Google AdSense) may use cookies as described above to
              serve ads on our site. AI-powered tools may send document content to AI providers for processing;
              this is clearly indicated in the tool description.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              ConvertX is not directed at children under 13. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update this privacy policy from time to time. Changes will be posted on this page with an updated
              revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Contact</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:dm7178072@gmail.com" className="text-brand-600 dark:text-brand-400 hover:underline">dm7178072@gmail.com</a>{' '}
              or through our{' '}
              <Link to="/contact" className="text-brand-600 dark:text-brand-400 hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
