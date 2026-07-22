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
      <header className="sm:hidden sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h1 className="text-sm font-bold text-slate-950 tracking-tight">Sincronizador</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-[61px] bottom-0 w-64 bg-white border-l border-slate-200 flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              ))}
            </nav>
            {user && (
              <div className="p-4 border-t border-slate-100">
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-slate-500 truncate px-2">{user.email}</span>
                  <button
                    onClick={onLogOut}
                    className="w-full px-4 py-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
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
