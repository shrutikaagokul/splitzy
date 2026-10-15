import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast, closeToast } = useApp();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className={`toast toast-${toast.type}`}>
        {isSuccess && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {isError && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--error-coral)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )}
        {!isSuccess && !isError && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rosewood)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        )}
        <div className="toast-message">{toast.message}</div>
        <button
          onClick={closeToast}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          aria-label="Close notification"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
