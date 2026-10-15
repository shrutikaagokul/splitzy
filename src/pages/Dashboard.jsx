import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SummaryCard from '../components/SummaryCard';
import BalanceCard from '../components/BalanceCard';
import GroupCard from '../components/GroupCard';
import CategoryChart from '../components/CategoryChart';
import ExpenseDetailModal from '../components/ExpenseDetailModal';
import EmptyState from '../components/EmptyState';
import { CategoryIcon, GroupLineIcon, ReceiptIcon } from '../components/Icons';
import { formatINR } from '../utils/currency';
import { useApp } from '../context/AppContext';

export default function Dashboard({ onCreateGroupClick }) {
  const { groups, expenses, metrics, currentUser } = useApp();
  const [selectedExpense, setSelectedExpense] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div>
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <h1 className="dashboard-title">
          {currentUser ? `${getGreeting()}, ${currentUser.name}!` : `${getGreeting()}! Welcome to Splitzy`}
        </h1>
        <p className="dashboard-subtitle">
          Your shared expenses, a little more organised.
        </p>
      </div>

      {/* Signature Balance Card */}
      <div className="dashboard-signature-section">
        <BalanceCard
          netBalancePaise={metrics.netBalancePaise}
          youOwePaise={metrics.youOwePaise}
          owedToYouPaise={metrics.owedToYouPaise}
        />
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard
          label="Total Group Spending"
          value={formatINR(metrics.totalGroupSpending)}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          }
          theme="rose"
        />

        <SummaryCard
          label="You Owe"
          value={formatINR(metrics.youOwePaise)}
          valueTheme={metrics.youOwePaise > 0 ? 'value-coral' : ''}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          }
          theme="coral"
        />

        <SummaryCard
          label="Owed to You"
          value={formatINR(metrics.owedToYouPaise)}
          valueTheme={metrics.owedToYouPaise > 0 ? 'value-green' : ''}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          }
          theme="green"
        />

        <SummaryCard
          label="Active Groups"
          value={metrics.activeGroupsCount}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          theme="lilac"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-bar">
        <button onClick={onCreateGroupClick} className="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Group
        </button>

        <Link to="/add-expense" className="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Add Expense
        </Link>

        <Link to="/settlements" className="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          View Settlements
        </Link>
      </div>

      {/* Main Dashboard Two Column Grid */}
      <div className="dashboard-grid-two-col">
        {/* Left Column: Groups & Recent Expenses */}
        <div>
          {/* Groups Section */}
          <div style={{ marginBottom: '36px' }}>
            <div className="section-header">
              <h3 className="section-title">Your Groups</h3>
              {groups.length > 0 && (
                <Link to="/groups" className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
                  View All ({groups.length})
                </Link>
              )}
            </div>

            {groups.length === 0 ? (
              <EmptyState
                icon={<GroupLineIcon size={32} color="var(--rosewood)" />}
                title="Your groups will appear here"
                description="Create a group to start tracking and splitting shared expenses."
                actionLabel="Create Group"
                onActionClick={onCreateGroupClick}
              />
            ) : (
              <div className="groups-grid" style={{ marginTop: 0 }}>
                {groups.slice(0, 4).map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Expenses Section */}
          <div>
            <div className="section-header">
              <h3 className="section-title">Recent Expenses</h3>
              {expenses.length > 0 && (
                <Link to="/expenses" className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
                  All Expenses ({expenses.length})
                </Link>
              )}
            </div>

            {recentExpenses.length === 0 ? (
              <EmptyState
                icon={<ReceiptIcon size={32} color="var(--rosewood)" />}
                title="No expenses yet."
                description="Split your shared bills, dining, travel, or group costs."
                actionLabel="Add Expense"
                actionLink="/add-expense"
              />
            ) : (
              <div>
                {recentExpenses.map((exp) => {
                  const grp = groups.find((g) => g.id === exp.groupId);
                  const payer = grp?.members.find((m) => m.id === exp.paidBy) || { name: 'Member' };

                  return (
                    <div
                      key={exp.id}
                      className="expense-item"
                      onClick={() => setSelectedExpense(exp)}
                      style={{ cursor: 'pointer' }}
                      title="Click to view full split breakdown"
                    >
                      <div className="expense-category-icon" style={{ backgroundColor: 'var(--soft-lilac)', color: 'var(--rosewood)' }}>
                        <CategoryIcon category={exp.category} size={20} color="var(--rosewood)" />
                      </div>
                      <div className="expense-info">
                        <div className="expense-title">{exp.description}</div>
                        <div className="expense-meta">
                          <span>{grp?.name || 'Group'}</span>
                          <span>•</span>
                          <span>{exp.category}</span>
                          <span>•</span>
                          <span>{exp.date}</span>
                        </div>
                      </div>
                      <div className="expense-amount-wrap">
                        <div className="expense-amount-val">{formatINR(exp.amountPaise)}</div>
                        <div className="expense-paid-by">Paid by {payer.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Spending Breakdown Chart */}
        <div>
          <CategoryChart expenses={expenses} />
        </div>
      </div>

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
      />
    </div>
  );
}
