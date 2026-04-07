import { prisma } from "./prisma";
import { sendContributionReminder, sendPayoutNotification } from "./whatsapp";
import { initiateTransfer } from "./paystack";
import { generateReference } from "./utils";

/**
 * Compute the due date for a given cycle number based on the group's
 * start date and frequency.
 */
export function cycleDueDate(
  startDate: Date,
  frequency: "DAILY" | "WEEKLY",
  cycleNumber: number
): Date {
  const d = new Date(startDate);
  if (frequency === "DAILY") {
    d.setDate(d.getDate() + (cycleNumber - 1));
  } else {
    d.setDate(d.getDate() + (cycleNumber - 1) * 7);
  }
  return d;
}

/**
 * Create the next contribution cycle for a group.
 * Also creates the PayoutSchedule entry for the member whose turn it is.
 * Returns the newly created cycle.
 */
export async function openNextCycle(groupId: string) {
  const group = await prisma.ajoGroup.findUniqueOrThrow({
    where: { id: groupId },
    include: { members: { where: { status: "ACTIVE" }, orderBy: { position: "asc" } } },
  });

  if (group.status !== "ACTIVE") {
    throw new Error("Group is not active");
  }

  const nextNum = group.currentCycleNum + 1;
  if (nextNum > group.maxMembers) {
    // All cycles complete
    await prisma.ajoGroup.update({
      where: { id: groupId },
      data: { status: "COMPLETED" },
    });
    throw new Error("All cycles have been completed");
  }

  const dueDate = cycleDueDate(group.startDate, group.frequency, nextNum);

  // Find the member scheduled for payout this cycle
  const payoutMember = group.members.find((m) => m.position === nextNum);
  if (!payoutMember) {
    throw new Error(`No member assigned to position ${nextNum}`);
  }

  const totalPayout = group.contributionAmount * group.members.length;

  // Create cycle + payout schedule in one transaction
  const [cycle] = await prisma.$transaction([
    prisma.contributionCycle.create({
      data: {
        groupId,
        cycleNumber: nextNum,
        dueDate,
        status: "OPEN",
      },
    }),
    prisma.ajoGroup.update({
      where: { id: groupId },
      data: { currentCycleNum: nextNum },
    }),
  ]);

  // Create payout schedule entry linked to the cycle
  await prisma.payoutSchedule.create({
    data: {
      groupId,
      cycleId: cycle.id,
      memberId: payoutMember.id,
      amount: totalPayout,
      status: "PENDING",
    },
  });

  // Send WhatsApp contribution reminders to all members
  const membersWithPhone = await prisma.groupMember.findMany({
    where: { groupId, status: "ACTIVE" },
    include: { user: { select: { phone: true, name: true } } },
  });

  const formattedAmount = `₦${(group.contributionAmount / 100).toLocaleString()}`;
  const formattedDate = dueDate.toLocaleDateString("en-NG", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  for (const m of membersWithPhone) {
    if (m.user.phone) {
      sendContributionReminder({
        phone: m.user.phone,
        groupName: group.name,
        amount: formattedAmount,
        dueDate: formattedDate,
      }).catch((err) => console.error(`[WhatsApp] Reminder failed for ${m.user.name}:`, err));
    }
  }

  return cycle;
}

/**
 * Check if all active members have contributed for a cycle.
 * If yes, mark the cycle as CLOSED — payout still requires creator approval.
 */
export async function tryCompleteCycle(cycleId: string) {
  const cycle = await prisma.contributionCycle.findUniqueOrThrow({
    where: { id: cycleId },
    include: {
      group: {
        include: {
          members: { where: { status: "ACTIVE" } },
        },
      },
      contributions: { where: { status: "SUCCESS" } },
      payout: true,
    },
  });

  if (cycle.status !== "OPEN") return null;

  const activeCount = cycle.group.members.length;
  const paidCount = cycle.contributions.length;

  if (paidCount < activeCount) {
    return null;
  }

  // All contributions received — close cycle, keep payout PENDING for creator approval
  await prisma.contributionCycle.update({
    where: { id: cycleId },
    data: { status: "CLOSED" },
  });

  return { cycleId, status: "AWAITING_APPROVAL" };
}

/**
 * Approve and initiate the payout for a completed cycle.
 * Only the group creator should call this.
 */
export async function approvePayout(payoutId: string) {
  const payout = await prisma.payoutSchedule.findUniqueOrThrow({
    where: { id: payoutId },
    include: {
      member: {
        include: { user: { select: { phone: true, name: true } } },
      },
      cycle: {
        include: { group: true },
      },
    },
  });

  if (payout.status !== "PENDING") {
    throw new Error(`Payout is already ${payout.status}`);
  }

  const payoutMember = payout.member;
  const group = payout.cycle.group;

  if (payoutMember.recipientCode) {
    // Initiate real bank transfer via Paystack
    const transferRef = `ajo_payout_${generateReference()}`;
    try {
      const transfer = await initiateTransfer({
        amount: payout.amount,
        recipient: payoutMember.recipientCode,
        reason: `Ajo payout - ${group.name} Cycle #${payout.cycle.cycleNumber}`,
        reference: transferRef,
      });

      await prisma.$transaction([
        prisma.contributionCycle.update({
          where: { id: payout.cycleId },
          data: { status: "PAID_OUT" },
        }),
        prisma.payoutSchedule.update({
          where: { id: payout.id },
          data: {
            status: "PROCESSING",
            transferCode: transfer.data.transfer_code,
            transferRef,
          },
        }),
      ]);

      // WhatsApp notification
      if (payoutMember.user.phone) {
        const formattedAmount = `₦${(payout.amount / 100).toLocaleString()}`;
        sendPayoutNotification({
          phone: payoutMember.user.phone,
          groupName: group.name ?? "Ajo Group",
          amount: formattedAmount,
          recipientName: payoutMember.user.name,
        }).catch((err) => console.error(`[WhatsApp] Payout notification failed:`, err));
      }

      return { status: "PROCESSING", transferCode: transfer.data.transfer_code };
    } catch (err) {
      console.error(`[Ajo] Transfer failed for payout ${payout.id}:`, err);
      await prisma.payoutSchedule.update({
        where: { id: payout.id },
        data: { status: "FAILED", transferRef },
      });
      throw new Error("Transfer failed — please retry");
    }
  } else {
    throw new Error("Recipient has not added bank details yet");
  }
}

/**
 * Get unpaid members for a given cycle (for default tracking / reminders).
 */
export async function getUnpaidMembers(cycleId: string) {
  const cycle = await prisma.contributionCycle.findUniqueOrThrow({
    where: { id: cycleId },
    include: {
      group: {
        include: {
          members: {
            where: { status: "ACTIVE" },
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
      contributions: {
        where: { status: "SUCCESS" },
        select: { memberId: true },
      },
    },
  });

  const paidMemberIds = new Set(cycle.contributions.map((c) => c.memberId));
  return cycle.group.members.filter((m) => !paidMemberIds.has(m.id));
}

/**
 * Mark a member as DEFAULTED if they haven't paid after a cycle closes.
 * Defaulter-handling strategy:
 *
 * 1. The member is marked DEFAULTED and cannot receive payout until resolved.
 * 2. The group admin can choose to:
 *    a) Skip the defaulter's payout turn (move to end)
 *    b) Remove the defaulter and reduce group size
 *    c) Allow a grace period (manual re-open of the cycle)
 * 3. Payouts are NEVER triggered until all required contributions are in.
 */
export async function markDefaulters(cycleId: string) {
  const unpaid = await getUnpaidMembers(cycleId);
  if (unpaid.length === 0) return [];

  const defaulted = await prisma.$transaction(
    unpaid.map((m) =>
      prisma.groupMember.update({
        where: { id: m.id },
        data: { status: "DEFAULTED" },
      })
    )
  );

  return defaulted;
}
