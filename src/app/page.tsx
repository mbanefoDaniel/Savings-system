import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f1117]/80 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-lg font-bold text-white">BulkPay</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition px-2 sm:px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-emerald-500 text-white px-4 sm:px-5 py-2 rounded-full hover:bg-emerald-400 shadow-sm shadow-emerald-500/20 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Background decor */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/[0.05] rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-24 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Built for Nigeria · Powered by Paystack
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
              Split payments,
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                collect effortlessly
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Create a campaign, share a link, and let contributors pay
              individually. Perfect for rent, events, gifts, and group purchases.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-emerald-500 text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5"
              >
                Create a Campaign
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center border border-white/10 text-gray-300 px-8 py-3.5 rounded-full text-base font-semibold hover:bg-white/5 hover:border-white/20 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
          <p className="text-center text-xs font-semibold tracking-widest text-gray-500 uppercase mb-10">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="group relative bg-[#1a1d27] rounded-2xl p-7 border border-white/[0.06] hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="text-xs font-semibold text-emerald-400 mb-2">Step 1</div>
              <h3 className="font-bold text-white mb-1.5">Share a Link</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Generate a unique payment link and share via WhatsApp, email, or social media.
              </p>
            </div>

            <div className="group relative bg-[#1a1d27] rounded-2xl p-7 border border-white/[0.06] hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="text-xs font-semibold text-violet-400 mb-2">Step 2</div>
              <h3 className="font-bold text-white mb-1.5">Pay via Paystack</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Contributors pay securely with cards, bank transfers, or USSD through Paystack.
              </p>
            </div>

            <div className="group relative bg-[#1a1d27] rounded-2xl p-7 border border-white/[0.06] hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-xs font-semibold text-amber-400 mb-2">Step 3</div>
              <h3 className="font-bold text-white mb-1.5">Track Progress</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                See real-time progress, contributor list, and remaining balance on each campaign.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">B</span>
            </div>
            <span className="text-sm font-semibold text-gray-400">BulkPay</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} NefoTech.ng. Built for Nigeria.
          </p>
        </div>
      </footer>
    </div>
  );
}
