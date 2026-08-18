import { Link } from 'react-router-dom'
import { ChevronRight, Home, FileText } from 'lucide-react'

export default function Terms() {
  return (
    <div className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/"><Home className="w-4 h-4" /></Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">Terms of Service</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Last updated: August 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By accessing and using ConvertX, you agree to be bound by these Terms of Service.
              If you do not agree with these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              ConvertX provides online file processing tools including PDF manipulation, file conversion,
              document editing, security features, and AI-assisted document workflows. The service is provided
              "as is" and may be updated or modified at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. User Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li>You are responsible for the files you upload and process</li>
              <li>You must have the right to process any files you upload</li>
              <li>You must not use the service for illegal purposes</li>
              <li>You must not attempt to exploit or abuse the service</li>
              <li>You must not redistribute or resell the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              All rights, title, and interest in the ConvertX service and its original content remain the exclusive
              property of ConvertX and its licensors. The service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. File Ownership</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              You retain all rights to files you upload to ConvertX. We do not claim ownership of any content
              you process through our tools. Files are automatically deleted after processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              ConvertX shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of the service. We are not responsible for any loss of data or files.
              Always keep backups of important documents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Service Availability</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We strive to keep ConvertX available at all times, but we do not guarantee uninterrupted access.
              The service may be temporarily unavailable for maintenance or due to circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Free Usage</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              ConvertX is free to use. We reserve the right to implement usage limits or introduce premium features
              in the future. Free users will always have access to core functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after changes
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Contact</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              For questions about these terms, please visit our{' '}
              <Link to="/contact" className="text-brand-600 dark:text-brand-400 hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
