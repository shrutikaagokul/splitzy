/**
 * Splitzy Greedy Settlement Engine
 * Reconciles group member debts into clear, actionable transfer suggestions.
 */

import { calculateGroupMemberBalances } from './calculations';

/**
 * Computes suggested transfers using the greedy bilateral matching algorithm.
 * Operates on outstanding balances (incorporating completed settlements).
 *
 * @param {Array<{ id: string, name: string }>} members
 * @param {Array<object>} groupExpenses
 * @param {Array<object>} groupSettlements
 * @param {string} groupId
 * @param {string} groupName
 * @returns {Array<{
 *   id: string,
 *   groupId: string,
 *   groupName: string,
 *   fromMemberId: string,
 *   fromMemberName: string,
 *   toMemberId: string,
 *   toMemberName: string,
 *   amountPaise: number
 * }>}
 */
export function computeSuggestedSettlements(
  members,
  groupExpenses,
  groupSettlements = [],
  groupId = '',
  groupName = ''
) {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const balances = calculateGroupMemberBalances(members, groupExpenses, groupSettlements);

  // Separate debtors and creditors based on outstanding balances
  // We use a 1-paisa threshold to avoid floating/rounding edge artifacts
  const debtors = [];
  const creditors = [];

  Object.values(balances).forEach((b) => {
    if (b.outstandingNetPaise < -1) {
      debtors.push({
        id: b.memberId,
        name: b.name,
        // absolute amount owed
        balance: Math.abs(b.outstandingNetPaise),
      });
    } else if (b.outstandingNetPaise > 1) {
      creditors.push({
        id: b.memberId,
        name: b.name,
        // amount receivable
        balance: b.outstandingNetPaise,
      });
    }
  });

  const suggestions = [];
  let stepIndex = 0;

  // Greedy match: repeatedly match the largest debtor with the largest creditor
  while (debtors.length > 0 && creditors.length > 0) {
    // Sort descending by outstanding amount to pick the largest
    debtors.sort((a, b) => b.balance - a.balance);
    creditors.sort((a, b) => b.balance - a.balance);

    const largestDebtor = debtors[0];
    const largestCreditor = creditors[0];

    const transferAmount = Math.min(largestDebtor.balance, largestCreditor.balance);

    if (transferAmount > 0) {
      stepIndex += 1;
      suggestions.push({
        id: `sug_${groupId}_${stepIndex}_${largestDebtor.id}_${largestCreditor.id}`,
        groupId,
        groupName,
        fromMemberId: largestDebtor.id,
        fromMemberName: largestDebtor.name,
        toMemberId: largestCreditor.id,
        toMemberName: largestCreditor.name,
        amountPaise: transferAmount,
      });

      largestDebtor.balance -= transferAmount;
      largestCreditor.balance -= transferAmount;
    }

    // Remove if settled (or negligible remainder <= 1 paisa)
    if (largestDebtor.balance <= 1) {
      debtors.shift();
    }
    if (largestCreditor.balance <= 1) {
      creditors.shift();
    }
  }

  return suggestions;
}

/**
 * Computes all suggested transfers across all groups
 */
export function computeAllSuggestedSettlements(groups, expenses, settlements) {
  const allSuggestions = [];

  groups.forEach((group) => {
    const groupExpenses = expenses.filter((e) => e.groupId === group.id);
    const groupSettlements = settlements.filter((s) => s.groupId === group.id);

    const groupSuggestions = computeSuggestedSettlements(
      group.members,
      groupExpenses,
      groupSettlements,
      group.id,
      group.name
    );

    allSuggestions.push(...groupSuggestions);
  });

  return allSuggestions;
}
