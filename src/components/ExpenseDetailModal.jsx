import React from 'react';
import MemberAvatar from './MemberAvatar';
import { formatINR } from '../utils/currency';
import { useApp } from '../context/AppContext';

export default function ExpenseDetailModal({ expense, isOpen, onClose }) {
  const { groups, allMembers } = useApp();

  if (!isOpen || !expense) return null;

  const group = groups.find((g) => g.id === expense.groupId);
  const payer = allMembers.find((m) => m.id === expense.paidBy) || { name: 'Unknown', avatarColor: '#A95775' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{expense.description}</h3>
            <span className="badge badge-lilac" style={{ marginTop: '4px' }}>
              {group?.name || 'Group'} • {expense.category}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Main Financial Figure */}
          <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Amount
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--deep-plum)' }}>
              {formatINR(expense.amountPaise)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paid by</span>
              <MemberAvatar name={payer.name} color={payer.avatarColor} size="xs" />
              <span style={{ fontWeight: 600, color: 'var(--deep-plum)' }}>{payer.name}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>on {expense.date}</span>
            </div>
          </div>

          {/* Participant Breakdown */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--deep-plum)' }}>
                Split Breakdown ({expense.splitType === 'EQUAL' ? 'Equal Split' : 'Custom Split'})
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {expense.participants?.length || 0} participants
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expense.participants?.map((p) => {
                const member = allMembers.find((m) => m.id === p.memberId) || { name: 'Member', avatarColor: '#A95775' };
                const isPayer = p.memberId === expense.paidBy;

                return (
                  <div
                    key={p.memberId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--surface-warm)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MemberAvatar name={member.name} color={member.avatarColor} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--deep-plum)' }}>
                          {member.name} {isPayer && <span style={{ fontSize: '0.75rem', color: 'var(--rosewood)' }}>(Payer)</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--deep-plum)' }}>
                      {formatINR(p.sharePaise)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
