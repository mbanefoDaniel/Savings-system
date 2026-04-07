"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Member {
  id: string;
  position: number;
  status: string;
  user: { id: string; name: string; email: string; phone: string | null };
}

interface CycleContribution {
  id: string;
  amount: number;
  status: string;
  paystackRef: string;
  paidAt: string | null;
  member: { user: { name: string } };
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  member: { user: { name: string } };
}

interface Cycle {
  id: string;
  cycleNumber: number;
  dueDate: string;
  status: string;
  contributions: CycleContribution[];
  payout: Payout | null;
}

interface PayoutScheduleItem {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  member: { user: { name: string } };
  cycle: { cycleNumber: number; dueDate: string };
}

interface GroupDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  contributionAmount: number;
  frequency: string;
  maxMembers: number;
  status: string;
  currentCycleNum: number;
  startDate: string;
  createdAt: string;
  creator: { name: string; email: string };
  members: Member[];
  cycles: Cycle[];
  payoutSchedule: PayoutScheduleItem[];
}

function fmt(kobo: number) {
  return `₦${(kobo / 100).toLocaleString()}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    CANCELLED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    OPEN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CLOSED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PAID_OUT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    DEFAULTED: "bg-red-500/10 text-red-400 border-red-500/20",
    REMOVED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    PROCESSING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  const c = colors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  return (
    <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${c}`}>
      {status}
    </span>
  );
}

export default function AdminAjoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getToken = useCallback(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) { router.push("/admin/login"); return null; }
    return t;
  }, [router]);

  const loadGroup = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`/api/admin/ajo/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 403) { router.push("/admin/login"); return; }
    const data = await res.json();
    if (data.group) setGroup(data.group);
    setLoading(false);
  }, [id, getToken, router]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  async function triggerPayout(force: boolean) {
    const token = getToken();
    if (!token || !group) return;
    setPayoutLoading(true);
    setPayoutMsg(null);

    try {
      const res = await fetch(`/api/admin/ajo/${group.id}/payout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();

      if (res.ok) {
        setPayoutMsg({ type: "success", text: data.message + (data.warning ? ` (${data.warning})` : "") });
        loadGroup();
      } else {
        setPayoutMsg({ type: "error", text: data.message || data.error || "Failed" });
      }
    } catch {
      setPayoutMsg({ type: "error", text: "Network error" });
    } finally {
      setPayoutLoading(false);
    }
  }

  if (loading || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <div className="w-10 h-10 border-[3px] border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const openCycle = group.cycles.find((c) => c.status === "OPEN");

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-300">
      <header className="border-b border-white/[0.06] sticky top-0 z-10 bg-[#0f1117]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </Link>
          <span className="text-lg font-bold text-white">Ajo Group Detail</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">{group.name}</h1>
              {group.description && <p className="text-gray-400 text-sm mt-1">{group.description}</p>}
              <p className="text-gray-500 text-[12px] mt-2">Creator: {group.creator.name} ({group.creator.email})</p>
            </div>
            <StatusBadge status={group.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-[12px]">Contribution</p>
              <p className="text-white font-semibold">{fmt(group.contributionAmount)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Frequency</p>
              <p className="text-white font-semibold">{group.frequency}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Members</p>
              <p className="text-white font-semibold">{group.members.length}/{group.maxMembers}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Current Cycle</p>
              <p className="text-white font-semibold">{group.currentCycleNum}/{group.maxMembers}</p>
            </div>
          </div>
        </div>

        {/* Trigger Payout */}
        {group.status === "ACTIVE" && openCycle && (
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-6">
            <h2 className="text-base font-semibold text-white mb-3">Trigger Payout — Cycle {openCycle.cycleNumber}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
              <span>{openCycle.contributions.filter(c => c.status === "SUCCESS").length} / {group.members.filter(m => m.status === "ACTIVE").length} members paid</span>
              <span className="text-gray-600">·</span>
              <span>Due {fmtDate(openCycle.dueDate)}</span>
              {openCycle.payout && (
                <>
                  <span className="text-gray-600">·</span>
                  <span>Payout to: <span className="text-white">{openCycle.payout.member.user.name}</span></span>
                </>
              )}
            </div>

            {payoutMsg && (
              <div className={`mb-4 text-[13px] p-3 rounded-xl border ${
                payoutMsg.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                {payoutMsg.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => triggerPayout(false)}
                disabled={payoutLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50 transition-all"
              >
                {payoutLoading ? "Processing…" : "Auto Payout"}
              </button>
              <button
                onClick={() => triggerPayout(true)}
                disabled={payoutLoading}
                className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 transition-all"
              >
                Force Payout
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">Auto requires all contributions. Force overrides and completes immediately.</p>
          </div>
        )}

        {/* Members */}
        <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] overflow-hidden">
          <h2 className="text-base font-semibold text-white px-5 py-4 border-b border-white/[0.06]">
            Members ({group.members.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Pos</th>
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Phone</th>
                  <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {group.members.map((m) => (
                  <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-white font-semibold">{m.position}</td>
                    <td className="px-5 py-3 text-white text-[13px]">{m.user.name}</td>
                    <td className="px-5 py-3 text-gray-400 text-[13px]">{m.user.email}</td>
                    <td className="px-5 py-3 text-gray-400 text-[13px]">{m.user.phone || "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout Schedule */}
        {group.payoutSchedule.length > 0 && (
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] overflow-hidden">
            <h2 className="text-base font-semibold text-white px-5 py-4 border-b border-white/[0.06]">
              Payout Schedule
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Cycle</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Recipient</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Amount</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {group.payoutSchedule.map((p) => (
                    <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-white font-semibold">#{p.cycle.cycleNumber}</td>
                      <td className="px-5 py-3 text-white text-[13px]">{p.member.user.name}</td>
                      <td className="px-5 py-3 text-emerald-400 font-medium">{fmt(p.amount)}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3 text-gray-500 text-[13px]">{fmtDate(p.cycle.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cycles */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-white">Recent Cycles</h2>
          {group.cycles.length === 0 ? (
            <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-8 text-center text-gray-500">No cycles yet</div>
          ) : (
            group.cycles.map((cycle) => (
              <div key={cycle.id} className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">Cycle #{cycle.cycleNumber}</span>
                    <StatusBadge status={cycle.status} />
                  </div>
                  <span className="text-gray-500 text-[13px]">Due {fmtDate(cycle.dueDate)}</span>
                </div>

                {cycle.payout && (
                  <p className="text-sm text-gray-400 mb-2">
                    Payout: <span className="text-white">{fmt(cycle.payout.amount)}</span> → <span className="text-emerald-400">{cycle.payout.member.user.name}</span>
                    {" "}<StatusBadge status={cycle.payout.status} />
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {cycle.contributions.map((c) => (
                    <div
                      key={c.id}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg border ${
                        c.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : c.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {c.member.user.name} · {fmt(c.amount)}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
