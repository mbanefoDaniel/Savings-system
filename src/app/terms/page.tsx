import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 7, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p className="text-gray-400">By creating an account or using BulkPay, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. Description of Service</h2>
            <p className="text-gray-400">BulkPay is a platform that enables users to create bulk payment campaigns and participate in Ajo (Esusu) rotational savings groups. Payments are processed through Paystack.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. Account Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-400 space-y-1.5 ml-1">
              <li>You must provide accurate information when registering</li>
              <li>You are responsible for keeping your login credentials secure</li>
              <li>You must be at least 18 years old to use BulkPay</li>
              <li>One person may not maintain multiple accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. Campaigns</h2>
            <ul className="list-disc list-inside text-gray-400 space-y-1.5 ml-1">
              <li>Campaign organizers are solely responsible for the legitimate use of funds collected</li>
              <li>BulkPay does not guarantee the outcome or purpose of any campaign</li>
              <li>Contributors should verify the legitimacy of a campaign before paying</li>
              <li>BulkPay reserves the right to deactivate campaigns that violate these terms or Nigerian law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">5. Ajo Groups</h2>
            <ul className="list-disc list-inside text-gray-400 space-y-1.5 ml-1">
              <li>Ajo groups are peer-to-peer savings arrangements between members</li>
              <li>BulkPay facilitates tracking and reminders but does not guarantee payouts</li>
              <li>Members who fail to contribute may be marked as defaulters by the group system</li>
              <li>Group creators are responsible for managing disputes between members</li>
              <li>Payout order is determined by member position at the time of joining</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">6. Payments &amp; Fees</h2>
            <ul className="list-disc list-inside text-gray-400 space-y-1.5 ml-1">
              <li>All payments are processed in Nigerian Naira (NGN) through Paystack</li>
              <li>Standard Paystack transaction fees apply (1.5% + ₦100, capped at ₦2,000)</li>
              <li>BulkPay does not charge additional platform fees at this time</li>
              <li>Refund requests should be directed to the campaign organizer or group creator</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">7. Prohibited Use</h2>
            <p className="text-gray-400 mb-3">You may not use BulkPay to:</p>
            <ul className="list-disc list-inside text-gray-400 space-y-1.5 ml-1">
              <li>Collect funds for illegal activities</li>
              <li>Engage in fraud, money laundering, or financing of terrorism</li>
              <li>Impersonate another person or entity</li>
              <li>Interfere with or disrupt the platform&apos;s operation</li>
              <li>Scrape, crawl, or harvest data from the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">8. Limitation of Liability</h2>
            <p className="text-gray-400">BulkPay is provided &ldquo;as is&rdquo; without warranty of any kind. NefoTech.ng is not liable for any losses arising from the use of the platform, including but not limited to failed payments, defaulting Ajo members, or misuse of campaign funds by organizers.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">9. Termination</h2>
            <p className="text-gray-400">We may suspend or terminate your account at any time if you violate these terms. You may delete your account by contacting <span className="text-emerald-400">support@nefotech.ng</span>.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">10. Governing Law</h2>
            <p className="text-gray-400">These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State, Nigeria.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">11. Contact</h2>
            <p className="text-gray-400">Questions about these terms? Email <span className="text-emerald-400">support@nefotech.ng</span>.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] py-6 mt-8">
        <p className="text-center text-[11px] text-gray-600">© {new Date().getFullYear()} NefoTech.ng. Built for Nigeria.</p>
      </footer>
    </div>
  );
}
