import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MemberAvatar from '../components/MemberAvatar';
import ExpenseDetailModal from '../components/ExpenseDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import { CategoryIcon, GroupLineIcon, ReceiptIcon, SearchEmptyIcon } from '../components/Icons';
import { formatINR } from '../utils/currency';
import {
  calculateGroupMemberBalances,
  calculateTotalSpending,
} from '../utils/calculations';
import { useApp } from '../context/AppContext';

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    groups,
    expenses,
    settlements,
    currentUserId,
    deleteGroup,
    addMemberToGroup,
    deleteExpense,
  } = useApp();

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const group = groups.find((g) => g.id === id);

  if (!group) {
    return (
      <EmptyState
        icon={<SearchEmptyIcon size={32} color="var(--rosewood)" />}
        title="Group Not Found"
        description="The group you are looking for does not exist or may have been deleted."
        actionLabel="Back to Groups"
        actionLink="/groups"
      />
    );
  }

  const groupExpenses = expenses.filter((e) => e.groupId === group.id);
  const groupSettlements = settlements.filter((s) => s.groupId === group.id);
  const totalSpendingPaise = calculateTotalSpending(groupExpenses);

  const memberBalances = calculateGroupMemberBalances(
    group.members,
    groupExpenses,
    groupSettlements
  );

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      const success = addMemberToGroup(group.id, newMemberName.trim());
      if (success) {
        setNewMemberName('');
        setIsAddingMember(false);
      }
    }
  };

  const handleConfirmDeleteGroup = () => {
    deleteGroup(group.id);
    navigate('/groups');
  };

  const handleConfirmDeleteExpense = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="group-details-header">
        <div className="group-details-top">
          <div className="group-title-area">
            <div className="group-hero-icon">
              <GroupLineIcon size={30} color="var(--rosewood)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--deep-plum)' }}>
                  {group.name}
                </h1>
                <span className="badge badge-lilac">
                  {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                </span>
              </div>
              {group.description && (
                <p style={{ color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '640px' }}>
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div className="group-details-actions">
            <Link to={`/add-expense?groupId=${group.id}`} className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Expense
            </Link>

            <Link to={`/settlements?groupId=${group.id}`} className="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              View Settlements
            </Link>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger btn-sm"
              title="Delete this group and all its records"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Group Financial Metrics */}
        <div className="group-metrics-summary">
          <div>
            <div className="metric-label">Total Group Spending</div>
            <div className="summary-value">{formatINR(totalSpendingPaise)}</div>
          </div>

          <div>
            <div className="metric-label">Expenses Logged</div>
            <div className="summary-value">{groupExpenses.length}</div>
          </div>

          <div>
            <div className="metric-label">Your Net Status</div>
            {(() => {
              const myBal = currentUserId ? (memberBalances[currentUserId]?.outstandingNetPaise || 0) : 0;
              if (myBal > 0) {
                return (
                  <div className="summary-value value-green">
                    Receivable +{formatINR(myBal)}
                  </div>
                );
              }
              if (myBal < 0) {
                return (
                  <div className="summary-value value-coral">
                    Owes -{formatINR(Math.abs(myBal))}
                  </div>
                );
              }
              return <div className="summary-value">All Settled Up</div>;
            })()}
          </div>
        </div>
      </div>

      {/* Member Balances Section */}
      <div style={{ marginBottom: '36px' }}>
        <div className="section-header">
          <div>
            <h3 className="section-title">Member Balances</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Individual spending, assigned shares, and current outstanding balances.
            </p>
          </div>

          {!isAddingMember ? (
            <button
              onClick={() => setIsAddingMember(true)}
              className="btn btn-outline btn-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Member
            </button>
          ) : (
            <form onSubmit={handleAddMemberSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.85rem', width: '180px' }}
                placeholder="New member name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Add
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsAddingMember(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        <div className="member-balances-grid">
          {group.members.map((member) => {
            const data = memberBalances[member.id] || {
              totalPaidPaise: 0,
              totalSharePaise: 0,
              outstandingNetPaise: 0,
            };
            const isMe = member.id === currentUserId;
            const net = data.outstandingNetPaise;

            let netBadgeClass = 'badge-neutral';
            let netLabel = 'Settled';

            if (net > 0) {
              netBadgeClass = 'badge-green';
              netLabel = `Gets +${formatINR(net)}`;
            } else if (net < 0) {
              netBadgeClass = 'badge-coral';
              netLabel = `Owes -${formatINR(Math.abs(net))}`;
            }

            return (
              <div key={member.id} className="member-balance-card">
                <MemberAvatar name={member.name} color={member.avatarColor} size="md" />
                <div className="member-balance-details">
                  <div className="member-balance-name">
                    <span>{member.name}</span>
                    {isMe && <span className="badge badge-rose" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>You</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Paid {formatINR(data.totalPaidPaise)} • Share {formatINR(data.totalSharePaise)}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`badge ${netBadgeClass}`}>{netLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense History Section */}
      <div>
        <div className="section-header">
          <h3 className="section-title">Expense History ({groupExpenses.length})</h3>
          <Link to={`/add-expense?groupId=${group.id}`} className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
            + Add Expense
          </Link>
        </div>

        {groupExpenses.length === 0 ? (
          <EmptyState
            icon={<ReceiptIcon size={32} color="var(--rosewood)" />}
            title="No expenses in this group yet"
            description="Add your first expense to begin splitting fairly among members."
            actionLabel="Add Expense"
            actionLink={`/add-expense?groupId=${group.id}`}
          />
        ) : (
          <div>
            {groupExpenses.map((exp) => {
              const payer = group.members.find((m) => m.id === exp.paidBy) || { name: 'Member' };

              return (
                <div key={exp.id} className="expense-item" style={{ justifyContent: 'space-between' }}>
                  <div
                    onClick={() => setSelectedExpense(exp)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, cursor: 'pointer' }}
                  >
                    <div className="expense-category-icon" style={{ backgroundColor: 'var(--soft-lilac)', color: 'var(--rosewood)' }}>
                      <CategoryIcon category={exp.category} size={20} color="var(--rosewood)" />
                    </div>
                    <div>
                      <div className="expense-title">{exp.description}</div>
                      <div className="expense-meta">
                        <span>{exp.category}</span>
                        <span>•</span>
                        <span>{exp.date}</span>
                        <span>•</span>
                        <span>{exp.splitType === 'EQUAL' ? 'Equal Split' : 'Custom Split'}</span>
                        <span>•</span>
                        <span>{exp.participants?.length || 0} sharing</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="expense-amount-wrap">
                      <div className="expense-amount-val">{formatINR(exp.amountPaise)}</div>
                      <div className="expense-paid-by">Paid by {payer.name}</div>
                    </div>

                    <button
                      onClick={() => setExpenseToDelete(exp)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px', color: 'var(--text-muted)' }}
                      title="Delete expense"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
      />

      {/* Delete Group Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title={`Delete "${group.name}"?`}
        message={`Are you sure you want to delete this group? All ${groupExpenses.length} associated expenses and settlement records will be permanently removed.`}
        confirmText="Delete Group"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteGroup}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Delete Expense Modal */}
      <ConfirmationModal
        isOpen={Boolean(expenseToDelete)}
        title="Delete Expense?"
        message={`Are you sure you want to delete "${expenseToDelete?.description || 'this expense'}" of ${formatINR(expenseToDelete?.amountPaise || 0)}? Balances will be recalculated immediately.`}
        confirmText="Delete Expense"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteExpense}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
}
