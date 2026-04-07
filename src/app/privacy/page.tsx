import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-300">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-lg font-bold text-white">BulkPay</span>
          </Link>
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 7, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. Information We Collect</h2>
            <p className="text-gray-400 mb-3">When you create an account or use BulkPay, we may collect:</p>
            <ul className="list-disc list-inside text-gray-400 space-y-1.5 ml-1">
              <li>Your name, email address, and phone number (optional)</li>
              <li>Payment transaction data processed through Paystack</li>
              <li>Ajo group membership and contribution history</li>
              <li>Campaign details you create or contribute to</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-400 space-y-1.5 ml-1">
              <li>To create and manage your account</li>
              <li>To process payments and contributions via Paystack</li>
              <li>To send Ajo group reminders and payout notifications via WhatsApp (if you provided your number)</li>
              <li>To display contributor information to campaign organizers</li>
              <li>To improve our services and fix issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. Payment Security</h2>
            <p className="text-gray-400">All payments are processed by <span className="text-white">Paystack</span>, a PCI-DSS Level 1 compliant payment processor. We never store your card numbers, CVV, or bank login credentials. Paystack handles all sensitive payment data directly.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. Data Storage &amp; Security</h2>
            <p className="text-gray-400">Your password is hashed using PBKDF2 encryption and is never stored in plain text. We use HTTPS for all data transmission. Access to our database is restricted and monitored.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">5. WhatsApp Notifications</h2>
            <p className="text-gray-400">If you provide your WhatsApp number, we may send you Ajo contribution reminders and payout notifications through the WhatsApp Business API. You can remove your phone number from your profile at any time to stop receiving these messages.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">6. Data Sharing</h2>
            <p className="text-gray-400 mb-3">We do not sell your personal information. We share data only with:</p>
            <ul className="list-disc list-inside text-gray-400 space-y-1.5 ml-1">
              <li><span className="text-white">Paystack</span> — to process payments</li>
              <li><span className="text-white">Meta (WhatsApp Business API)</span> — to deliver notifications</li>
              <li><span className="text-white">Campaign organizers</span> — your name and email are visible when you contribute</li>
              <li><span className="text-white">Ajo group members</span> — your name is visible to other group members</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">7. Your Rights</h2>
            <p className="text-gray-400">You can request access to, correction of, or deletion of your personal data at any time by contacting us at <span className="text-emerald-400">support@nefotech.ng</span>.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">8. Changes to This Policy</h2>
            <p className="text-gray-400">We may update this policy from time to time. Changes will be posted on this page with an updated date.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">9. Contact</h2>
            <p className="text-gray-400">For privacy-related questions, email <span className="text-emerald-400">support@nefotech.ng</span>.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] py-6 mt-8">
        <p className="text-center text-[11px] text-gray-600">© {new Date().getFullYear()} NefoTech.ng. Built for Nigeria.</p>
      </footer>
    </div>
  );
}
