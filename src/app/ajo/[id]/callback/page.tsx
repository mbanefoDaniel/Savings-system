"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AjoCallbackPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    reference ? "loading" : "failed"
  );
  const [message, setMessage] = useState(
    reference ? "" : "No payment reference found"
  );

  useEffect(() => {
    if (!reference) return;

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/pay/verify?reference=${encodeURIComponent(reference!)}`);
        const data = await res.json();

        if (res.ok && data.status === "success") {
          setStatus("success");
          setMessage("Your contribution was recorded successfully!");
        } else {
          setStatus("failed");
          setMessage(data.error || data.message || "Payment verification failed");
        }
      } catch {
        setStatus("failed");
        setMessage("Could not verify payment. Please contact the group admin.");
      }
    }

    verifyPayment();
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <div>
            <div className="w-14 h-14 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <h1 className="text-xl font-bold text-white">Verifying your contribution…</h1>
            <p className="text-gray-500 mt-2 text-sm">Please wait while we confirm your payment.</p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-[#1a1d27] rounded-2xl shadow-sm border border-white/[0.06] p-8">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Contribution Recorded!</h1>
            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
            <Link
              href="/ajo"
              className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Ajo Groups
            </Link>
          </div>
        )}

        {status === "failed" && (
          <div className="bg-[#1a1d27] rounded-2xl shadow-sm border border-white/[0.06] p-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Contribution Failed</h1>
            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
