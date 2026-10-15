import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ExpenseDetailModal from '../components/ExpenseDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import { CategoryIcon, ReceiptIcon, SearchEmptyIcon } from '../components/Icons';
import { formatINR } from '../utils/currency';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['All', 'Food', 'Travel', 'Shopping', 'Stay', 'Utilities', 'Other'];

export default function Expenses() {
  const { expenses, groups, allMembers, deleteExpense } = useApp();

  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('DATE_DESC');

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Filter & sort expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Search description or group name
        if (search.trim()) {
          const query = search.toLowerCase();
          const matchDesc = exp.description.toLowerCase().includes(query);
          const grp = groups.find((g) => g.id === exp.groupId);
          const matchGroup = grp?.name.toLowerCase().includes(query);
          if (!matchDesc && !matchGroup) return false;
        }

        // Group filter
        if (selectedGroup !== 'ALL' && exp.groupId !== selectedGroup) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && exp.category !== selectedCategory) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'DATE_DESC') {
          return new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt;
        }
        if (sortBy === 'DATE_ASC') {
          return new Date(a.date) - new Date(b.date) || a.createdAt - b.createdAt;
        }
        if (sortBy === 'AMOUNT_DESC') {
          return b.amountPaise - a.amountPaise;
        }
        if (sortBy === 'AMOUNT_ASC') {
          return a.amountPaise - b.amountPaise;
        }
        return 0;
      });
  }, [expenses, groups, search, selectedGroup, selectedCategory, sortBy]);

  const hasActiveFilters = search.trim() !== '' || selectedGroup !== 'ALL' || selectedCategory !== 'All';

  const clearFilters = () => {
    setSearch('');
    setSelectedGroup('ALL');
    setSelectedCategory('All');
    setSortBy('DATE_DESC');
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--deep-plum)' }}>
            Expense History
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Complete audit trail of all group expenses and shared splits.
          </p>
        </div>

        <Link to="/add-expense" className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Expense
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="expenses-filters-bar">
        {/* Search */}
        <div className="search-input-wrap">
          <svg className="search-icon-inside" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="form-input"
            placeholder="Search description or group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Group Filter Dropdown */}
        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            aria-label="Filter by group"
          >
            <option value="ALL">All Groups ({groups.length})</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div style={{ minWidth: '170px' }}>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort expenses"
          >
            <option value="DATE_DESC">Newest Date First</option>
            <option value="DATE_ASC">Oldest Date First</option>
            <option value="AMOUNT_DESC">Highest Amount</option>
            <option value="AMOUNT_ASC">Lowest Amount</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn btn-outline btn-sm">
            Clear Filters
          </button>
        )}
      </div>

      {/* Category Chips */}
      <div className="category-filter-chips">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Results List */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? <SearchEmptyIcon size={32} color="var(--rosewood)" /> : <ReceiptIcon size={32} color="var(--rosewood)" />}
          title={hasActiveFilters ? 'No matching expenses' : 'No transactions yet.'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search criteria or clearing filters.'
              : 'Add your first group expense to see it here.'
          }
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add Expense'}
          onActionClick={hasActiveFilters ? clearFilters : undefined}
          actionLink={!hasActiveFilters ? '/add-expense' : undefined}
        />
      ) : (
        <div>
          {filteredExpenses.map((exp) => {
            const group = groups.find((g) => g.id === exp.groupId);
            const payer = allMembers.find((m) => m.id === exp.paidBy) || { name: 'Member' };

            return (
              <div
                key={exp.id}
                className="expense-item"
                style={{ justifyContent: 'space-between' }}
              >
                <div
                  onClick={() => setSelectedExpense(exp)}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, cursor: 'pointer' }}
                  title="Click to view full split breakdown"
                >
                  <div className="expense-category-icon" style={{ backgroundColor: 'var(--soft-lilac)', color: 'var(--rosewood)' }}>
                    <CategoryIcon category={exp.category} size={20} color="var(--rosewood)" />
                  </div>
                  <div>
                    <div className="expense-title">{exp.description}</div>
                    <div className="expense-meta">
                      <span className="badge badge-lilac" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        {group?.name || 'Group'}
                      </span>
                      <span>{exp.category}</span>
                      <span>•</span>
                      <span>{exp.date}</span>
                      <span>•</span>
                      <span>{exp.splitType === 'EQUAL' ? 'Equal Split' : 'Custom Split'}</span>
                      <span>•</span>
                      <span>{exp.participants?.length || 0} sharing</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="expense-amount-wrap">
                    <div className="expense-amount-val">{formatINR(exp.amountPaise)}</div>
                    <div className="expense-paid-by">Paid by {payer.name}</div>
                  </div>

                  <button
                    onClick={() => setExpenseToDelete(exp)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '6px', color: 'var(--text-muted)' }}
                    title="Delete expense"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
      />

      {/* Delete Expense Modal */}
      <ConfirmationModal
        isOpen={Boolean(expenseToDelete)}
        title="Delete Expense?"
        message={`Are you sure you want to delete "${expenseToDelete?.description || 'this expense'}" of ${formatINR(expenseToDelete?.amountPaise || 0)}? This will update group balances.`}
        confirmText="Delete Expense"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
}
