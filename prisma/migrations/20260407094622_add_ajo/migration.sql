-- CreateEnum
CREATE TYPE "AjoFrequency" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "AjoGroupStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'DEFAULTED', 'REMOVED');

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('OPEN', 'CLOSED', 'PAID_OUT');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "AjoGroup" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contributionAmount" INTEGER NOT NULL,
    "frequency" "AjoFrequency" NOT NULL,
    "maxMembers" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" "AjoGroupStatus" NOT NULL DEFAULT 'PENDING',
    "currentCycleNum" INTEGER NOT NULL DEFAULT 0,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AjoGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContributionCycle" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AjoContribution" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paystackRef" TEXT NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AjoContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutSchedule" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AjoGroup_slug_key" ON "AjoGroup"("slug");

-- CreateIndex
CREATE INDEX "AjoGroup_creatorId_idx" ON "AjoGroup"("creatorId");

-- CreateIndex
CREATE INDEX "AjoGroup_slug_idx" ON "AjoGroup"("slug");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");

-- CreateIndex
CREATE INDEX "GroupMember_userId_idx" ON "GroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_position_key" ON "GroupMember"("groupId", "position");

-- CreateIndex
CREATE INDEX "ContributionCycle_groupId_idx" ON "ContributionCycle"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "ContributionCycle_groupId_cycleNumber_key" ON "ContributionCycle"("groupId", "cycleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AjoContribution_paystackRef_key" ON "AjoContribution"("paystackRef");

-- CreateIndex
CREATE INDEX "AjoContribution_cycleId_idx" ON "AjoContribution"("cycleId");

-- CreateIndex
CREATE INDEX "AjoContribution_memberId_idx" ON "AjoContribution"("memberId");

-- CreateIndex
CREATE INDEX "AjoContribution_paystackRef_idx" ON "AjoContribution"("paystackRef");

-- CreateIndex
CREATE UNIQUE INDEX "AjoContribution_cycleId_memberId_key" ON "AjoContribution"("cycleId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutSchedule_cycleId_key" ON "PayoutSchedule"("cycleId");

-- CreateIndex
CREATE INDEX "PayoutSchedule_groupId_idx" ON "PayoutSchedule"("groupId");

-- CreateIndex
CREATE INDEX "PayoutSchedule_memberId_idx" ON "PayoutSchedule"("memberId");

-- AddForeignKey
ALTER TABLE "AjoGroup" ADD CONSTRAINT "AjoGroup_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AjoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionCycle" ADD CONSTRAINT "ContributionCycle_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AjoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjoContribution" ADD CONSTRAINT "AjoContribution_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ContributionCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjoContribution" ADD CONSTRAINT "AjoContribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "GroupMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutSchedule" ADD CONSTRAINT "PayoutSchedule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AjoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutSchedule" ADD CONSTRAINT "PayoutSchedule_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ContributionCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutSchedule" ADD CONSTRAINT "PayoutSchedule_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "GroupMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
