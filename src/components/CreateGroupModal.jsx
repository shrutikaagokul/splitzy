import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const { createGroup } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // Fresh clean inputs without preloaded people
  const [members, setMembers] = useState(['', '']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index) => {
    if (members.length <= 2) {
      setError('A group must have at least 2 members.');
      return;
    }
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a group name.');
      return;
    }

    const cleanedMembers = members.map((m) => m.trim()).filter((m) => m.length > 0);
    const uniqueMembers = [...new Set(cleanedMembers)];

    if (uniqueMembers.length < 2) {
      setError('Please enter at least two distinct member names.');
      return;
    }

    const created = createGroup({
      name,
      description,
      memberNames: uniqueMembers,
    });

    if (created) {
      setName('');
      setDescription('');
      setMembers(['', '']);
      onClose();
      if (onGroupCreated) onGroupCreated(created);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create a New Group</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="form-error" style={{ marginBottom: '14px', padding: '8px 12px', background: 'var(--error-coral-bg)', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}

            {/* Group Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="group-name">
                Group Name *
              </label>
              <input
                id="group-name"
                type="text"
                className="form-input"
                placeholder="e.g. Weekend Trip, Apartment 3B, Dinner Club"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="group-desc">
                Description (Optional)
              </label>
              <input
                id="group-desc"
                type="text"
                className="form-input"
                placeholder="What is this group for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Members List */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="form-label">
                <span>Group Members (Minimum 2) *</span>
                <button
                  type="button"
                  onClick={addMemberField}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                >
                  + Add Member
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {members.map((member, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Member ${index + 1} name`}
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                    />
                    {members.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeMemberField(index)}
                        className="btn btn-ghost"
                        style={{ padding: '8px', color: 'var(--text-muted)' }}
                        title="Remove member"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="form-hint">
                Add the people sharing expenses in this group.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
