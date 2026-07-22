import React from 'react';
import { LogIn, Download } from 'lucide-react';
import { User } from 'firebase/auth';

interface TopActionBarProps {
  activeTab: string;
  selectedConta: string | null;
  navigation: readonly { id: string; label: string }[];
  user: User | null;
  onSignIn: () => void;
  onExportCSV: () => void;
  onTabChange: (tabId: any) => void;
}

export function TopActionBar({
  activeTab,
  selectedConta,
  navigation,
  user,
  onSignIn,
  onExportCSV,
  onTabChange
}: TopActionBarProps) {
  return (
    <>
      {/* Top Action Bar (Desktop) */}
      <div className="hidden sm:flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-sm border-b border-slate-150 sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-slate-800">
          {activeTab === 'conta_detalhes' ? `Detalhes da Conta: ${selectedConta || ''}` : navigation.find(n => n.id === activeTab)?.label}
        </h2>
        
        <div className="flex items-center gap-3">
          {!user ? (
            <button
              onClick={onSignIn}
              className="px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Entrar com Google
            </button>
          ) : null}

          {activeTab !== 'relatorio' && activeTab !== 'conta_detalhes' && (
            <button
              onClick={onExportCSV}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
              title="Exportar aba ativa para planilha CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Exportar CSV
            </button>
          )}
          {activeTab === 'conta_detalhes' && (
            <button
              onClick={() => onTabChange('relatorio')}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              Voltar
            </button>
          )}
        </div>
      </div>

      {/* Action Bar (Mobile) */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 gap-2 overflow-x-auto">
        {!user ? (
          <button onClick={onSignIn} className="px-3 py-1.5 rounded-lg text-white bg-indigo-600 font-semibold text-xs whitespace-nowrap">
            Entrar
          </button>
        ) : null}
        {activeTab !== 'relatorio' && activeTab !== 'conta_detalhes' && (
          <button onClick={onExportCSV} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs whitespace-nowrap">
            Exportar
          </button>
        )}
        {activeTab === 'conta_detalhes' && (
          <button onClick={() => onTabChange('relatorio')} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs whitespace-nowrap">
            Voltar
          </button>
        )}
      </div>
    </>
  );
}
