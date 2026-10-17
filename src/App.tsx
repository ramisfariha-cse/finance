/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { GoalsView } from './components/goals/GoalsView';
import { AssistantView } from './components/assistant/AssistantView';
import { SettingsView } from './components/settings/SettingsView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { WealthCanvas } from './components/three/WealthCanvas';
import { Transaction } from './types/finance';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<Transaction | null>(null);
  const [is3DActive, setIs3DActive] = useState(false);

  const handleEditTransaction = (tx: Transaction) => {
    setSelectedTxForEdit(tx);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setSelectedTxForEdit(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-white relative">
      {/* Three.js Ambient Animation Style Background & Full-Bleed 3D Vault */}
      <WealthCanvas
        isFullBleed={is3DActive}
        onToggleFullBleed={() => setIs3DActive(false)}
        ambientOpacity={0.22}
      />

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setSelectedTxForEdit(null);
          setIsAddModalOpen(true);
        }}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        onOpen3D={() => setIs3DActive(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all pb-20 md:pb-8 relative z-10">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddModal={() => {
            setSelectedTxForEdit(null);
            setIsAddModalOpen(true);
          }}
          onToggle3D={() => setIs3DActive(!is3DActive)}
          is3DActive={is3DActive}
        />

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenAddModal={() => {
                setSelectedTxForEdit(null);
                setIsAddModalOpen(true);
              }}
              onSelectTransaction={handleEditTransaction}
            />
          )}

          {activeTab === 'transactions' && <TransactionsView />}

          {activeTab === 'budgets' && <BudgetsView />}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'goals' && <GoalsView />}

          {activeTab === 'assistant' && <AssistantView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setSelectedTxForEdit(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editTransaction={selectedTxForEdit}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
