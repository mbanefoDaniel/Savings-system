"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function NewAjoGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY">("WEEKLY");
  const [maxMembers, setMaxMembers] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Subscription state
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [subPayLoading, setSubPayLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/subscription/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscriptionActive(data.active);
      setSubscriptionEndDate(data.endDate || null);
    } catch {
      setSubscriptionActive(false);
    } finally {
      setSubLoading(false);
    }
  }, [router]);

  // On mount: check subscription, and verify if returning from payment
  useEffect(() => {
    const subscriptionRef = searchParams.get("subscription_ref");
    if (subscriptionRef) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      setSubLoading(true);
      fetch("/api/subscription/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reference: subscriptionRef }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "active") {
            setSubscriptionActive(true);
            setSubscriptionEndDate(data.endDate);
          } else {
            setError("Subscription payment could not be verified. Please try again.");
            checkSubscription();
          }
        })
        .catch(() => {
          setError("Failed to verify subscription payment.");
          checkSubscription();
        })
        .finally(() => setSubLoading(false));
    } else {
      checkSubscription();
    }
  }, [searchParams, router, checkSubscription]);

  async function handleSubscribe() {
    setSubPayLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/subscription/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to initialize subscription payment");
        return;
      }
      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubPayLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/ajo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          contributionAmount: Number(contributionAmount),
          frequency,
          maxMembers: Number(maxMembers),
          startDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create group");
        return;
      }

      router.push(`/ajo/${data.group.id}`);
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
          <span className="text-sm text-gray-500">New Ajo Group</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create Ajo Group</h1>
        <p className="text-sm text-gray-500 mb-6">Set up a rotational savings group for your members</p>

        {/* Subscription loading */}
        {subLoading && (
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-8 flex items-center justify-center">
            <svg className="w-5 h-5 animate-spin text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm text-gray-400">Checking subscription status…</span>
          </div>
        )}

        {/* Subscription required prompt */}
        {!subLoading && !subscriptionActive && (
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Subscription Required</h2>
              <p className="text-sm text-gray-400 mb-1">
                To create Ajo groups, you need an active monthly subscription.
              </p>
              <p className="text-2xl font-bold text-emerald-400 mb-1">₦5,000<span className="text-sm font-normal text-gray-500">/month</span></p>
              <p className="text-xs text-gray-500 mb-6">One subscription covers unlimited group creation for 30 days.</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20 mb-4">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={handleSubscribe}
                disabled={subPayLoading}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {subPayLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Redirecting to payment…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay ₦5,000 to Subscribe
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Active subscription badge + form */}
        {!subLoading && subscriptionActive && (
          <>
            {subscriptionEndDate && (
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs p-3 rounded-xl border border-emerald-500/20 mb-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Subscription active until {new Date(subscriptionEndDate).toLocaleDateString()}
              </div>
            )}

        <form onSubmit={handleSubmit} className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] overflow-hidden">
          {error && (
            <div className="mx-6 mt-6 sm:mx-8 sm:mt-8 flex items-center gap-2 bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Group Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#232734] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                placeholder='e.g. "Office Ajo Group"'
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#232734] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none"
                placeholder="Brief description of this savings group..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Contribution Amount (₦) <span className="text-red-400">*</span>
                </label>
                <input
                  id="contributionAmount"
                  type="number"
                  required
                  min={100}
                  step="0.01"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full bg-[#232734] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  placeholder="e.g. 5000"
                />
              </div>

              <div>
                <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Number of Members <span className="text-red-400">*</span>
                </label>
                <input
                  id="maxMembers"
                  type="number"
                  required
                  min={2}
                  max={50}
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                  className="w-full bg-[#232734] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  placeholder="e.g. 10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Frequency <span className="text-red-400">*</span>
                </label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as "DAILY" | "WEEKLY")}
                  className="w-full bg-[#232734] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-[#232734] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Preview card */}
            {contributionAmount && maxMembers && (
              <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                <p className="text-xs font-medium text-emerald-400 mb-2">Payout Preview</p>
                <p className="text-sm text-emerald-300">
                  Each cycle, <span className="font-bold">{maxMembers} members</span> contribute{" "}
                  <span className="font-bold">
                    ₦{Number(contributionAmount).toLocaleString()}
                  </span>{" "}
                  = total payout of{" "}
                  <span className="font-bold">
                    ₦{(Number(contributionAmount) * Number(maxMembers)).toLocaleString()}
                  </span>{" "}
                  per turn.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating…
                </>
              ) : (
                "Create Ajo Group"
              )}
            </button>
          </div>
        </form>
          </>
        )}
      </main>
    </div>
  );
}
