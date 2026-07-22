import React from 'react';
import { FileSpreadsheet, Menu, X, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface MobileHeaderProps {
  navigation: readonly NavigationItem[];
  activeTab: string;
  onTabChange: (tabId: any) => void;
  user: User | null;
  onLogOut: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function MobileHeader({
  navigation,
  activeTab,
  onTabChange,
  user,
  onLogOut,
  mobileMenuOpen,
  setMobileMenuOpen
}: MobileHeaderProps) {
  return (
    <>
      <header className="sm:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-xs px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">Sincronizador</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-[61px] bottom-0 w-64 bg-white border-l border-slate-200/80 flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`group relative w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r-full" />
                    )}
                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            {user && (
              <div className="p-4 border-t border-slate-100">
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-slate-500 font-medium truncate px-2">{user.email}</span>
                  <button
                    onClick={onLogOut}
                    className="w-full px-4 py-2.5 rounded-xl text-slate-600 bg-slate-50 border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
