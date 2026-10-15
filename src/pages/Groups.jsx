import React from 'react';
import GroupCard from '../components/GroupCard';
import EmptyState from '../components/EmptyState';
import { GroupLineIcon } from '../components/Icons';
import { useApp } from '../context/AppContext';

export default function Groups({ onCreateGroupClick }) {
  const { groups } = useApp();

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--deep-plum)' }}>
            My Groups
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage shared expense groups for trips, roommates, events, and family.
          </p>
        </div>

        <button onClick={onCreateGroupClick} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<GroupLineIcon size={32} color="var(--rosewood)" />}
          title="Your groups will appear here."
          description="Create your first group to start recording and splitting expenses."
          actionLabel="Create Your First Group"
          onActionClick={onCreateGroupClick}
        />
      ) : (
        <div className="groups-grid">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
