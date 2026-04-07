"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Verify admin access
      const checkRes = await fetch("/api/admin/verify", {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      if (!checkRes.ok) {
        setError("You do not have admin access");
        return;
      }

      localStorage.setItem("admin_token", data.token);
      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f1117]">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/25">
              <span className="text-white font-bold text-base">A</span>
            </div>
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </Link>
        </div>

        <div className="bg-[#1a1d27]/80 backdrop-blur-2xl rounded-3xl shadow-xl shadow-black/20 border border-white/[0.06] p-7 sm:p-9">
          <div className="text-center mb-7">
            <h1 className="text-xl font-bold text-white mb-1.5">Admin Sign In</h1>
            <p className="text-sm text-gray-400">Restricted access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-[13px] p-3.5 rounded-2xl border border-red-500/20">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-gray-400 mb-2">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-gray-200 bg-[#232734]/60 placeholder:text-gray-600 focus:border-red-500 focus:outline-none"
                placeholder="admin@nefotech.ng"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-semibold text-gray-400 mb-2">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-gray-200 bg-[#232734]/60 placeholder:text-gray-600 focus:border-red-500 focus:outline-none"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-3.5 rounded-2xl text-sm font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 disabled:opacity-50 hover:bg-red-400 hover:shadow-red-500/40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </span>
              ) : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
