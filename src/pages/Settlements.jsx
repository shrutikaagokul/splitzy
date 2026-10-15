import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SettlementCard from '../components/SettlementCard';
import MemberAvatar from '../components/MemberAvatar';
import EmptyState from '../components/EmptyState';
import { GroupLineIcon, SettlementSuccessIcon } from '../components/Icons';
import { formatINR } from '../utils/currency';
import { computeAllSuggestedSettlements } from '../utils/settlements';
import { calculateGroupMemberBalances } from '../utils/calculations';
import { useApp } from '../context/AppContext';

export default function Settlements() {
  const [searchParams] = useSearchParams();
  const filterGroupId = searchParams.get('groupId') || 'ALL';

  const { groups, expenses, settlements, currentUserId, allMembers, metrics } = useApp();

  const [activeTab, setActiveTab] = useState('SUGGESTIONS');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState(filterGroupId);

  // Filtered groups based on selection
  const targetGroups = useMemo(() => {
    if (selectedGroupFilter === 'ALL') return groups;
    return groups.filter((g) => g.id === selectedGroupFilter);
  }, [groups, selectedGroupFilter]);

  // Compute suggested settlements across targeted groups
  const suggestedSettlements = useMemo(() => {
    return computeAllSuggestedSettlements(targetGroups, expenses, settlements);
  }, [targetGroups, expenses, settlements]);

  // Filtered completed settlements
  const filteredCompletedSettlements = useMemo(() => {
    return settlements
      .filter((s) => {
        if (selectedGroupFilter === 'ALL') return true;
        return s.groupId === selectedGroupFilter;
      })
      .sort((a, b) => b.settledAt - a.settledAt);
  }, [settlements, selectedGroupFilter]);

  // Outstanding balances matrix per group
  const groupBalancesMap = useMemo(() => {
    const map = {};
    targetGroups.forEach((g) => {
      const gExpenses = expenses.filter((e) => e.groupId === g.id);
      const gSettlements = settlements.filter((s) => s.groupId === g.id);
      map[g.id] = calculateGroupMemberBalances(g.members, gExpenses, gSettlements);
    });
    return map;
  }, [targetGroups, expenses, settlements]);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--deep-plum)' }}>
            Settlements & Balances
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Reconciliation to minimize transactions and settle debts fairly.
          </p>
        </div>

        {/* Group Filter Dropdown */}
        {groups.length > 0 && (
          <div style={{ minWidth: '200px' }}>
            <select
              className="form-select"
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              aria-label="Filter settlements by group"
            >
              <option value="ALL">All Groups ({groups.length})</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Settlements Summary Banner */}
      <div className="settlements-summary-banner">
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Your Net Settlement Status
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--deep-plum)', marginTop: '2px' }}>
            {metrics.netBalancePaise > 0
              ? `You are owed ${formatINR(metrics.netBalancePaise, { absolute: true })}`
              : metrics.netBalancePaise < 0
              ? `You owe ${formatINR(metrics.netBalancePaise, { absolute: true })}`
              : "You're all settled up."}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Total Owed to You: <strong>{formatINR(metrics.owedToYouPaise)}</strong> • You Owe: <strong>{formatINR(metrics.youOwePaise)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '10px 18px', backgroundColor: 'var(--surface-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Pending Transfers
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--rosewood)' }}>
              {suggestedSettlements.length}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 18px', backgroundColor: 'var(--surface-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Completed
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success-green)' }}>
              {filteredCompletedSettlements.length}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="settlements-tab-buttons">
        <button
          className={`tab-btn ${activeTab === 'SUGGESTIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('SUGGESTIONS')}
        >
          Suggested Transfers ({suggestedSettlements.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setActiveTab('COMPLETED')}
        >
          Completed Payments ({filteredCompletedSettlements.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'BALANCES' ? 'active' : ''}`}
          onClick={() => setActiveTab('BALANCES')}
        >
          Group Balances Matrix
        </button>
      </div>

      {/* TAB 1: Suggested Transfers */}
      {activeTab === 'SUGGESTIONS' && (
        <div>
          {suggestedSettlements.length === 0 ? (
            <EmptyState
              icon={<SettlementSuccessIcon size={32} color="var(--success-green)" />}
              title="You're all settled up."
              description="No pending payment suggestions. All members and groups are currently reconciled."
            />
          ) : (
            <div>
              <div style={{ marginBottom: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                These suggested transfers match creditors and debtors greedily to resolve all debts with fewer transactions.
              </div>
              {suggestedSettlements.map((suggestion) => (
                <SettlementCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Completed Payments */}
      {activeTab === 'COMPLETED' && (
        <div>
          {filteredCompletedSettlements.length === 0 ? (
            <EmptyState
              icon={<SettlementSuccessIcon size={32} color="var(--rosewood)" />}
              title="No Completed Settlements Yet"
              description="When a suggested payment is marked as settled, it will appear here."
            />
          ) : (
            <div>
              {filteredCompletedSettlements.map((s) => {
                const grp = groups.find((g) => g.id === s.groupId);
                const fromMem = allMembers.find((m) => m.id === s.fromMemberId) || { name: 'Member' };
                const toMem = allMembers.find((m) => m.id === s.toMemberId) || { name: 'Member' };
                const formattedDate = new Date(s.settledAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={s.id} className="expense-item" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div className="expense-category-icon" style={{ backgroundColor: 'var(--success-green-bg)', color: 'var(--success-green)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <div className="expense-title">
                          <strong>{fromMem.name}</strong> paid <strong>{toMem.name}</strong>
                        </div>
                        <div className="expense-meta">
                          <span className="badge badge-lilac" style={{ fontSize: '0.72rem' }}>{grp?.name || 'Group'}</span>
                          <span>{s.note}</span>
                          <span>•</span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="expense-amount-wrap">
                      <div className="expense-amount-val" style={{ color: 'var(--success-green)' }}>
                        +{formatINR(s.amountPaise)}
                      </div>
                      <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                        Settled
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Outstanding Group Balances Matrix */}
      {activeTab === 'BALANCES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {targetGroups.length === 0 ? (
            <EmptyState
              icon={<GroupLineIcon size={32} color="var(--rosewood)" />}
              title="No groups found"
              description="Create a group to see individual balance breakdowns."
            />
          ) : (
            targetGroups.map((g) => {
              const balances = groupBalancesMap[g.id] || {};

              return (
                <div key={g.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--petal-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GroupLineIcon size={20} color="var(--rosewood)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--deep-plum)' }}>
                        {g.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {g.members.length} members • Isolated group ledger
                      </div>
                    </div>
                  </div>

                  <div className="member-balances-grid" style={{ marginBottom: 0 }}>
                    {g.members.map((member) => {
                      const b = balances[member.id] || {
                        totalPaidPaise: 0,
                        totalSharePaise: 0,
                        outstandingNetPaise: 0,
                      };
                      const net = b.outstandingNetPaise;
                      const isMe = member.id === currentUserId;

                      return (
                        <div key={member.id} className="member-balance-card">
                          <MemberAvatar name={member.name} color={member.avatarColor} size="md" />
                          <div className="member-balance-details">
                            <div className="member-balance-name">
                              <span>{member.name}</span>
                              {isMe && <span className="badge badge-rose" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>You</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Paid {formatINR(b.totalPaidPaise)} • Share {formatINR(b.totalSharePaise)}
                            </div>
                            <div style={{ marginTop: '6px' }}>
                              {net > 0 && <span className="badge badge-green">Gets {formatINR(net)}</span>}
                              {net < 0 && <span className="badge badge-coral">Owes {formatINR(Math.abs(net))}</span>}
                              {net === 0 && <span className="badge badge-neutral">Settled</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
