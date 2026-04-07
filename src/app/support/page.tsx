import Link from "next/link";

export default function SupportPage() {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Support</h1>
        <p className="text-gray-500 mb-10">We&apos;re here to help you get the most out of BulkPay.</p>

        <div className="space-y-8">
          {/* Contact */}
          <section className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Contact Us</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="text-white">support@nefotech.ng</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-gray-400">WhatsApp</p>
                  <p className="text-white">+234 801 234 5678</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-gray-400">Response time</p>
                  <p className="text-white">Within 24 hours on business days</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                { q: "How do payments work?", a: "All payments are processed securely through Paystack. When a contributor pays, funds go through Paystack's verified payment gateway before reaching your campaign." },
                { q: "What is an Ajo group?", a: "Ajo (also called Esusu) is a traditional Nigerian rotational savings system. Members contribute a fixed amount each cycle, and one member receives the total pool per cycle in rotating order." },
                { q: "Are there any fees?", a: "BulkPay is free to use. Standard Paystack transaction fees (1.5% + ₦100, capped at ₦2,000) apply to each payment." },
                { q: "How do I get my payout from an Ajo group?", a: "When it's your turn in the rotation and all members have contributed for that cycle, the payout is automatically marked as completed. The group creator manages the actual disbursement." },
                { q: "Can I cancel a campaign?", a: "Yes. Campaign organizers can deactivate a campaign at any time from their dashboard. Contributions already made are not automatically refunded — contact support for assistance." },
                { q: "Is my data safe?", a: "Yes. Passwords are hashed using PBKDF2 encryption, and all payment data is handled by Paystack's PCI-DSS compliant infrastructure. We never store card details." },
              ].map((faq, i) => (
                <div key={i} className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-5">
                  <h3 className="text-sm font-semibold text-white mb-1.5">{faq.q}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] py-6">
        <p className="text-center text-[11px] text-gray-600">© {new Date().getFullYear()} NefoTech.ng. Built for Nigeria.</p>
      </footer>
    </div>
  );
}
