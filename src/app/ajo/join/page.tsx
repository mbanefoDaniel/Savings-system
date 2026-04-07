"use client";

import { Suspense, useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function JoinAjoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-9 h-9 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <JoinAjoContent />
    </Suspense>
  );
}

function JoinAjoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setInviteCode(code);
    }
  }, [searchParams]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Extract slug from link or use raw code
    let slug = inviteCode.trim();
    try {
      const url = new URL(slug);
      const parts = url.pathname.split("/");
      slug = parts[parts.length - 1] || parts[parts.length - 2];
    } catch {
      // Not a URL, use as-is
    }

    try {
      const res = await fetch(`/api/ajo/${encodeURIComponent(slug)}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to join group");
        return;
      }

      // Redirect to the group page using the slug
      router.push(`/ajo/${slug}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header className="bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-3">
          <Link href="/ajo" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">B</span>
            </div>
            <span className="font-bold text-white">BulkPay</span>
          </Link>
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm text-gray-500">Join Group</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Join an Ajo Group</h1>
          <p className="text-sm text-gray-500">Enter the invite link or group code shared with you</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-6 sm:p-8">
          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1.5">
              Invite Link or Group Code
            </label>
            <input
              id="code"
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full bg-[#232734] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              placeholder="e.g. https://bulkpay.com/ajo/abc-123 or abc-123"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Joining…
              </>
            ) : (
              "Join Group"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
