import React from 'react';

export default function MemberAvatar({
  name = 'Member',
  size = 'md', // xs, sm, md, lg
  color = '#A95775',
  className = '',
}) {
  const initial = (name || 'M').charAt(0).toUpperCase();

  return (
    <div
      className={`member-avatar avatar-${size} ${className}`}
      style={{ backgroundColor: color }}
      title={name}
      aria-label={name}
    >
      {initial}
    </div>
  );
}
