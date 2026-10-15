import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loadGroups,
  saveGroups,
  loadExpenses,
  saveExpenses,
  loadSettlements,
  saveSettlements,
  loadCurrentUserId,
  saveCurrentUserId,
  clearAllStorage,
  initializeStorage,
} from '../utils/storage';
import { calculateGroupMemberBalances } from '../utils/calculations';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Execute one-time clean storage initialization
  initializeStorage();

  const [groups, setGroups] = useState(loadGroups);
  const [expenses, setExpenses] = useState(loadExpenses);
  const [settlements, setSettlements] = useState(loadSettlements);
  const [currentUserId, setCurrentUserIdState] = useState(loadCurrentUserId);
  const [toast, setToast] = useState(null);

  // Sync state to LocalStorage
  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveSettlements(settlements);
  }, [settlements]);

  useEffect(() => {
    saveCurrentUserId(currentUserId);
  }, [currentUserId]);

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const closeToast = () => setToast(null);

  // Set current user
  const setCurrentUserId = (id) => {
    setCurrentUserIdState(id);
  };

  // Find all distinct members across groups
  const allMembers = React.useMemo(() => {
    const map = new Map();
    groups.forEach((g) => {
      g.members.forEach((m) => {
        if (!map.has(m.id)) {
          map.set(m.id, m);
        }
      });
    });
    return Array.from(map.values());
  }, [groups]);

  // Current active user object (null if no members exist yet)
  const currentUser = React.useMemo(() => {
    if (allMembers.length === 0) return null;
    const found = allMembers.find((m) => m.id === currentUserId);
    if (found) return found;
    return allMembers[0];
  }, [allMembers, currentUserId]);

  // Auto-sync currentUserId if valid members exist but currentUserId is empty
  useEffect(() => {
    if (allMembers.length > 0 && (!currentUserId || !allMembers.some((m) => m.id === currentUserId))) {
      setCurrentUserIdState(allMembers[0].id);
    }
  }, [allMembers, currentUserId]);

  // Palette colors for auto-generating avatars
  const avatarColors = ['#A95775', '#B6A3DF', '#278567', '#D96A79', '#39283F', '#D995AA', '#786499'];

  // Create a new group with pure user-supplied data
  const createGroup = ({ name, description = '', memberNames = [] }) => {
    if (!name || !name.trim()) {
      showToast('Group name is required.', 'error');
      return null;
    }

    const trimmedNames = memberNames
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    const uniqueNames = [...new Set(trimmedNames)];
    if (uniqueNames.length < 2) {
      showToast('A group must have at least 2 distinct member names.', 'error');
      return null;
    }

    const newGroupId = `grp_${Date.now()}`;
    const members = uniqueNames.map((mName, index) => ({
      id: `mem_${Date.now()}_${index}`,
      name: mName,
      initial: mName.charAt(0).toUpperCase(),
      avatarColor: avatarColors[index % avatarColors.length],
    }));

    const newGroup = {
      id: newGroupId,
      name: name.trim(),
      description: description.trim(),
      createdAt: Date.now(),
      members,
    };

    setGroups((prev) => [newGroup, ...prev]);

    // If no user was selected, set to the first member of this new group
    if (!currentUserId || !allMembers.some((m) => m.id === currentUserId)) {
      setCurrentUserIdState(members[0].id);
    }

    showToast(`Group "${newGroup.name}" created successfully.`, 'success');
    return newGroup;
  };

  // Delete a group and remove all associated expenses and settlements consistently
  const deleteGroup = (groupId) => {
    const groupToDelete = groups.find((g) => g.id === groupId);
    const groupName = groupToDelete?.name || 'Group';

    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setExpenses((prev) => prev.filter((e) => e.groupId !== groupId));
    setSettlements((prev) => prev.filter((s) => s.groupId !== groupId));

    showToast(`"${groupName}" and its records have been removed.`, 'info');
  };

  // Add a member to an existing group
  const addMemberToGroup = (groupId, memberName) => {
    if (!memberName || !memberName.trim()) {
      showToast('Member name cannot be empty.', 'error');
      return false;
    }

    const trimmed = memberName.trim();
    const group = groups.find((g) => g.id === groupId);
    if (!group) return false;

    if (group.members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`${trimmed} is already in this group.`, 'error');
      return false;
    }

    const newMember = {
      id: `mem_${Date.now()}_${group.members.length}`,
      name: trimmed,
      initial: trimmed.charAt(0).toUpperCase(),
      avatarColor: avatarColors[group.members.length % avatarColors.length],
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            members: [...g.members, newMember],
          };
        }
        return g;
      })
    );

    showToast(`${trimmed} added to ${group.name}.`, 'success');
    return true;
  };

  // Add an expense
  const addExpense = (expenseData) => {
    const {
      groupId,
      description,
      amountPaise,
      paidBy,
      category,
      date,
      splitType,
      participants,
    } = expenseData;

    if (!description || !description.trim()) {
      showToast('Please enter an expense description.', 'error');
      return false;
    }

    if (!amountPaise || amountPaise <= 0) {
      showToast('Amount must be greater than zero.', 'error');
      return false;
    }

    if (!groupId) {
      showToast('Please select a group.', 'error');
      return false;
    }

    if (!paidBy) {
      showToast('Please specify who paid for this expense.', 'error');
      return false;
    }

    if (!participants || participants.length === 0) {
      showToast('Please select at least one participant sharing the expense.', 'error');
      return false;
    }

    const newExpense = {
      id: `exp_${Date.now()}`,
      groupId,
      description: description.trim(),
      amountPaise: Number(amountPaise),
      paidBy,
      category: category || 'Other',
      date: date || new Date().toISOString().split('T')[0],
      splitType: splitType || 'EQUAL',
      participants,
      createdAt: Date.now(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Added expense "${newExpense.description}"`, 'success');
    return true;
  };

  // Delete an expense
  const deleteExpense = (expenseId) => {
    const target = expenses.find((e) => e.id === expenseId);
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    showToast(`Expense "${target?.description || ''}" deleted.`, 'info');
  };

  // Record a completed settlement payment
  const recordSettlement = ({ groupId, fromMemberId, toMemberId, amountPaise, note = 'Settled payment' }) => {
    if (!groupId || !fromMemberId || !toMemberId || !amountPaise) {
      showToast('Invalid settlement details.', 'error');
      return false;
    }

    const newSettlement = {
      id: `set_${Date.now()}`,
      groupId,
      fromMemberId,
      toMemberId,
      amountPaise: Number(amountPaise),
      settledAt: Date.now(),
      note,
    };

    setSettlements((prev) => [newSettlement, ...prev]);
    showToast('Payment marked as settled.', 'success');
    return true;
  };

  // Clear all data
  const clearData = () => {
    clearAllStorage();
    setGroups([]);
    setExpenses([]);
    setSettlements([]);
    setCurrentUserIdState('');
    showToast('All local application data cleared.', 'info');
  };

  // Global calculations for current user
  const metrics = React.useMemo(() => {
    let totalGroupSpending = 0;
    let youOwePaise = 0;
    let owedToYouPaise = 0;

    // Total spending across all groups
    expenses.forEach((e) => {
      totalGroupSpending += Number(e.amountPaise) || 0;
    });

    if (currentUserId && groups.length > 0) {
      // Per-group balances for the current user
      groups.forEach((group) => {
        const gExpenses = expenses.filter((e) => e.groupId === group.id);
        const gSettlements = settlements.filter((s) => s.groupId === group.id);
        const balances = calculateGroupMemberBalances(group.members, gExpenses, gSettlements);

        const userBalance = balances[currentUserId]?.outstandingNetPaise || 0;
        if (userBalance > 0) {
          owedToYouPaise += userBalance;
        } else if (userBalance < 0) {
          youOwePaise += Math.abs(userBalance);
        }
      });
    }

    const netBalancePaise = owedToYouPaise - youOwePaise;

    return {
      totalGroupSpending,
      youOwePaise,
      owedToYouPaise,
      netBalancePaise,
      activeGroupsCount: groups.length,
    };
  }, [groups, expenses, settlements, currentUserId]);

  return (
    <AppContext.Provider
      value={{
        groups,
        expenses,
        settlements,
        currentUserId,
        currentUser,
        allMembers,
        metrics,
        toast,
        setCurrentUserId,
        createGroup,
        deleteGroup,
        addMemberToGroup,
        addExpense,
        deleteExpense,
        recordSettlement,
        clearData,
        showToast,
        closeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
