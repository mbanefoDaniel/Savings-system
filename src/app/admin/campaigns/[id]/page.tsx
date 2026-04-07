"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Contribution {
  id: string;
  contributorName: string;
  contributorEmail: string;
  amount: number;
  status: string;
  paystackRef: string;
  paidAt: string | null;
  createdAt: string;
}

interface CampaignDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  targetAmount: number;
  collectedAmount: number;
  fixedAmount: number | null;
  isActive: boolean;
  deadline: string | null;
  createdAt: string;
  organizer: { name: string; email: string };
  contributions: Contribution[];
}

function fmt(kobo: number) {
  return `₦${(kobo / 100).toLocaleString()}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    + " · " + date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const apiFetch = useCallback(async (url: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/admin/login"); return null; }
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 403) { router.push("/admin/login"); return null; }
    return res.json();
  }, [router]);

  useEffect(() => {
    apiFetch(`/api/admin/campaigns/${id}`).then((data) => {
      if (data) setCampaign(data.campaign);
      setLoading(false);
    });
  }, [id, apiFetch]);

  if (loading || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <div className="w-10 h-10 border-[3px] border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progress = campaign.targetAmount > 0 ? Math.min(100, (campaign.collectedAmount / campaign.targetAmount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-300">
      <header className="border-b border-white/[0.06] sticky top-0 z-10 bg-[#0f1117]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </Link>
          <span className="text-lg font-bold text-white">Campaign Detail</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">{campaign.title}</h1>
              {campaign.description && <p className="text-gray-400 text-sm mt-1">{campaign.description}</p>}
              <p className="text-gray-500 text-[12px] mt-2">Organizer: {campaign.organizer.name} ({campaign.organizer.email})</p>
            </div>
            <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
              campaign.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"
            }`}>
              {campaign.isActive ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-[12px]">Target</p>
              <p className="text-white font-semibold">{fmt(campaign.targetAmount)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Collected</p>
              <p className="text-emerald-400 font-semibold">{fmt(campaign.collectedAmount)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Contributors</p>
              <p className="text-white font-semibold">{campaign.contributions.filter(c => c.status === "SUCCESS").length}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Created</p>
              <p className="text-white font-semibold">{fmtDate(campaign.createdAt)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[12px] text-gray-500 mb-1">
              <span>{progress.toFixed(1)}%</span>
              {campaign.deadline && <span>Deadline: {fmtDate(campaign.deadline)}</span>}
            </div>
            <div className="h-2 bg-[#232734] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Contributions table */}
        <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] overflow-hidden">
          <h2 className="text-base font-semibold text-white px-5 py-4 border-b border-white/[0.06]">
            Contributions ({campaign.contributions.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Reference</th>
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {campaign.contributions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-gray-500 py-8">No contributions</td></tr>
                ) : (
                  campaign.contributions.map((c) => (
                    <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-white text-[13px]">{c.contributorName}</td>
                      <td className="px-5 py-3 text-gray-400 text-[13px]">{c.contributorEmail}</td>
                      <td className="px-5 py-3 text-white font-medium">{fmt(c.amount)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                          c.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          c.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-[12px] font-mono">{c.paystackRef.slice(0, 16)}…</td>
                      <td className="px-5 py-3 text-gray-500 text-[13px]">{fmtDateTime(c.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
