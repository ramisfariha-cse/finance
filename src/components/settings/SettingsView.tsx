import React, { useState, useRef } from 'react';
import {
  Settings,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Coins,
  User,
  Sliders,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SUPPORTED_CURRENCIES, formatCurrency } from '../../data/currencies';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    transactions,
    budgets,
    goals,
    resetToDemoData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [currency, setCurrency] = useState(profile.currency);
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(
    profile.monthlyIncomeTarget.toString()
  );
  const [aiConsentGiven, setAiConsentGiven] = useState(profile.aiConsentGiven);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Clear Confirmation Modal State
  const [showClearModal, setShowClearModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      currency,
      monthlyIncomeTarget: parseFloat(monthlyIncomeTarget) || 5000,
      aiConsentGiven,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const data = exportDataJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clearspend_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importDataJSON(text);
      if (success) {
        setImportStatus('Backup data restored successfully!');
      } else {
        setImportStatus('Failed to restore backup file. Invalid JSON format.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xs">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            ClearSpend Application Preferences
          </h2>
          <p className="text-xs text-slate-500">
            Configure currency localization, privacy toggles, and data safeguards
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Preferences saved successfully.</span>
        </div>
      )}

      {importStatus && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2">
          <span>{importStatus}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Profile & Account</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Personalize your account display and income target
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Configuration */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Currency & Regional Localization</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Choose your reporting currency. All balances, charts, and AI outputs dynamically adapt.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-emerald-500"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name} — {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Target Income ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={monthlyIncomeTarget}
                onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* AI & Privacy Controls */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Privacy & AI Consent</span>
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Control whether sanitized transaction attributes can be analyzed by Gemini 3.8 Flash for spending recommendations.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-800">
                Enable Evidence-Based AI Financial Audits
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                When disabled, ClearSpend operates completely offline with local mathematical heuristics only.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAiConsentGiven(!aiConsentGiven)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                aiConsentGiven ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  aiConsentGiven ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Data Management Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
          <Sliders className="w-4 h-4 text-slate-700" />
          <span>Data Governance & Backups</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Export your entire encrypted ledger, restore from JSON backup, or reset to realistic demo data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Full Backup (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Download {transactions.length} txs, {budgets.length} budgets, {goals.length} goals
              </p>
            </div>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Restore Backup (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Restore state from a previously exported backup file
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={resetToDemoData}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Reset Realistic Demo Dataset</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Populates 25+ realistic transactions across October & September
              </p>
            </div>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={() => setShowClearModal(true)}
            className="flex items-center justify-between p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-colors text-left cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Wipe All Data & Start Empty</span>
              </div>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Permanently purge all records and start with blank ledgers
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 font-bold text-base mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              Wipe All Data?
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              This action will permanently delete all {transactions.length} transactions, category budgets, and savings goals from your browser storage. You can restore from a JSON backup later.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllData();
                  setShowClearModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm"
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
