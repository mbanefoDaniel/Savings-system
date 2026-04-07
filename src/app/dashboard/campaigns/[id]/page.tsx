"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Contribution {
  id: string;
  contributorName: string;
  contributorEmail: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  paidAt: string | null;
  createdAt: string;
}

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  targetAmount: number;
  collectedAmount: number;
  fixedAmount: number | null;
  isActive: boolean;
  showContributors: boolean;
  deadline: string | null;
  createdAt: string;
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(kobo / 100);
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const [campRes, contribRes] = await Promise.all([
        fetch(`/api/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/campaigns/${id}/contributions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (campRes.status === 401) {
        router.push("/login");
        return;
      }

      const campData = await campRes.json();
      const contribData = await contribRes.json();

      setCampaign(campData.campaign || null);
      setContributions(contribData.contributions || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function toggleActive() {
    if (!campaign) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/campaigns/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: !campaign.isActive }),
    });
    setCampaign({ ...campaign, isActive: !campaign.isActive });
  }

  function copyLink() {
    if (!campaign) return;
    const url = `${window.location.origin}/pay/${campaign.slug}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-9 h-9 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <div className="text-center">
          <div className="w-14 h-14 bg-[#1a1d27] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500">Campaign not found</p>
        </div>
      </div>
    );
  }

  const progress = Math.min(
    (campaign.collectedAmount / campaign.targetAmount) * 100,
    100
  );
  const remaining = campaign.targetAmount - campaign.collectedAmount;
  const successContribs = contributions.filter((c) => c.status === "SUCCESS");
  const payLink = `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${campaign.slug}`;

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header className="border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">B</span>
            </div>
            <span className="font-bold text-white hidden sm:inline">BulkPay</span>
          </Link>
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm text-gray-500 truncate max-w-[200px]">{campaign.title}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Campaign info card */}
        <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] overflow-hidden mb-6">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {campaign.title}
                </h1>
                {campaign.description && (
                  <p className="text-gray-400 mt-1 leading-relaxed">{campaign.description}</p>
                )}
              </div>
              <button
                onClick={toggleActive}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-200 ${
                  campaign.isActive
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                }`}
              >
                {campaign.isActive ? "Close Campaign" : "Reopen Campaign"}
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-emerald-500/10 rounded-xl p-3.5">
                <p className="text-[11px] font-medium text-emerald-400 mb-0.5">Collected</p>
                <p className="text-base sm:text-lg font-bold text-emerald-400">
                  {formatNaira(campaign.collectedAmount)}
                </p>
              </div>
              <div className="bg-[#232734] rounded-xl p-3.5">
                <p className="text-[11px] font-medium text-gray-400 mb-0.5">Target</p>
                <p className="text-base sm:text-lg font-bold text-gray-400">
                  {formatNaira(campaign.targetAmount)}
                </p>
              </div>
              <div className="bg-teal-500/10 rounded-xl p-3.5">
                <p className="text-[11px] font-medium text-teal-400 mb-0.5">Remaining</p>
                <p className="text-base sm:text-lg font-bold text-teal-400">
                  {formatNaira(Math.max(remaining, 0))}
                </p>
              </div>
            </div>

            <div className="relative w-full bg-[#232734] rounded-full h-3 overflow-hidden mb-5">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="progress-shimmer absolute inset-0 rounded-full" />
              </div>
            </div>

            {/* Share link */}
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={payLink}
                className="flex-1 min-w-0 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm bg-[#232734] text-gray-300 focus:outline-none"
              />
              <button
                onClick={copyLink}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0 ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-emerald-500 text-white hover:bg-emerald-400"
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Contributors table */}
        <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              All Contributions
            </h2>
            <span className="text-xs font-medium text-gray-400 bg-[#232734] px-2.5 py-1 rounded-full">
              {contributions.length}
            </span>
          </div>

          {contributions.length === 0 ? (
            <div className="px-6 sm:px-8 pb-8">
              <div className="bg-[#232734] rounded-xl p-8 text-center">
                <p className="text-gray-500 text-sm">
                  No contributions yet. Share your campaign link to get started!
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto px-6 sm:px-8 pb-6 sm:pb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-right py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-center py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((c) => (
                    <tr key={c.id} className="border-b border-white/[0.06] last:border-0">
                      <td className="py-3.5 text-white font-medium">
                        {c.contributorName}
                      </td>
                      <td className="py-3.5 text-gray-400">
                        {c.contributorEmail}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-gray-300">
                        {formatNaira(c.amount)}
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                            c.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : c.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-gray-400">
                        {new Date(
                          c.paidAt || c.createdAt
                        ).toLocaleDateString("en-NG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-white/[0.06]">
                    <td colSpan={2} className="py-3.5 font-bold text-white">
                      Total Successful
                    </td>
                    <td className="py-3.5 text-right font-bold text-emerald-400">
                      {formatNaira(
                        successContribs.reduce((sum, c) => sum + c.amount, 0)
                      )}
                    </td>
                    <td className="py-3.5 text-center text-xs text-gray-400 font-medium">
                      {successContribs.length} paid
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
