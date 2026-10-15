import React from 'react';
import { Link } from 'react-router-dom';
import MemberAvatar from './MemberAvatar';
import { GroupLineIcon } from './Icons';
import { formatINR } from '../utils/currency';
import { calculateGroupMemberBalances, calculateTotalSpending } from '../utils/calculations';
import { useApp } from '../context/AppContext';

export default function GroupCard({ group }) {
  const { expenses, settlements, currentUserId } = useApp();

  const groupExpenses = expenses.filter((e) => e.groupId === group.id);
  const groupSettlements = settlements.filter((s) => s.groupId === group.id);
  const totalSpendingPaise = calculateTotalSpending(groupExpenses);

  const balances = calculateGroupMemberBalances(group.members, groupExpenses, groupSettlements);
  const userBalancePaise = currentUserId ? (balances[currentUserId]?.outstandingNetPaise || 0) : 0;

  let balanceText = 'Settled';
  let balanceBadgeClass = 'badge-neutral';

  if (userBalancePaise > 0) {
    balanceText = `+${formatINR(userBalancePaise)}`;
    balanceBadgeClass = 'badge-green';
  } else if (userBalancePaise < 0) {
    balanceText = `-${formatINR(Math.abs(userBalancePaise))}`;
    balanceBadgeClass = 'badge-coral';
  }

  return (
    <div className="group-card">
      <div>
        <div className="group-card-header">
          <div className="group-icon-box">
            <GroupLineIcon size={22} color="var(--rosewood)" />
          </div>
          <div className="group-title-wrap">
            <h3 className="group-card-name" title={group.name}>{group.name}</h3>
            {group.description && (
              <p className="group-card-desc" title={group.description}>
                {group.description}
              </p>
            )}
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="avatar-stack">
            {group.members.slice(0, 4).map((member) => (
              <MemberAvatar
                key={member.id}
                name={member.name}
                color={member.avatarColor}
                size="sm"
              />
            ))}
            {group.members.length > 4 && (
              <div className="avatar-stack-more">
                +{group.members.length - 4}
              </div>
            )}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>

      <div>
        <div className="group-card-metrics">
          <div>
            <div className="metric-label">Total Spent</div>
            <div className="metric-val">{formatINR(totalSpendingPaise)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="metric-label">Your Balance</div>
            <span className={`badge ${balanceBadgeClass}`}>{balanceText}</span>
          </div>
        </div>

        <div className="group-card-footer">
          <Link to={`/groups/${group.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            View Group Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
