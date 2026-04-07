"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Campaign {
  id: string;
  slug: string;
  title: string;
  targetAmount: number;
  collectedAmount: number;
  isActive: boolean;
  deadline: string | null;
  createdAt: string;
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ajoGroups, setAjoGroups] = useState<AjoGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizerName, setOrganizerName] = useState("");

  const fetchCampaigns = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const organizer = JSON.parse(localStorage.getItem("organizer") || "{}");
      setOrganizerName(organizer.name || "");

      const [campaignRes, ajoRes] = await Promise.all([
        fetch("/api/campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/ajo", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (campaignRes.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("organizer");
        router.push("/login");
        return;
      }

      const campaignData = await campaignRes.json();
      setCampaigns(campaignData.campaigns || []);

      if (ajoRes.ok) {
        const ajoData = await ajoRes.json();
        const allGroups = [...(ajoData.created || []), ...(ajoData.joined || [])];
        setAjoGroups(allGroups);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("organizer");
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalCollected = campaigns.reduce((s, c) => s + c.collectedAmount, 0);
  const totalTarget = campaigns.reduce((s, c) => s + c.targetAmount, 0);
  const totalContributors = campaigns.reduce((s, c) => s + c._count.contributions, 0);
  const activeCampaigns = campaigns.filter((c) => c.isActive).length;

  const activeAjoGroups = ajoGroups.filter((g) => g.status === "ACTIVE").length;
  const totalAjoMembers = ajoGroups.reduce((s, g) => s + g._count.members, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/20">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-bold text-white hidden sm:inline">BulkPay</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
                {getInitials(organizerName || "U")}
              </div>
              <span className="text-sm text-gray-400 font-medium hidden sm:inline">{organizerName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm text-gray-500 hover:text-red-400 transition px-2 py-1 rounded-lg hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Welcome + Stats */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
            Welcome back, <span className="text-emerald-400">{organizerName.split(" ")[0] || "there"}</span>
          </h1>
          <p className="text-sm text-gray-500">Here&apos;s an overview of your activity</p>
        </div>

        {/* Stat Cards – Campaigns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-4 sm:p-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
              <svg className="w-4.5 h-4.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Campaigns</p>
            <p className="text-lg sm:text-2xl font-bold text-white mt-0.5">{campaigns.length}</p>
          </div>
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-4 sm:p-5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center mb-3">
              <svg className="w-4.5 h-4.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Collected</p>
            <p className="text-base sm:text-2xl font-bold text-white mt-0.5 truncate">{formatNaira(totalCollected)}</p>
          </div>
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-4 sm:p-5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
              <svg className="w-4.5 h-4.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Contributors</p>
            <p className="text-lg sm:text-2xl font-bold text-white mt-0.5">{totalContributors}</p>
          </div>
          <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-4 sm:p-5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
              <svg className="w-4.5 h-4.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Target</p>
            <p className="text-base sm:text-2xl font-bold text-white mt-0.5 truncate">{formatNaira(totalTarget)}</p>
          </div>
        </div>

        {/* Stat Cards – Ajo */}
        {ajoGroups.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-[#1a1d27] rounded-2xl border border-violet-500/10 p-4 sm:p-5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                <svg className="w-4.5 h-4.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Ajo Groups</p>
              <p className="text-lg sm:text-2xl font-bold text-white mt-0.5">{ajoGroups.length}</p>
            </div>
            <div className="bg-[#1a1d27] rounded-2xl border border-violet-500/10 p-4 sm:p-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <svg className="w-4.5 h-4.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Active Ajo</p>
              <p className="text-lg sm:text-2xl font-bold text-white mt-0.5">{activeAjoGroups}</p>
            </div>
            <div className="bg-[#1a1d27] rounded-2xl border border-violet-500/10 p-4 sm:p-5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center mb-3">
                <svg className="w-4.5 h-4.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Ajo Members</p>
              <p className="text-lg sm:text-2xl font-bold text-white mt-0.5">{totalAjoMembers}</p>
            </div>
          </div>
        )}

        {/* Quick Actions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/ajo"
            className="group relative bg-gradient-to-br from-violet-600 to-violet-500 rounded-2xl p-5 sm:p-6 text-white overflow-hidden hover:shadow-xl hover:shadow-violet-600/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="font-bold text-base sm:text-lg mb-0.5">Ajo / Esusu Savings</h2>
              <p className="text-violet-200 text-xs sm:text-sm">Rotational savings groups</p>
            </div>
            <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white/80 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/dashboard/campaigns/new"
            className="group relative bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl p-5 sm:p-6 text-white overflow-hidden hover:shadow-xl hover:shadow-emerald-600/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="font-bold text-base sm:text-lg mb-0.5">New Campaign</h2>
              <p className="text-emerald-100 text-xs sm:text-sm">Collect group payments</p>
            </div>
            <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white/80 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Campaigns Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">My Campaigns</h2>
              {activeCampaigns > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400">
                  {activeCampaigns} active
                </span>
              )}
            </div>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-10 sm:p-14 text-center">
              <div className="w-16 h-16 bg-[#232734] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-300 mb-1">No campaigns yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Create your first campaign and start collecting.
              </p>
              <Link
                href="/dashboard/campaigns/new"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition"
              >
                Get started
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
              {campaigns.map((campaign) => {
                const progress = Math.min(
                  (campaign.collectedAmount / campaign.targetAmount) * 100,
                  100
                );
                return (
                  <Link
                    key={campaign.id}
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="group relative bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-5 sm:p-6 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 transition-all duration-300 block overflow-hidden"
                  >
                    {/* Top accent */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${campaign.isActive ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gray-700"}`} />

                    <div className="flex items-start justify-between mb-3 pt-1">
                      <div className="min-w-0 flex-1 pr-3">
                        <h3 className="font-bold text-white group-hover:text-emerald-400 transition truncate text-sm sm:text-base">
                          {campaign.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {campaign._count.contributions}
                          </span>
                          <span>·</span>
                          <span>{new Date(campaign.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </p>
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                          campaign.isActive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-gray-800 text-gray-500"
                        }`}
                      >
                        {campaign.isActive ? "Active" : "Closed"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="font-bold text-white text-sm sm:text-base">{formatNaira(campaign.collectedAmount)}</span>
                        <span className="text-gray-500 text-xs">of {formatNaira(campaign.targetAmount)}</span>
                      </div>
                      <div className="w-full bg-[#232734] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-right text-[11px] font-medium text-gray-500">{Math.round(progress)}%</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Ajo Groups Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">My Ajo Groups</h2>
              {activeAjoGroups > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-violet-500/10 text-violet-400">
                  {activeAjoGroups} active
                </span>
              )}
            </div>
          </div>

          {ajoGroups.length === 0 ? (
            <div className="bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-10 sm:p-14 text-center">
              <div className="w-16 h-16 bg-[#232734] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-300 mb-1">No Ajo groups yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Create or join a rotational savings group.
              </p>
              <Link
                href="/ajo"
                className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm font-semibold transition"
              >
                Get started
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
              {ajoGroups.map((group) => {
                const statusColors: Record<string, string> = {
                  PENDING: "bg-amber-500/10 text-amber-400",
                  ACTIVE: "bg-emerald-500/10 text-emerald-400",
                  COMPLETED: "bg-teal-500/10 text-teal-400",
                  CANCELLED: "bg-gray-800 text-gray-500",
                };
                return (
                  <Link
                    key={group.id}
                    href={`/ajo/${group.id}`}
                    className="group relative bg-[#1a1d27] rounded-2xl border border-white/[0.06] p-5 sm:p-6 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5 transition-all duration-300 block overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 ${group.status === "ACTIVE" ? "bg-gradient-to-r from-violet-500 to-purple-400" : group.status === "PENDING" ? "bg-gradient-to-r from-amber-500 to-yellow-400" : "bg-gray-700"}`} />

                    <div className="flex items-start justify-between mb-3 pt-1">
                      <div className="min-w-0 flex-1 pr-3">
                        <h3 className="font-bold text-white group-hover:text-violet-400 transition truncate text-sm sm:text-base">
                          {group.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {group._count.members} / {group.maxMembers}
                          </span>
                          <span>·</span>
                          <span>{group.frequency}</span>
                          <span>·</span>
                          <span>Cycle {group.currentCycleNum}</span>
                        </p>
                      </div>
                      <span className={`text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${statusColors[group.status] || "bg-gray-800 text-gray-500"}`}>
                        {group.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 text-xs">Contribution</span>
                      <span className="font-bold text-white text-sm sm:text-base">{formatNaira(group.contributionAmount)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
