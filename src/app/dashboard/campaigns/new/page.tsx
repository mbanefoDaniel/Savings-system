"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCampaignPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [showContributors, setShowContributors] = useState(true);
  const [error, setError] = useState("");
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

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          targetAmount: Number(targetAmount),
          fixedAmount: fixedAmount ? Number(fixedAmount) : undefined,
          deadline: deadline || undefined,
          showContributors,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create campaign");
        return;
      }

      router.push(`/dashboard/campaigns/${data.campaign.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header className="border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">B</span>
            </div>
            <span className="font-bold text-white">BulkPay</span>
          </Link>
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm text-gray-500">New Campaign</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">
          Create New Campaign
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1d27] rounded-2xl shadow-sm border border-white/[0.06] overflow-hidden"
        >
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1.5">
                Campaign Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-white/10 bg-[#232734] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                placeholder='e.g. "House Rent Contribution"'
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-white/10 bg-[#232734] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none"
                placeholder="Add details about this campaign..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Target Amount (₦) <span className="text-red-400">*</span>
                </label>
                <input
                  id="targetAmount"
                  type="number"
                  required
                  min={100}
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full border border-white/10 bg-[#232734] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  placeholder="e.g. 500000"
                />
              </div>

              <div>
                <label htmlFor="fixedAmount" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Fixed Contribution (₦)
                </label>
                <input
                  id="fixedAmount"
                  type="number"
                  min={100}
                  step="0.01"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(e.target.value)}
                  className="w-full border border-white/10 bg-[#232734] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  placeholder="Leave empty for flexible"
                />
                <p className="text-[11px] text-gray-500 mt-1.5">
                  If set, all contributors pay this exact amount
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1.5">
                Deadline (optional)
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-white/10 bg-[#232734] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <input
                id="showContributors"
                type="checkbox"
                checked={showContributors}
                onChange={(e) => setShowContributors(e.target.checked)}
                className="rounded border-white/10 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
              />
              <label htmlFor="showContributors" className="text-sm text-gray-300">
                Show contributors list publicly
              </label>
            </div>

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
                "Create Campaign"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
