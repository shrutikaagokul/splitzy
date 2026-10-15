/**
 * Splitzy LocalStorage Management
 * Handles persistent browser-side storage with safe versioned migration,
 * zero preloaded sample data, and strict persistence of user-created entries.
 */

const STORAGE_KEYS = {
  GROUPS: 'splitzy_groups_v2',
  EXPENSES: 'splitzy_expenses_v2',
  SETTLEMENTS: 'splitzy_settlements_v2',
  CURRENT_USER_ID: 'splitzy_current_user_v2',
  MIGRATION_FLAG: 'splitzy_v2_clean_init_done',
};

// Safe JSON parser
function safeParse(item, fallback = []) {
  if (!item) return fallback;
  try {
    const parsed = JSON.parse(item);
    return parsed ?? fallback;
  } catch (err) {
    console.error('Splitzy Storage Error: Failed to parse item', err);
    return fallback;
  }
}

/**
 * One-time versioned migration and clean initialization:
 * Purges legacy demo data (v1) and initializes clean empty state (v2).
 * Runs exactly once via the migration flag so user-created data is preserved on subsequent visits.
 */
export function initializeStorage() {
  try {
    const isMigrated = localStorage.getItem(STORAGE_KEYS.MIGRATION_FLAG);

    if (isMigrated !== 'true') {
      // Remove legacy demo keys from LocalStorage
      const legacyKeys = [
        'splitzy_groups_v1',
        'splitzy_expenses_v1',
        'splitzy_settlements_v1',
        'splitzy_current_user_v1',
      ];
      legacyKeys.forEach((key) => localStorage.removeItem(key));

      // Initialize clean empty state if not already set
      if (localStorage.getItem(STORAGE_KEYS.GROUPS) === null) {
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify([]));
      }
      if (localStorage.getItem(STORAGE_KEYS.EXPENSES) === null) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
      }
      if (localStorage.getItem(STORAGE_KEYS.SETTLEMENTS) === null) {
        localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify([]));
      }
      if (localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) === null) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, '');
      }

      // Mark migration complete
      localStorage.setItem(STORAGE_KEYS.MIGRATION_FLAG, 'true');
    }
  } catch (err) {
    console.error('Failed to initialize storage', err);
  }
}

// Load Groups (returns empty array if none exist)
export function loadGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!raw) return [];
    const parsed = safeParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading groups from LocalStorage', err);
    return [];
  }
}

// Save Groups
export function saveGroups(groups) {
  try {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups || []));
  } catch (err) {
    console.error('Error saving groups to LocalStorage', err);
  }
}

// Load Expenses (returns empty array if none exist)
export function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) return [];
    const parsed = safeParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading expenses from LocalStorage', err);
    return [];
  }
}

// Save Expenses
export function saveExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses || []));
  } catch (err) {
    console.error('Error saving expenses to LocalStorage', err);
  }
}

// Load Settlements (returns empty array if none exist)
export function loadSettlements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    if (!raw) return [];
    const parsed = safeParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading settlements from LocalStorage', err);
    return [];
  }
}

// Save Settlements
export function saveSettlements(settlements) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements || []));
  } catch (err) {
    console.error('Error saving settlements to LocalStorage', err);
  }
}

// Load Current User ID
export function loadCurrentUserId() {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || '';
  } catch {
    return '';
  }
}

// Save Current User ID
export function saveCurrentUserId(id) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id || '');
  } catch (err) {
    console.error('Error saving current user ID', err);
  }
}

// Clear all data (Clean slate)
export function clearAllStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, '');
  } catch (err) {
    console.error('Error clearing storage', err);
  }
}
