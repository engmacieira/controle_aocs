import React from 'react';
import { FileSpreadsheet, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  navigation: readonly NavigationItem[];
  activeTab: string;
  onTabChange: (tabId: any) => void;
  user: User | null;
  onLogOut: () => void;
}

export function Sidebar({ navigation, activeTab, onTabChange, user, onLogOut }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden sm:flex flex-col sticky top-0 h-screen shrink-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shrink-0">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-950 tracking-tight leading-tight">Sincronizador<br/>Financeiro</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
            {item.label}
          </button>
        ))}
      </nav>

      {user && (
        <div className="p-4 border-t border-slate-100">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-500 truncate px-2">{user.email}</span>
            <button
              onClick={onLogOut}
              className="w-full px-3 py-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
