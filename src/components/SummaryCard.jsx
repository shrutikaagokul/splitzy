import React from 'react';

export default function SummaryCard({
  label,
  value,
  icon,
  theme = 'rose', // rose, lilac, green, coral
  valueTheme = '', // value-green, value-coral
  subtext,
}) {
  return (
    <div className="summary-card">
      <div className={`summary-icon-wrapper summary-icon-${theme}`}>
        {icon}
      </div>
      <div className="summary-info">
        <div className="summary-label">{label}</div>
        <div className={`summary-value ${valueTheme}`}>{value}</div>
        {subtext && <div className="form-hint">{subtext}</div>}
      </div>
    </div>
  );
}
