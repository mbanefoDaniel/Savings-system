import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatNaira } from "@/lib/utils";
import ContributionForm from "./ContributionForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CampaignPayPage({ params }: Props) {
  const { slug } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      contributions: {
        where: { status: "SUCCESS" },
        select: {
          id: true,
          contributorName: true,
          amount: true,
          paidAt: true,
        },
        orderBy: { paidAt: "desc" },
      },
    },
  });

  if (!campaign) notFound();

  const isExpired = campaign.deadline && new Date(campaign.deadline) < new Date();
  const remaining = campaign.targetAmount - campaign.collectedAmount;
  const progress = Math.min(
    (campaign.collectedAmount / campaign.targetAmount) * 100,
    100
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Minimal header */}
      <header className="bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">B</span>
          </div>
          <span className="text-sm font-semibold text-gray-400">BulkPay</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Campaign Header Card */}
        <div className="bg-[#1a1d27] rounded-2xl shadow-sm border border-white/[0.06] overflow-hidden mb-6">
          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className="text-gray-400 mb-6 leading-relaxed">{campaign.description}</p>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-emerald-500/10 rounded-xl p-3 text-center">
                <p className="text-[11px] font-medium text-emerald-400 mb-0.5">Collected</p>
                <p className="text-base sm:text-lg font-bold text-emerald-300">
                  {formatNaira(campaign.collectedAmount)}
                </p>
              </div>
              <div className="bg-[#232734] rounded-xl p-3 text-center">
                <p className="text-[11px] font-medium text-gray-500 mb-0.5">Target</p>
                <p className="text-base sm:text-lg font-bold text-white">
                  {formatNaira(campaign.targetAmount)}
                </p>
              </div>
              <div className="bg-teal-500/10 rounded-xl p-3 text-center">
                <p className="text-[11px] font-medium text-teal-400 mb-0.5">Remaining</p>
                <p className="text-base sm:text-lg font-bold text-teal-300">
                  {formatNaira(Math.max(remaining, 0))}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative w-full bg-[#232734] rounded-full h-3 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="progress-shimmer absolute inset-0 rounded-full" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center font-medium">
              {progress.toFixed(1)}% raised
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap gap-3 mt-4">
              {campaign.deadline && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#232734] px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(campaign.deadline).toLocaleDateString("en-NG", { dateStyle: "long" })}
                  {isExpired && <span className="text-red-400 font-semibold">(Expired)</span>}
                </div>
              )}
              {campaign.fixedAmount && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full font-medium">
                  Fixed: {formatNaira(campaign.fixedAmount)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {campaign.isActive && !isExpired ? (
          <ContributionForm
            campaignSlug={campaign.slug}
            fixedAmount={campaign.fixedAmount}
          />
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-6 text-center">
            <svg className="w-8 h-8 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="font-medium">
              {isExpired
                ? "This campaign has passed its deadline."
                : "This campaign is no longer accepting contributions."}
            </p>
          </div>
        )}

        {/* Contributors */}
        {campaign.showContributors && campaign.contributions.length > 0 && (
          <div className="bg-[#1a1d27] rounded-2xl shadow-sm border border-white/[0.06] p-6 sm:p-8 mt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">
                Recent Contributors
              </h2>
              <span className="text-xs font-medium text-gray-500 bg-[#232734] px-2.5 py-1 rounded-full">
                {campaign.contributions.length}
              </span>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {campaign.contributions.map((c) => (
                <li key={c.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">
                      {c.contributorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {c.contributorName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {c.paidAt &&
                          new Date(c.paidAt).toLocaleDateString("en-NG", {
                            dateStyle: "medium",
                          })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    {formatNaira(c.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
