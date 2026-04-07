"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tab = "overview" | "transactions" | "campaigns" | "ajo" | "users";

interface Stats {
  users: number;
  campaigns: number;
  ajoGroups: number;
  totalCampaignVolume: number;
  totalCampaignTx: number;
  totalAjoVolume: number;
  totalAjoTx: number;
}

interface Transaction {
  id: string;
  type: "campaign" | "ajo";
  user: string;
  email: string;
  amount: number;
  status: string;
  reference: string;
  label: string;
  date: string;
}

interface Campaign {
  id: string;
  slug: string;
  title: string;
  targetAmount: number;
  collectedAmount: number;
  isActive: boolean;
  createdAt: string;
  organizer: { name: string; email: string };
  _count: { contributions: number };
}

interface AjoGroup {
  id: string;
  slug: string;
  name: string;
  contributionAmount: number;
  frequency: string;
  maxMembers: number;
  status: string;
  currentCycleNum: number;
  createdAt: string;
  creator: { name: string; email: string };
  _count: { members: number; cycles: number };
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { campaigns: number; ajoGroups: number; memberships: number };
}

function fmt(kobo: number) {
  return `₦${(kobo / 100).toLocaleString()}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) + " · " + date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    CANCELLED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  const c = colors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  return (
    <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${c}`}>
      {status}
    </span>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ajoGroups, setAjoGroups] = useState<AjoGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
  }, [router]);

  const apiFetch = useCallback(async (url: string) => {
    if (!token) return null;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 403) {
      localStorage.removeItem("admin_token");
      router.push("/admin/login");
      return null;
    }
    return res.json();
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiFetch("/api/admin/stats").then((data) => {
      if (data) setStats(data);
      setLoading(false);
    });
  }, [token, apiFetch]);

  useEffect(() => {
    if (!token) return;
    if (tab === "transactions" && transactions.length === 0) {
      apiFetch("/api/admin/transactions").then((data) => {
        if (data) setTransactions(data.transactions);
      });
    }
    if (tab === "campaigns" && campaigns.length === 0) {
      apiFetch("/api/admin/campaigns").then((data) => {
        if (data) setCampaigns(data.campaigns);
      });
    }
    if (tab === "ajo" && ajoGroups.length === 0) {
      apiFetch("/api/admin/ajo").then((data) => {
        if (data) setAjoGroups(data.groups);
      });
    }
    if (tab === "users" && users.length === 0) {
      apiFetch("/api/admin/users").then((data) => {
        if (data) setUsers(data.users);
      });
    }
  }, [tab, token, apiFetch, transactions.length, campaigns.length, ajoGroups.length, users.length]);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  }

  if (!token || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <div className="w-10 h-10 border-[3px] border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "transactions", label: "Transactions" },
    { id: "campaigns", label: "Campaigns" },
    { id: "ajo", label: "Ajo Groups" },
    { id: "users", label: "Users" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-300">
      {/* Header */}
      <header className="border-b border-white/[0.06] sticky top-0 z-10 bg-[#0f1117]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1d27] rounded-2xl p-1 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-[#232734] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats.users, color: "text-emerald-400" },
                { label: "Campaigns", value: stats.campaigns, color: "text-violet-400" },
                { label: "Ajo Groups", value: stats.ajoGroups, color: "text-teal-400" },
                { label: "Total Transactions", value: stats.totalCampaignTx + stats.totalAjoTx, color: "text-amber-400" },
              ].map((s) => (
                <div key={s.label} className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-5">
                  <p className="text-[13px] text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-5">
                <p className="text-[13px] text-gray-500 mb-1">Campaign Volume</p>
                <p className="text-2xl font-bold text-white">{fmt(stats.totalCampaignVolume)}</p>
                <p className="text-[12px] text-gray-500 mt-1">{stats.totalCampaignTx} transactions</p>
              </div>
              <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-5">
                <p className="text-[13px] text-gray-500 mb-1">Ajo Volume</p>
                <p className="text-2xl font-bold text-white">{fmt(stats.totalAjoVolume)}</p>
                <p className="text-[12px] text-gray-500 mt-1">{stats.totalAjoTx} transactions</p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions */}
        {tab === "transactions" && (
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">User</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Amount</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Type</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Status</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Reference</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-gray-500 py-10">No transactions yet</td></tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-5 py-3.5">
                          <p className="text-white font-medium text-[13px]">{tx.user}</p>
                          <p className="text-gray-500 text-[11px]">{tx.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-white font-medium">{fmt(tx.amount)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                            tx.type === "campaign"
                              ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                              : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                          }`}>
                            {tx.type === "campaign" ? "Campaign" : "Ajo"}
                          </span>
                          <p className="text-gray-500 text-[11px] mt-0.5">{tx.label}</p>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={tx.status} /></td>
                        <td className="px-5 py-3.5 text-gray-500 text-[12px] font-mono">{tx.reference.slice(0, 16)}…</td>
                        <td className="px-5 py-3.5 text-gray-500 text-[13px]">{fmtDateTime(tx.date)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Campaigns */}
        {tab === "campaigns" && (
          <div className="space-y-3">
            {campaigns.length === 0 ? (
              <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-10 text-center text-gray-500">No campaigns yet</div>
            ) : (
              campaigns.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/campaigns/${c.id}`}
                  className="block bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-white font-semibold text-[15px]">{c.title}</h3>
                      <p className="text-gray-500 text-[12px] mt-0.5">by {c.organizer.name} · {c._count.contributions} contributions</p>
                    </div>
                    <StatusBadge status={c.isActive ? "ACTIVE" : "CANCELLED"} />
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Target: </span>
                      <span className="text-white font-medium">{fmt(c.targetAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Collected: </span>
                      <span className="text-emerald-400 font-medium">{fmt(c.collectedAmount)}</span>
                    </div>
                    <div className="text-gray-500 text-[12px]">{fmtDate(c.createdAt)}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Ajo Groups */}
        {tab === "ajo" && (
          <div className="space-y-3">
            {ajoGroups.length === 0 ? (
              <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-10 text-center text-gray-500">No Ajo groups yet</div>
            ) : (
              ajoGroups.map((g) => (
                <Link
                  key={g.id}
                  href={`/admin/ajo/${g.id}`}
                  className="block bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-white font-semibold text-[15px]">{g.name}</h3>
                      <p className="text-gray-500 text-[12px] mt-0.5">by {g.creator.name} · {g._count.members}/{g.maxMembers} members</p>
                    </div>
                    <StatusBadge status={g.status} />
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-sm flex-wrap">
                    <div>
                      <span className="text-gray-500">Amount: </span>
                      <span className="text-white font-medium">{fmt(g.contributionAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Frequency: </span>
                      <span className="text-white">{g.frequency}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cycle: </span>
                      <span className="text-white">{g.currentCycleNum}/{g.maxMembers}</span>
                    </div>
                    <div className="text-gray-500 text-[12px]">{fmtDate(g.createdAt)}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Name</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Email</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Phone</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Campaigns</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Ajo</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-gray-500 py-10">No users yet</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-5 py-3.5 text-white font-medium text-[13px]">{u.name}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-[13px]">{u.email}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-[13px]">{u.phone || "—"}</td>
                        <td className="px-5 py-3.5 text-gray-300">{u._count.campaigns}</td>
                        <td className="px-5 py-3.5 text-gray-300">{u._count.ajoGroups} created · {u._count.memberships} joined</td>
                        <td className="px-5 py-3.5 text-gray-500 text-[13px]">{fmtDate(u.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
