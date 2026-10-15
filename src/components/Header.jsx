import React from 'react';
import { Link } from 'react-router-dom';
import MemberAvatar from './MemberAvatar';
import { useApp } from '../context/AppContext';

export default function Header({ pageTitle, onToggleMobileMenu }) {
  const { allMembers, currentUserId, setCurrentUserId, currentUser } = useApp();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 className="header-page-title">{pageTitle}</h2>
      </div>

      <div className="header-right">
        {/* Current User Switcher for testing/viewing perspectives when members exist */}
        {allMembers.length > 0 && currentUser && (
          <div className="user-switcher" title="Switch current viewing user to test all perspectives">
            <MemberAvatar name={currentUser.name} color={currentUser.avatarColor} size="xs" />
            <span className="user-switcher-label">Viewing as:</span>
            <select
              className="user-select"
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              aria-label="Switch viewing user"
            >
              {allMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Add Expense Link */}
        <Link to="/add-expense" className="btn btn-primary btn-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Expense
        </Link>
      </div>
    </header>
  );
}
