"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("organizer", JSON.stringify(data.organizer));
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-[#0f1117]">
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-15%] w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-emerald-500/[0.04] rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />
        <div className="absolute top-[50%] right-[50%] w-[300px] h-[300px] bg-teal-500/[0.03] rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="w-full max-w-[440px] relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
              <span className="text-white font-bold text-base">B</span>
            </div>
            <span className="text-xl font-bold text-white">BulkPay</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d27]/80 backdrop-blur-2xl rounded-3xl shadow-xl shadow-black/20 border border-white/[0.06] p-7 sm:p-9">
          <div className="text-center mb-7">
            <h1 className="text-[22px] sm:text-2xl font-bold text-white mb-1.5">
              Create your account
            </h1>
            <p className="text-sm text-gray-400">
              Start collecting payments in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 text-red-400 text-[13px] p-3.5 rounded-2xl border border-red-500/20 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-[13px] font-semibold text-gray-400 mb-2">
                Full name
              </label>
              <div className={`relative rounded-2xl transition-all duration-200 ${focused === "name" ? "ring-2 ring-emerald-500/30" : ""}`}>
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200 ${focused === "name" ? "bg-emerald-500/10 text-emerald-400" : "bg-[#232734] text-gray-500"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  className="w-full border border-white/10 rounded-2xl pl-14 pr-4 py-3.5 text-sm text-gray-200 bg-[#232734]/60 placeholder:text-gray-600 transition-all duration-200 hover:border-white/20 focus:border-emerald-500 focus:outline-none focus:bg-[#232734]"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-gray-400 mb-2">
                Email address
              </label>
              <div className={`relative rounded-2xl transition-all duration-200 ${focused === "email" ? "ring-2 ring-emerald-500/30" : ""}`}>
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200 ${focused === "email" ? "bg-emerald-500/10 text-emerald-400" : "bg-[#232734] text-gray-500"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="w-full border border-white/10 rounded-2xl pl-14 pr-4 py-3.5 text-sm text-gray-200 bg-[#232734]/60 placeholder:text-gray-600 transition-all duration-200 hover:border-white/20 focus:border-emerald-500 focus:outline-none focus:bg-[#232734]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="phone" className="block text-[13px] font-semibold text-gray-400 mb-2">
                WhatsApp number <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <div className={`relative rounded-2xl transition-all duration-200 ${focused === "phone" ? "ring-2 ring-emerald-500/30" : ""}`}>
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200 ${focused === "phone" ? "bg-emerald-500/10 text-emerald-400" : "bg-[#232734] text-gray-500"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setFocused("phone")}
                  onBlur={() => setFocused(null)}
                  className="w-full border border-white/10 rounded-2xl pl-14 pr-4 py-3.5 text-sm text-gray-200 bg-[#232734]/60 placeholder:text-gray-600 transition-all duration-200 hover:border-white/20 focus:border-emerald-500 focus:outline-none focus:bg-[#232734]"
                  placeholder="2348012345678"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5 ml-1">For Ajo group reminders via WhatsApp</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[13px] font-semibold text-gray-400 mb-2">
                Password
              </label>
              <div className={`relative rounded-2xl transition-all duration-200 ${focused === "password" ? "ring-2 ring-emerald-500/30" : ""}`}>
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200 ${focused === "password" ? "bg-emerald-500/10 text-emerald-400" : "bg-[#232734] text-gray-500"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="w-full border border-white/10 rounded-2xl pl-14 pr-12 py-3.5 text-sm text-gray-200 bg-[#232734]/60 placeholder:text-gray-600 transition-all duration-200 hover:border-white/20 focus:border-emerald-500 focus:outline-none focus:bg-[#232734]"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-[#232734] hover:text-gray-300 transition-all duration-200"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level ? strengthColor[passwordStrength] : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] font-medium ${
                    passwordStrength === 1 ? "text-red-500" : passwordStrength === 2 ? "text-amber-500" : "text-emerald-500"
                  }`}>
                    {strengthLabel[passwordStrength]}
                    {passwordStrength < 3 && password.length < 8 && ` \u00b7 ${8 - password.length} more needed`}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-3.5 rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-500/40 hover:bg-emerald-400 hover:-translate-y-0.5 active:translate-y-0 active:shadow-emerald-500/20 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Terms note */}
          <p className="text-[11px] text-gray-500 text-center mt-4 leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Bottom link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors duration-200">
            Sign in
          </Link>
        </p>

        {/* Trust row */}
        <div className="flex items-center justify-center gap-4 mt-5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            No credit card
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full" />
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
            <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Free forever
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full" />
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Paystack powered
          </div>
        </div>
      </div>
    </div>
  );
}
