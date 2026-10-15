/**
 * Splitzy Calculation Engine
 * Implements deterministic equal splits with remainder distribution,
 * custom split validation, and per-member net balance computations.
 */

/**
 * Distribute an amount equally among participants, allocating any leftover paise
 * deterministically so the sum of individual shares exactly equals totalPaise.
 *
 * @param {number} totalPaise - Total expense in integer paise
 * @param {string[]} participantIds - Array of member IDs sharing the expense
 * @returns {Array<{ memberId: string, sharePaise: number }>}
 */
export function distributeEqualSplit(totalPaise, participantIds) {
  if (!participantIds || participantIds.length === 0 || totalPaise <= 0) {
    return [];
  }

  const count = participantIds.length;
  const baseShare = Math.floor(totalPaise / count);
  const remainder = totalPaise % count;

  return participantIds.map((memberId, index) => {
    // First 'remainder' participants receive 1 extra paisa
    const sharePaise = index < remainder ? baseShare + 1 : baseShare;
    return {
      memberId,
      sharePaise,
    };
  });
}

/**
 * Validates custom split shares against the total expense.
 *
 * @param {number} totalPaise - Total expense in paise
 * @param {Array<{ memberId: string, sharePaise: number }>} customShares
 * @returns {{ isValid: boolean, sumPaise: number, differencePaise: number, message: string }}
 */
export function validateCustomSplit(totalPaise, customShares) {
  if (!customShares || customShares.length === 0) {
    return {
      isValid: false,
      sumPaise: 0,
      differencePaise: totalPaise,
      message: 'At least one participant must have an assigned share.',
    };
  }

  const sumPaise = customShares.reduce((acc, curr) => acc + (Number(curr.sharePaise) || 0), 0);
  const diff = totalPaise - sumPaise;

  if (diff === 0) {
    return {
      isValid: true,
      sumPaise,
      differencePaise: 0,
      message: 'Shares match the total expense exactly.',
    };
  }

  if (diff > 0) {
    return {
      isValid: false,
      sumPaise,
      differencePaise: diff,
      message: `Remaining to allocate: ₹${(diff / 100).toFixed(2)}`,
    };
  }

  return {
    isValid: false,
    sumPaise,
    differencePaise: diff,
    message: `Allocated ₹${(Math.abs(diff) / 100).toFixed(2)} over the total expense.`,
  };
}

/**
 * Calculates raw expense balances for all members in a given group.
 * Does NOT include settlements (historical raw balance).
 *
 * @param {Array<{ id: string, name: string }>} members
 * @param {Array<object>} groupExpenses
 * @returns {Record<string, { totalPaidPaise: number, totalSharePaise: number, rawNetPaise: number }>}
 */
export function calculateRawGroupBalances(members, groupExpenses) {
  const balances = {};

  // Initialize for all members
  members.forEach((m) => {
    balances[m.id] = {
      totalPaidPaise: 0,
      totalSharePaise: 0,
      rawNetPaise: 0,
    };
  });

  groupExpenses.forEach((exp) => {
    // Credit payer
    if (balances[exp.paidBy]) {
      balances[exp.paidBy].totalPaidPaise += exp.amountPaise;
    }

    // Debit participants
    if (Array.isArray(exp.participants)) {
      exp.participants.forEach((p) => {
        if (balances[p.memberId]) {
          balances[p.memberId].totalSharePaise += p.sharePaise;
        }
      });
    }
  });

  // Calculate raw net
  Object.keys(balances).forEach((memberId) => {
    balances[memberId].rawNetPaise =
      balances[memberId].totalPaidPaise - balances[memberId].totalSharePaise;
  });

  return balances;
}

/**
 * Calculates outstanding net balances for group members, incorporating completed settlements.
 * Settling a debt does NOT alter expense history, but offsets the member's outstanding balance.
 *
 * @param {Array<{ id: string, name: string }>} members
 * @param {Array<object>} groupExpenses
 * @param {Array<object>} groupSettlements - Completed settlements for this group
 * @returns {Record<string, {
 *   memberId: string,
 *   name: string,
 *   totalPaidPaise: number,
 *   totalSharePaise: number,
 *   rawNetPaise: number,
 *   settlementsPaidPaise: number,
 *   settlementsReceivedPaise: number,
 *   outstandingNetPaise: number
 * }>}
 */
export function calculateGroupMemberBalances(members, groupExpenses, groupSettlements = []) {
  const rawBalances = calculateRawGroupBalances(members, groupExpenses);
  const result = {};

  members.forEach((m) => {
    result[m.id] = {
      memberId: m.id,
      name: m.name,
      avatarColor: m.avatarColor,
      totalPaidPaise: rawBalances[m.id]?.totalPaidPaise || 0,
      totalSharePaise: rawBalances[m.id]?.totalSharePaise || 0,
      rawNetPaise: rawBalances[m.id]?.rawNetPaise || 0,
      settlementsPaidPaise: 0,
      settlementsReceivedPaise: 0,
      outstandingNetPaise: rawBalances[m.id]?.rawNetPaise || 0,
    };
  });

  // Apply settlements:
  // When member A pays member B:
  // A's debt is reduced (+amountPaise to A's net balance towards 0)
  // B's credit is satisfied (-amountPaise to B's net balance towards 0)
  groupSettlements.forEach((s) => {
    const amount = Number(s.amountPaise) || 0;
    if (result[s.fromMemberId]) {
      result[s.fromMemberId].settlementsPaidPaise += amount;
      result[s.fromMemberId].outstandingNetPaise += amount;
    }
    if (result[s.toMemberId]) {
      result[s.toMemberId].settlementsReceivedPaise += amount;
      result[s.toMemberId].outstandingNetPaise -= amount;
    }
  });

  return result;
}

/**
 * Calculate total spending in a list of expenses
 */
export function calculateTotalSpending(expenses) {
  return expenses.reduce((sum, exp) => sum + (Number(exp.amountPaise) || 0), 0);
}
