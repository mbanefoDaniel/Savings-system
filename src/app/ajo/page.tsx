"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AjoGroup {
  id: string;
  slug: string;
  name: string;
  contributionAmount: number;
  frequency: string;
  maxMembers: number;
  status: string;
  currentCycleNum: number;
  startDate: string;
  createdAt: string;
  _count: { members: number };
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(kobo / 100);
}

export default function AjoDashboardPage() {
  const router = useRouter();
  const [created, setCreated] = useState<AjoGroup[]>([]);
  const [joined, setJoined] = useState<AjoGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/ajo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      const data = await res.json();
      setCreated(data.created || []);
      setJoined(data.joined || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-9 h-9 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allGroups = [...created, ...joined];
  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400",
    ACTIVE: "bg-emerald-500/10 text-emerald-400",
    COMPLETED: "bg-teal-500/10 text-teal-400",
    CANCELLED: "bg-gray-800 text-gray-500",
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header className="border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">B</span>
              </div>
              <span className="font-bold text-white hidden sm:inline">BulkPay</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1 text-sm">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 transition">
                Dashboard
              </Link>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-300 font-medium">Ajo Groups</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Ajo / Esusu Groups</h1>
            <p className="text-sm text-gray-500 mt-1">Rotational savings — contribute together, receive in turns</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/ajo/join"
              className="border border-white/10 text-gray-300 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition"
            >
              Join Group
            </Link>
            <Link
              href="/ajo/new"
              className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Group
            </Link>
          </div>
        </div>

        {allGroups.length === 0 ? (
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-14 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-3">No Ajo groups yet.</p>
            <Link href="/ajo/new" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition">
              Create your first group →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allGroups.map((group) => (
              <Link
                key={group.id}
                href={`/ajo/${group.id}`}
                className="group bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-5 hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-bold text-white group-hover:text-emerald-400 transition truncate pr-2">
                    {group.name}
                  </h2>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${statusColors[group.status] || "bg-gray-800 text-gray-500"}`}>
                    {group.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contribution</span>
                    <span className="font-semibold text-gray-300">{formatNaira(group.contributionAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Frequency</span>
                    <span className="font-semibold text-gray-300">{group.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Members</span>
                    <span className="font-semibold text-gray-300">{group._count.members} / {group.maxMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cycle</span>
                    <span className="font-semibold text-gray-300">{group.currentCycleNum} / {group.maxMembers}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
