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
      <div className="hidden sm:flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-10">
        <h2 className="text-xl font-bold text-slate-900">
          {activeTab === 'conta_detalhes' ? `Detalhes da Conta: ${selectedConta || ''}` : navigation.find(n => n.id === activeTab)?.label}
        </h2>
        
        <div className="flex items-center gap-4">
          {!user ? (
            <button
              onClick={onSignIn}
              className="px-5 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <LogIn className="w-4.5 h-4.5" />
              Entrar com Google
            </button>
          ) : null}

          {activeTab !== 'relatorio' && activeTab !== 'conta_detalhes' && (
            <button
              onClick={onExportCSV}
              className="px-4 py-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-sm"
              title="Exportar aba ativa para planilha CSV"
            >
              <Download className="w-4.5 h-4.5 text-slate-500" />
              Exportar CSV
            </button>
          )}
          {activeTab === 'conta_detalhes' && (
            <button
              onClick={() => onTabChange('relatorio')}
              className="px-4 py-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              Voltar
            </button>
          )}
        </div>
      </div>

      {/* Action Bar (Mobile) */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 gap-2 overflow-x-auto shadow-sm">
        {!user ? (
          <button onClick={onSignIn} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs whitespace-nowrap transition-colors">
            Entrar
          </button>
        ) : null}
        {activeTab !== 'relatorio' && activeTab !== 'conta_detalhes' && (
          <button onClick={onExportCSV} className="px-4 py-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs whitespace-nowrap transition-colors shadow-sm">
            Exportar
          </button>
        )}
        {activeTab === 'conta_detalhes' && (
          <button onClick={() => onTabChange('relatorio')} className="px-4 py-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs whitespace-nowrap transition-colors shadow-sm">
            Voltar
          </button>
        )}
      </div>
    </>
  );
}
