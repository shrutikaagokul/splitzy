import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import CreateGroupModal from './components/CreateGroupModal';
import ConfirmationModal from './components/ConfirmationModal';

// Pages
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import AddExpense from './pages/AddExpense';
import Expenses from './pages/Expenses';
import Settlements from './pages/Settlements';

function AppLayout() {
  const location = useLocation();
  const { clearData } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // Compute page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/groups') return 'My Groups';
    if (path.startsWith('/groups/')) return 'Group Overview';
    if (path === '/add-expense') return 'Add Expense';
    if (path === '/expenses') return 'Expense History';
    if (path === '/settlements') return 'Settlements';
    return 'Splitzy';
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onCreateGroupClick={() => setCreateGroupModalOpen(true)}
        onClearDataClick={() => setClearConfirmOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          pageTitle={getPageTitle()}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="page-content">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  onCreateGroupClick={() => setCreateGroupModalOpen(true)}
                />
              }
            />
            <Route
              path="/groups"
              element={
                <Groups
                  onCreateGroupClick={() => setCreateGroupModalOpen(true)}
                />
              }
            />
            <Route path="/groups/:id" element={<GroupDetails />} />
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/settlements" element={<Settlements />} />
            {/* Catch-all fallback */}
            <Route
              path="*"
              element={
                <Dashboard
                  onCreateGroupClick={() => setCreateGroupModalOpen(true)}
                />
              }
            />
          </Routes>
        </main>
      </div>

      {/* Modals & Feedback Notifications */}
      <CreateGroupModal
        isOpen={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={clearConfirmOpen}
        title="Clear All Local Data?"
        message="Are you sure you want to clear all groups, expenses, and settlements stored in this browser? This will return the application to a clean initial state."
        confirmText="Clear All Data"
        confirmVariant="danger"
        onConfirm={() => {
          clearData();
          setClearConfirmOpen(false);
        }}
        onCancel={() => setClearConfirmOpen(false)}
      />

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </Router>
  );
}
