import React from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/currency';

export default function BalanceCard({ netBalancePaise = 0, youOwePaise = 0, owedToYouPaise = 0 }) {
  let statusClass = 'neutral';
  let eyebrowText = 'Total Balance';
  let explanationText = "You're all settled up!";

  if (netBalancePaise > 0) {
    statusClass = 'positive';
    eyebrowText = 'Overall Receivable';
    explanationText = `You're owed ${formatINR(netBalancePaise, { absolute: true })}`;
  } else if (netBalancePaise < 0) {
    statusClass = 'negative';
    eyebrowText = 'Overall Payable';
    explanationText = `You owe ${formatINR(netBalancePaise, { absolute: true })}`;
  }

  return (
    <div className="signature-balance-card">
      <div className="balance-content">
        <div className="balance-eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M6 12h12" />
          </svg>
          {eyebrowText}
        </div>
        <div className={`balance-amount ${statusClass}`}>
          {formatINR(netBalancePaise, { showSign: netBalancePaise !== 0 })}
        </div>
        <div className="balance-explanation">
          {explanationText}
        </div>
      </div>

      <div className="balance-action">
        <Link to="/settlements" className="btn btn-primary btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Settle Balances
        </Link>
      </div>
    </div>
  );
}
