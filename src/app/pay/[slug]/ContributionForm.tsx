"use client";

import { useState, FormEvent } from "react";

interface Props {
  campaignSlug: string;
  fixedAmount: number | null;
}

export default function ContributionForm({ campaignSlug, fixedAmount }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(fixedAmount ? fixedAmount / 100 : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/pay/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignSlug,
          contributorName: name,
          contributorEmail: email,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to initialize payment");
        setLoading(false);
        return;
      }

      // Redirect to Paystack checkout
      window.location.href = data.authorization_url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1a1d27] rounded-2xl shadow-sm border border-white/[0.06] overflow-hidden"
    >
      {/* Form header */}
      <div className="px-6 pt-6 pb-0 sm:px-8 sm:pt-8">
        <h2 className="text-base font-bold text-white mb-1">
          Make a Contribution
        </h2>
        <p className="text-xs text-gray-500">Fill in your details to proceed to payment</p>
      </div>

      {error && (
        <div className="mx-6 sm:mx-8 mt-4 flex items-center gap-2 bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="p-6 sm:p-8 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#232734] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#232734] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1.5">
            Amount (₦)
          </label>
          <input
            id="amount"
            type="number"
            required
            min={100}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!!fixedAmount}
            className="w-full bg-[#232734] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition disabled:bg-[#1a1d27] disabled:text-gray-500 disabled:cursor-not-allowed"
            placeholder="e.g. 5000"
          />
          {fixedAmount && (
            <p className="text-[11px] text-gray-500 mt-1.5">
              This campaign has a fixed contribution amount
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Redirecting to Paystack…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pay ₦{Number(amount || 0).toLocaleString()}
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Secured by Paystack &mdash; your payment is safe
        </div>
      </div>
    </form>
  );
}
