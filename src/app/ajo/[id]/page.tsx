"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Member {
  id: string;
  position: number;
  status: string;
  user: User;
}

interface AjoContrib {
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
  contributions: AjoContrib[];
  payout: {
    id: string;
    amount: number;
    status: string;
    member: { user: { name: string } };
  } | null;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  member: { user: { name: string } };
  cycle: { cycleNumber: number; dueDate: string; status: string };
}

interface Group {
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
  creatorId: string;
  creator: { name: string };
  members: Member[];
  cycles: Cycle[];
  payoutSchedule: Payout[];
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(kobo / 100);
}

export default function AjoGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [group, setGroup] = useState<Group | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchGroup = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/ajo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        setGroup(null);
        return;
      }
      const data = await res.json();
      setGroup(data.group);
      setIsCreator(data.isCreator);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  async function doAction(action: string) {
    setActionLoading(action);
    setActionError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/ajo/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await fetchGroup();
      } else {
        const err = await res.json();
        setActionError(err.error || "Action failed");
      }
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setActionLoading("");
    }
  }

  async function contribute() {
    setActionLoading("contribute");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/ajo/${id}/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to contribute");
        return;
      }
      window.location.href = data.authorization_url;
    } catch {
      alert("Network error");
    } finally {
      setActionLoading("");
    }
  }

  function copyInviteLink() {
    if (!group) return;
    const url = `${window.location.origin}/ajo/join?code=${group.slug}`;
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

  if (!group) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <p className="text-gray-400">Group not found or access denied.</p>
      </div>
    );
  }

  const currentCycle = group.cycles.find((c) => c.status === "OPEN");
  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400",
    ACTIVE: "bg-emerald-500/10 text-emerald-400",
    COMPLETED: "bg-teal-500/10 text-teal-400",
    CANCELLED: "bg-gray-800 text-gray-500",
  };

  // Determine the current user's member record
  const organizer = JSON.parse(localStorage.getItem("organizer") || "{}");
  const myMember = group.members.find((m) => m.user.id === organizer.id);
  const myContribThisCycle = currentCycle?.contributions.find(
    (c) => c.member.user.name === myMember?.user.name && c.status === "SUCCESS"
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header className="border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-2 sm:gap-3">
          <Link href="/ajo" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">B</span>
            </div>
            <span className="font-bold text-white hidden sm:inline">BulkPay</span>
          </Link>
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm text-gray-500 truncate max-w-[200px]">{group.name}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Group header card */}
        <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-white">{group.name}</h1>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${statusColors[group.status] || "bg-gray-800 text-gray-500"}`}>
                    {group.status}
                  </span>
                </div>
                {group.description && (
                  <p className="text-gray-400 text-sm">{group.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Created by {group.creator.name}</p>
              </div>

              {isCreator && group.status === "PENDING" && (
                <div className="text-right">
                  <button
                    onClick={() => doAction("start")}
                    disabled={actionLoading === "start" || group.members.length < 2}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={group.members.length < 2 ? "Need at least 2 members to start" : ""}
                  >
                    {actionLoading === "start" ? "Starting…" : "Start Group"}
                  </button>
                  {group.members.length < 2 && (
                    <p className="text-[11px] text-amber-400 mt-1">Need 2+ members to start</p>
                  )}
                </div>
              )}
              {isCreator && group.status === "ACTIVE" && (
                <button
                  onClick={() => doAction("next_cycle")}
                  disabled={!!actionLoading}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition disabled:opacity-50"
                >
                  {actionLoading === "next_cycle" ? "Opening…" : "Open Next Cycle"}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="bg-violet-500/10 rounded-xl p-3 text-center">
                <p className="text-[11px] font-medium text-violet-400 mb-0.5">Per Cycle</p>
                <p className="text-sm font-bold text-violet-300">{formatNaira(group.contributionAmount)}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 text-center">
                <p className="text-[11px] font-medium text-emerald-400 mb-0.5">Payout</p>
                <p className="text-sm font-bold text-emerald-300">{formatNaira(group.contributionAmount * group.members.length)}</p>
              </div>
              <div className="bg-teal-500/10 rounded-xl p-3 text-center">
                <p className="text-[11px] font-medium text-teal-400 mb-0.5">Frequency</p>
                <p className="text-sm font-bold text-teal-300">{group.frequency}</p>
              </div>
              <div className="bg-[#232734] rounded-xl p-3 text-center">
                <p className="text-[11px] font-medium text-gray-500 mb-0.5">Cycle</p>
                <p className="text-sm font-bold text-gray-300">{group.currentCycleNum} / {group.maxMembers}</p>
              </div>
            </div>

            {/* Action error banner */}
            {actionError && (
              <div className="flex items-center gap-2 bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20 mb-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {actionError}
                <button onClick={() => setActionError("")} className="ml-auto text-red-400 hover:text-red-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Invite link */}
            {group.status === "PENDING" && (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/ajo/join?code=${group.slug}`}
                  className="flex-1 border border-white/10 rounded-xl px-4 py-2.5 text-sm bg-[#232734] text-gray-400 focus:outline-none"
                />
                <button
                  onClick={copyInviteLink}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                    copied
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-emerald-500 text-white hover:bg-emerald-400"
                  }`}
                >
                  {copied ? "Copied!" : "Copy Invite"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Waiting message for non-creator members in PENDING group */}
        {group.status === "PENDING" && !isCreator && myMember && (
          <div className="bg-[#1a1d27] rounded-2xl border border-amber-500/20 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-400 mb-1">Waiting for group to start</h3>
                <p className="text-sm text-gray-400">
                  You&apos;ve joined successfully! The group creator will start the Ajo once enough members have joined
                  ({group.members.length} / {group.maxMembers} so far). You&apos;ll be able to contribute once the first cycle opens.
                </p>
                <p className="text-xs text-gray-500 mt-2">Your payout position: <span className="text-violet-400 font-semibold">#{myMember.position}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Info for ACTIVE group with no open cycle */}
        {group.status === "ACTIVE" && !currentCycle && myMember && (
          <div className="bg-[#1a1d27] rounded-2xl border border-teal-500/20 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-teal-400 mb-1">No open cycle right now</h3>
                <p className="text-sm text-gray-400">
                  The current cycle has been completed. The group creator will open the next cycle soon — check back shortly!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Cycle + Contribute */}
        {currentCycle && (
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Cycle #{currentCycle.cycleNumber}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Due: {new Date(currentCycle.dueDate).toLocaleDateString("en-NG", { dateStyle: "long" })}
                </p>
              </div>
              {currentCycle.payout && (
                <div className="text-right">
                  <p className="text-[11px] text-gray-500">Payout to</p>
                  <p className="text-sm font-bold text-emerald-400">{currentCycle.payout.member.user.name}</p>
                </div>
              )}
            </div>

            {/* Contribution status grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
              {group.members.map((member) => {
                const contrib = currentCycle.contributions.find(
                  (c) => c.member.user.name === member.user.name
                );
                const paid = contrib?.status === "SUCCESS";
                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${
                      paid ? "bg-emerald-500/10" : "bg-[#232734]"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        paid
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-gray-700 text-gray-500"
                      }`}
                    >
                      {paid ? "✓" : member.position}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-300 font-medium truncate text-xs">{member.user.name}</p>
                      <p className={`text-[10px] ${paid ? "text-emerald-400" : "text-gray-500"}`}>
                        {paid ? "Paid" : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contribute button */}
            {myMember && !myContribThisCycle && (
              <button
                onClick={contribute}
                disabled={!!actionLoading}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === "contribute" ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Redirecting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Contribute {formatNaira(group.contributionAmount)}
                  </>
                )}
              </button>
            )}
            {myContribThisCycle && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-center text-sm font-medium">
                ✓ You&apos;ve contributed this cycle
              </div>
            )}
          </div>
        )}

        {/* Members list */}
        <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Members</h2>
            <span className="text-xs font-medium text-gray-500 bg-[#232734] px-2.5 py-1 rounded-full">
              {group.members.length} / {group.maxMembers}
            </span>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {group.members.map((m) => (
              <li key={m.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-xs font-bold text-violet-400">
                    {m.position}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{m.user.name}</p>
                    <p className="text-[11px] text-gray-500">{m.user.email}</p>
                  </div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  m.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : m.status === "DEFAULTED"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-gray-800 text-gray-500"
                }`}>
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payout Schedule */}
        {group.payoutSchedule.length > 0 && (
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-6 sm:p-8">
            <h2 className="text-base font-bold text-white mb-4">Payout Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Cycle</th>
                    <th className="text-left py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Recipient</th>
                    <th className="text-right py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-center py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {group.payoutSchedule.map((p) => (
                    <tr key={p.id} className="border-b border-white/[0.06] last:border-0">
                      <td className="py-3 text-gray-300 font-medium">#{p.cycle.cycleNumber}</td>
                      <td className="py-3 text-gray-300">{p.member.user.name}</td>
                      <td className="py-3 text-right font-semibold text-white">{formatNaira(p.amount)}</td>
                      <td className="py-3 text-center">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                          p.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : p.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400"
                            : p.status === "PROCESSING"
                            ? "bg-teal-500/10 text-teal-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-500">
                        {new Date(p.cycle.dueDate).toLocaleDateString("en-NG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
