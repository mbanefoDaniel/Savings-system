-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "recipientCode" TEXT;

-- AlterTable
ALTER TABLE "PayoutSchedule" ADD COLUMN     "transferCode" TEXT,
ADD COLUMN     "transferRef" TEXT;
