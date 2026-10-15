import React, { useState } from 'react';
import MemberAvatar from './MemberAvatar';
import ConfirmationModal from './ConfirmationModal';
import { formatINR } from '../utils/currency';
import { useApp } from '../context/AppContext';

export default function SettlementCard({ suggestion, onSettled }) {
  const { allMembers, recordSettlement } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);

  const fromMember = allMembers.find((m) => m.id === suggestion.fromMemberId) || {
    name: suggestion.fromMemberName,
    avatarColor: '#D96A79',
  };

  const toMember = allMembers.find((m) => m.id === suggestion.toMemberId) || {
    name: suggestion.toMemberName,
    avatarColor: '#278567',
  };

  const handleConfirmSettlement = () => {
    recordSettlement({
      groupId: suggestion.groupId,
      fromMemberId: suggestion.fromMemberId,
      toMemberId: suggestion.toMemberId,
      amountPaise: suggestion.amountPaise,
      note: `Settled payment from ${fromMember.name} to ${toMember.name}`,
    });
    setShowConfirm(false);
    if (onSettled) onSettled();
  };

  return (
    <>
      <div className="settlement-card">
        <div className="settlement-transfer-visual">
          {/* Debtor (Who pays) */}
          <div className="settlement-participant">
            <MemberAvatar name={fromMember.name} color={fromMember.avatarColor} size="md" />
            <div className="settlement-p-info">
              <span className="settlement-p-role">Pays</span>
              <span className="settlement-p-name">{fromMember.name}</span>
            </div>
          </div>

          {/* Transfer Visual & Amount */}
          <div className="transfer-direction-arrow">
            <span className="transfer-amount-pill">
              {formatINR(suggestion.amountPaise)}
            </span>
            <div className="transfer-arrow-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            {suggestion.groupName && (
              <span className="badge badge-lilac" style={{ fontSize: '0.7rem' }}>
                {suggestion.groupName}
              </span>
            )}
          </div>

          {/* Creditor (Who receives) */}
          <div className="settlement-participant">
            <MemberAvatar name={toMember.name} color={toMember.avatarColor} size="md" />
            <div className="settlement-p-info">
              <span className="settlement-p-role">Receives</span>
              <span className="settlement-p-name">{toMember.name}</span>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowConfirm(true)}
            className="btn btn-primary btn-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark as Settled
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Confirm Settlement Payment"
        message={`Confirm that ${fromMember.name} has paid ${formatINR(suggestion.amountPaise)} to ${toMember.name}? This will record the payment and update outstanding balances.`}
        confirmText="Confirm Settlement"
        confirmVariant="primary"
        onConfirm={handleConfirmSettlement}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
