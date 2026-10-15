import React from 'react';
import { Link } from 'react-router-dom';
import { GroupLineIcon } from './Icons';

export default function EmptyState({
  icon,
  title = 'No records found',
  description = 'Start by adding an entry or exploring existing groups.',
  actionLabel,
  actionLink,
  onActionClick,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon || <GroupLineIcon size={28} color="var(--rosewood)" />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onActionClick && (
        <button onClick={onActionClick} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
