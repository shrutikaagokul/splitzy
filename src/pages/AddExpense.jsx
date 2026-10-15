import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import MemberAvatar from '../components/MemberAvatar';
import { GroupLineIcon } from '../components/Icons';
import { rupeesToPaise, formatINR } from '../utils/currency';
import {
  distributeEqualSplit,
  validateCustomSplit,
} from '../utils/calculations';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Stay', 'Utilities', 'Other'];

export default function AddExpense() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialGroupId = searchParams.get('groupId') || '';

  const { groups, addExpense, currentUserId } = useApp();

  const [groupId, setGroupId] = useState(
    initialGroupId || (groups[0]?.id || '')
  );
  const [description, setDescription] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [splitType, setSplitType] = useState('EQUAL'); // EQUAL or CUSTOM

  // Selected participant member IDs for EQUAL split
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // Custom shares map: { [memberId]: rupeesString }
  const [customSharesInput, setCustomSharesInput] = useState({});

  const [errors, setErrors] = useState({});

  // Active group object
  const selectedGroup = groups.find((g) => g.id === groupId);

  // When group changes, update defaults
  useEffect(() => {
    if (selectedGroup && selectedGroup.members.length > 0) {
      // Default payer to current user if in group, else first member
      const userInGroup = selectedGroup.members.some((m) => m.id === currentUserId);
      setPaidBy(userInGroup ? currentUserId : selectedGroup.members[0]?.id || '');

      // By default, select all members as participants
      const allIds = selectedGroup.members.map((m) => m.id);
      setSelectedParticipants(allIds);

      // Initialize custom shares inputs
      const initialCustom = {};
      allIds.forEach((id) => {
        initialCustom[id] = '';
      });
      setCustomSharesInput(initialCustom);
    }
  }, [groupId, selectedGroup, currentUserId]);

  const totalPaise = rupeesToPaise(amountRupees);

  // Calculate live preview of equal split
  const calculatedEqualShares = React.useMemo(() => {
    if (splitType !== 'EQUAL' || totalPaise <= 0 || selectedParticipants.length === 0) {
      return [];
    }
    return distributeEqualSplit(totalPaise, selectedParticipants);
  }, [splitType, totalPaise, selectedParticipants]);

  // Convert custom shares inputs to paise array
  const calculatedCustomShares = React.useMemo(() => {
    if (splitType !== 'CUSTOM' || !selectedGroup) return [];
    return selectedGroup.members.map((m) => ({
      memberId: m.id,
      sharePaise: rupeesToPaise(customSharesInput[m.id] || 0),
    }));
  }, [splitType, selectedGroup, customSharesInput]);

  // Custom split validation result
  const customValidation = React.useMemo(() => {
    if (splitType !== 'CUSTOM') return { isValid: true };
    return validateCustomSplit(totalPaise, calculatedCustomShares);
  }, [splitType, totalPaise, calculatedCustomShares]);

  // Handle participant toggle in Equal Split
  const handleToggleParticipant = (memberId) => {
    if (selectedParticipants.includes(memberId)) {
      if (selectedParticipants.length <= 1) {
        setErrors((prev) => ({ ...prev, participants: 'At least one participant must share the expense.' }));
        return;
      }
      setSelectedParticipants(selectedParticipants.filter((id) => id !== memberId));
    } else {
      setSelectedParticipants([...selectedParticipants, memberId]);
    }
    setErrors((prev) => ({ ...prev, participants: null }));
  };

  // Handle custom share input change
  const handleCustomShareChange = (memberId, value) => {
    setCustomSharesInput((prev) => ({
      ...prev,
      [memberId]: value,
    }));
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!description.trim()) {
      newErrors.description = 'Please enter what this expense was for.';
    }

    if (!amountRupees || totalPaise <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0.';
    }

    if (!groupId) {
      newErrors.group = 'Please select a group.';
    }

    if (!paidBy) {
      newErrors.paidBy = 'Please select who paid for this expense.';
    }

    let finalParticipants = [];

    if (splitType === 'EQUAL') {
      if (selectedParticipants.length === 0) {
        newErrors.participants = 'Select at least one participant sharing this expense.';
      } else {
        finalParticipants = calculatedEqualShares;
      }
    } else {
      // CUSTOM split
      if (!customValidation.isValid) {
        newErrors.custom = customValidation.message;
      } else {
        // Include participants with > 0 share
        finalParticipants = calculatedCustomShares.filter((p) => p.sharePaise > 0);
        if (finalParticipants.length === 0) {
          newErrors.custom = 'At least one participant must have an assigned share.';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = addExpense({
      groupId,
      description,
      amountPaise: totalPaise,
      paidBy,
      category,
      date,
      splitType,
      participants: finalParticipants,
    });

    if (success) {
      navigate(groupId ? `/groups/${groupId}` : '/expenses');
    }
  };

  if (groups.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--petal-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GroupLineIcon size={28} color="var(--rosewood)" />
            </div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>No Groups Available</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            You need to create a group with members before adding expenses.
          </p>
          <Link to="/groups" className="btn btn-primary">
            Create a Group
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="form-card">
        <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '1.9rem', fontFamily: 'var(--font-serif)', color: 'var(--deep-plum)' }}>
            Add an Expense
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Split bill fairly with exact mathematical precision in paise.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Group Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-group">
              Select Group *
            </label>
            <select
              id="expense-group"
              className="form-select"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.members.length} members)
                </option>
              ))}
            </select>
            {errors.group && <div className="form-error">{errors.group}</div>}
          </div>

          {/* Description & Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="expense-desc">
                Description *
              </label>
              <input
                id="expense-desc"
                type="text"
                className="form-input"
                placeholder="e.g. Dinner, Villa Booking, Transit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expense-amount">
                Amount (₹) *
              </label>
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
              />
              {errors.amount && <div className="form-error">{errors.amount}</div>}
            </div>
          </div>

          {/* Paid By & Category & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="expense-payer">
                Paid By *
              </label>
              <select
                id="expense-payer"
                className="form-select"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              >
                {selectedGroup?.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === currentUserId ? '(You)' : ''}
                  </option>
                ))}
              </select>
              {errors.paidBy && <div className="form-error">{errors.paidBy}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expense-category">
                Category
              </label>
              <select
                id="expense-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expense-date">
                Date
              </label>
              <input
                id="expense-date"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Split Method Toggle */}
          <div style={{ marginTop: '16px', marginBottom: '8px' }}>
            <label className="form-label">
              <span>Split Method</span>
              <span className="badge badge-lilac" style={{ fontSize: '0.72rem' }}>
                Independent from payer
              </span>
            </label>

            <div className="form-split-toggle">
              <div
                className={`split-toggle-option ${splitType === 'EQUAL' ? 'active' : ''}`}
                onClick={() => setSplitType('EQUAL')}
              >
                Equal Split
              </div>
              <div
                className={`split-toggle-option ${splitType === 'CUSTOM' ? 'active' : ''}`}
                onClick={() => setSplitType('CUSTOM')}
              >
                Custom Split
              </div>
            </div>
          </div>

          {/* EQUAL SPLIT: Participants Checkboxes */}
          {splitType === 'EQUAL' && (
            <div className="form-group">
              <div className="form-label">
                <span>Who is sharing this expense?</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {selectedParticipants.length} selected
                </span>
              </div>

              <div className="participant-select-list">
                {selectedGroup?.members.map((member) => {
                  const isChecked = selectedParticipants.includes(member.id);
                  const isPayer = member.id === paidBy;
                  const assigned = calculatedEqualShares.find((p) => p.memberId === member.id);

                  return (
                    <div
                      key={member.id}
                      className={`participant-select-item ${isChecked ? 'selected' : ''}`}
                    >
                      <label className="participant-checkbox-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleParticipant(member.id)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--rosewood)', cursor: 'pointer' }}
                        />
                        <MemberAvatar name={member.name} color={member.avatarColor} size="sm" />
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--deep-plum)' }}>{member.name}</span>
                          {isPayer && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--rosewood)', marginLeft: '6px' }}>
                              (Paid ₹{amountRupees || '0'})
                            </span>
                          )}
                        </div>
                      </label>

                      {isChecked && totalPaise > 0 && assigned && (
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--rosewood)' }}>
                          {formatINR(assigned.sharePaise)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {errors.participants && <div className="form-error">{errors.participants}</div>}

              {totalPaise > 0 && selectedParticipants.length > 0 && (
                <div className="share-calc-preview">
                  <span>
                    Each person pays: <strong>{formatINR(calculatedEqualShares[0]?.sharePaise || 0)}</strong>
                    {totalPaise % selectedParticipants.length !== 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                        (leftover paise distributed deterministically)
                      </span>
                    )}
                  </span>
                  <span>Total: {formatINR(totalPaise)}</span>
                </div>
              )}
            </div>
          )}

          {/* CUSTOM SPLIT: Exact Share per Member */}
          {splitType === 'CUSTOM' && (
            <div className="form-group">
              <div className="form-label">
                <span>Enter custom amounts for each member (₹)</span>
                <span>Total: {formatINR(totalPaise)}</span>
              </div>

              <div className="participant-select-list">
                {selectedGroup?.members.map((member) => {
                  const isPayer = member.id === paidBy;

                  return (
                    <div key={member.id} className="participant-select-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MemberAvatar name={member.name} color={member.avatarColor} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--deep-plum)' }}>
                            {member.name} {isPayer && <span style={{ fontSize: '0.75rem', color: 'var(--rosewood)' }}>(Payer)</span>}
                          </div>
                        </div>
                      </div>

                      <div className="custom-share-input-wrap">
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="form-input"
                          style={{ padding: '6px 10px', textAlign: 'right' }}
                          value={customSharesInput[member.id] ?? ''}
                          onChange={(e) => handleCustomShareChange(member.id, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: customValidation.isValid ? 'var(--success-green-bg)' : 'var(--error-coral-bg)',
                  color: customValidation.isValid ? 'var(--success-green)' : 'var(--error-coral)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Allocated: {formatINR(customValidation.sumPaise || 0)} / {formatINR(totalPaise)}</span>
                <span>{customValidation.message}</span>
              </div>
              {errors.custom && <div className="form-error">{errors.custom}</div>}
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg">
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
