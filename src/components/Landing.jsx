// src/components/Landing.jsx
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Sparkles, Shield, Zap } from 'lucide-react';

export const Landing = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="pt-20 pb-32 text-center px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Single Source of Truth for Your Availability. End Double-Bookings Now.
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Accurately sync Google, Outlook, and Microsoft 365 to calculate accurate free/busy time.
        </p>
        <Button size="lg" onClick={onGetStarted}>
          Start Syncing for Free
        </Button>
        <p className="text-sm text-gray-500 mt-4">No credit card required.</p>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Absolute Accuracy</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Never worry about double bookings or synchronization errors again. We handle all the cross-referencing.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Workflow Control</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Stop wasting time switching tabs and apps. Access a single, dedicated view of your full schedule instantly.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Protect Your Focus</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Easily block time for deep work, personal life, or recovery. Our tool creates private, busy entries to set temporal boundaries and mitigate burnout.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works (3 Steps)</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-blue-600 mb-2">1</div>
            <h3 className="font-semibold mb-2">Connect Securely</h3>
            <p className="text-gray-600">Explain OAuth 2.0 connection to Google and Microsoft Graph API, emphasizing security and ease of setup to manage the Integration Chore.</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-blue-600 mb-2">2</div>
            <h3 className="font-semibold mb-2">Sync & Calculate</h3>
            <p className="text-gray-600">Describe how the engine merges all calendars to calculate true, accurate availability.</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-blue-600 mb-2">3</div>
            <h3 className="font-semibold mb-2">Set Your Boundaries</h3>
            <p className="text-gray-600">Detail the simple mechanism for defining “Focus Time” or “Family Time” which automatically creates a Cross-Calendar Block.</p>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">Confidence in Every Connection</h2>
        <ul className="max-w-3xl mx-auto space-y-4 text-left">
          <li className="flex items-start gap-3">
            <span className="text-green-600">Check</span>
            <strong>Privacy First:</strong> Stored securely and designed to keep information protected.
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600">Check</span>
            <strong>Enterprise Readiness:</strong> Built with support for advanced security protocols like Modern Authentication (MFA/AzureMFA) in mind.
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600">Check</span>
            <strong>Unified API Access:</strong> We access calendars via the Google Calendar API and Microsoft Graph API, ensuring seamless interoperability.
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600">Check</span>
            <strong>Avoid Proprietary Limitations:</strong> External events are treated as read-only to respect source calendar limitations.
          </li>
        </ul>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Proof of Value and Testimonials</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <blockquote className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
            <p className="italic mb-4">
              “Don’t just take our word for it. I used to juggle three calendars and still double-book clients. This tool gave me my time back.”
            </p>
            <cite className="text-sm font-semibold">— Sarah L., Consultant</cite>
          </blockquote>
          <blockquote className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
            <p className="italic mb-4">
              “More elegant than Calendly. I can finally protect deep work blocks without leaking them to clients.”
            </p>
            <cite className="text-sm font-semibold">— Mark T., Freelancer</cite>
          </blockquote>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 text-center bg-blue-600 text-white">
        <h2 className="text-3xl font-bold mb-4">Smarter, simpler scheduling. Get Started Free.</h2>
        <Button variant="secondary" size="lg" onClick={onGetStarted}>
          Start Syncing for Free
        </Button>
        <p className="mt-4 text-sm opacity-90">No credit card required.</p>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm text-gray-500">
        <p>© 2025 Unified Availability. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Support/FAQs</a>
          <a href="#" className="hover:underline">Help Docs</a>
        </div>
      </footer>
    </div>
  );
};