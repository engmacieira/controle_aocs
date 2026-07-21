/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  Clock,
  LogIn,
  LogOut,
  LayoutDashboard,
  Database,
  ShoppingCart,
  FileCheck,
  Landmark,
  Menu,
  X,
  Receipt
} from 'lucide-react';

import { 
  AocsRecord, 
  CiRecord 
} from './types';

import { AocsTable } from './components/AocsTable';
import { PedidosTable } from './components/PedidosTable';
import { FaturamentoTable } from './components/FaturamentoTable';
import { CiTable } from './components/CiTable';
import { ContasRelatorio } from './components/ContasRelatorio';
import { EspelhoBancario } from './components/EspelhoBancario';
import { ContaDetalhes } from './components/ContaDetalhes';
import { FormModal } from './components/FormModal';
import { ConfirmModal } from './components/ConfirmModal';
import { useFirebaseData } from './hooks/useFirebaseData';

export default function App() {
  const {
    user,
    loading,
    signIn,
    logOut,
    aocsRecords,
    ciRecords,
    extratoRecords,
    contasRecords,
    saveRecord,
    deleteRecord,
    deleteRecords
  } = useFirebaseData();

  // --- Toast Notification State ---
  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };


  // --- Active Tab State ---
  const [activeTab, setActiveTab] = React.useState<'relatorio' | 'aocs' | 'pedidos' | 'faturamento' | 'ci' | 'espelho' | 'conta_detalhes'>('relatorio');
  const [selectedConta, setSelectedConta] = React.useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // --- Modal Control State ---
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [itemToEdit, setItemToEdit] = React.useState<any | null>(null);

  // --- Confirm Modal State ---
  const [confirmConfig, setConfirmConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // --- Global Action Handlers ---

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = `planilha_${activeTab}.csv`;

    if (activeTab === 'aocs') {
      headers = ['AOCS', 'Data AOCS', 'Resumo Contratação', 'Fornecedor', 'Contrato / ARP', 'Processo Licitatório', 'Valor'];
      rows = aocsRecords.map(r => [r.aocs, r.dataAocs, r.resumo, r.empresa, r.contratoArp, r.processo, r.valor]);
    } else if (activeTab === 'pedidos') {
      headers = ['AOCS', 'Fornecedor', 'Ordem de Compra', 'Data Envio', 'Empenho', 'Dotação', 'Fonte', 'Conta Bancaria'];
      rows = aocsRecords.map(r => [r.aocs, r.empresa, r.ordemCompra, r.dataEnvio, r.empenho, r.dotacao, r.fonte, r.contaBancaria]);
    } else if (activeTab === 'faturamento') {
      headers = ['AOCS', 'Fornecedor', 'Valor', 'Nota Fiscal', 'Data NF', 'Número CI'];
      rows = aocsRecords.map(r => [r.aocs, r.empresa, r.valor, r.notaFiscal, r.dataNF, r.numeroCI]);
    } else if (activeTab === 'ci') {
      headers = ['CI', 'Data CI', 'AOCS', 'Ordem de Compra', 'Empenho', 'Empresa', 'Resumo', 'Valor', 'Nota Fiscal', 'Dotação', 'Fonte', 'Conta Bancaria', 'Data Pagamento', 'Valor Pago', 'Chave de Acesso NF', 'Conferencia Extrato'];
      rows = ciRecords.map(r => [r.ci, r.dataCI, r.aocs, r.ordemCompra, r.empenho, r.empresa, r.resumo, r.valor, r.notaFiscal, r.dotacao, r.fonte, r.contaBancaria, r.dataPagamento, r.valorPago, r.chaveAcessoNF, r.conferenciaExtrato]);
    } else {
      alert('Relatórios consolidados não podem ser exportados individualmente via CSV simples.');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map((val: any) => {
          const s = (val === undefined || val === null) ? '' : val.toString();
          if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        }).join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CRUD Save Handler per Tab ---
  const handleSave = async (item: any) => {
    const colName = activeTab === 'ci' ? 'ci' : 'aocs';
    await saveRecord(colName, item);
    showToast('Registro salvo com sucesso!', 'success');
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  // --- CRUD Delete Handler per Tab ---
  const handleDelete = (id: string, refName: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Registro',
      message: `Tem certeza de que deseja excluir o registro "${refName}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        const colName = activeTab === 'ci' ? 'ci' : 'aocs';
        await deleteRecord(colName, id);
        showToast(`Registro "${refName}" excluído com sucesso!`, 'success');
      }
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Registros',
      message: `Tem certeza de que deseja excluir os ${ids.length} registros selecionados? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        const colName = activeTab === 'ci' ? 'ci' : 'aocs';
        await deleteRecords(colName, ids);
        showToast(`${ids.length} registros excluídos com sucesso!`, 'success');
      }
    });
  };

  const handleEditClick = (item: any) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab !== 'conta_detalhes') setSelectedConta(null);
    setMobileMenuOpen(false);
  };

  const handleViewContaDetails = (conta: string) => {
    setSelectedConta(conta);
    setActiveTab('conta_detalhes');
  };

  const navigation = [
    { id: 'relatorio', label: 'Contas Relatório', icon: LayoutDashboard },
    { id: 'espelho', label: 'Espelho Bancário', icon: Landmark },
    { id: 'aocs', label: 'AOCS (Contratação)', icon: FileCheck },
    { id: 'pedidos', label: 'Pedidos de Compra', icon: ShoppingCart },
    { id: 'faturamento', label: 'Faturamento AOCS', icon: Receipt },
    { id: 'ci', label: 'Financeiro CI', icon: Landmark },
  ] as const;

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      
      {/* Sidebar for Desktop */}
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
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
                onClick={logOut}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        {/* Mobile Header */}
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

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="sm:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute right-0 top-[61px] bottom-0 w-64 bg-white border-l border-slate-200 flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
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
                      onClick={logOut}
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

        {/* Top Action Bar (Desktop) */}
        <div className="hidden sm:flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-sm border-b border-slate-150 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {activeTab === 'conta_detalhes' ? `Detalhes da Conta: ${selectedConta || ''}` : navigation.find(n => n.id === activeTab)?.label}
          </h2>
          
          <div className="flex items-center gap-3">
            {!user ? (
              <button
                onClick={signIn}
                className="px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Entrar com Google
              </button>
            ) : null}

            {activeTab !== 'relatorio' && activeTab !== 'conta_detalhes' && (
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
                title="Exportar aba ativa para planilha CSV"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Exportar CSV
              </button>
            )}
            {activeTab === 'conta_detalhes' && (
              <button
                onClick={() => handleTabChange('relatorio')}
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
            <button onClick={signIn} className="px-3 py-1.5 rounded-lg text-white bg-indigo-600 font-semibold text-xs whitespace-nowrap">
              Entrar
            </button>
          ) : null}
          {activeTab !== 'relatorio' && activeTab !== 'conta_detalhes' && (
            <button onClick={handleExportCSV} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs whitespace-nowrap">
              Exportar
            </button>
          )}
          {activeTab === 'conta_detalhes' && (
            <button onClick={() => handleTabChange('relatorio')} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs whitespace-nowrap">
              Voltar
            </button>
          )}
        </div>

        <main className="flex-1 p-4 sm:p-8 space-y-6">
          
          {/* Tab Content Renderer */}
          <div id="tab-content">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Carregando dados...</p>
              </div>
            ) : !user ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-2xl shadow-sm max-w-md mx-auto">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
                  <LogIn className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Faça Login para Acessar</h2>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                  Este sincronizador financeiro utiliza banco de dados na nuvem para manter suas informações seguras e atualizadas.
                </p>
                <button
                  onClick={signIn}
                  className="px-6 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-bold text-sm transition-all shadow-md shadow-indigo-200"
                >
                  Entrar com Conta Google
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'aocs' && (
                  <AocsTable
                    records={aocsRecords}
                    onEdit={handleEditClick}
                    onDelete={(id, num) => handleDelete(id, `AOCS #${num}`)}
                    onBulkDelete={handleBulkDelete}
                    onAdd={handleAddClick}
                  />
                )}

                {activeTab === 'pedidos' && (
                  <PedidosTable
                    records={aocsRecords}
                    onEdit={handleEditClick}
                    onAdd={handleAddClick}
                  />
                )}

                {activeTab === 'faturamento' && (
                  <FaturamentoTable
                    records={aocsRecords}
                    onEdit={handleEditClick}
                    onAdd={handleAddClick}
                  />
                )}

                {activeTab === 'ci' && (
                  <CiTable
                    records={ciRecords}
                    contasRecords={contasRecords}
                    onEdit={handleEditClick}
                    onDelete={(id, ciNum) => handleDelete(id, `CI #${ciNum}`)}
                    onBulkDelete={handleBulkDelete}
                    onAdd={handleAddClick}
                  />
                )}

                {activeTab === 'relatorio' && (
                  <ContasRelatorio
                    aocsRecords={aocsRecords}
                    ciRecords={ciRecords}
                    onViewDetails={handleViewContaDetails}
                  />
                )}

                {activeTab === 'conta_detalhes' && selectedConta && (
                  <ContaDetalhes
                    conta={selectedConta}
                    aocsRecords={aocsRecords}
                    ciRecords={ciRecords}
                  />
                )}

                {activeTab === 'espelho' && (
                  <EspelhoBancario 
                    extratoRecords={extratoRecords}
                    ciRecords={ciRecords}
                    contasRecords={contasRecords}
                    onSave={saveRecord}
                    onDelete={deleteRecord}
                    showToast={showToast}
                  />
                )}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Persistent Global Form Dialog Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setItemToEdit(null);
        }}
        activeTab={activeTab}
        itemToEdit={itemToEdit}
        onSave={handleSave}
        aocsRecords={aocsRecords}
        ciRecords={ciRecords}
        contasRecords={contasRecords}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300 min-w-72 max-w-sm ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-150'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-150'
                : 'bg-indigo-50 text-indigo-800 border-indigo-150'
            }`}
          >
            {toast.type === 'success' && (
              <span className="text-emerald-500 font-bold" aria-hidden="true">✓</span>
            )}
            {toast.type === 'error' && (
              <span className="text-rose-500 font-bold" aria-hidden="true">✗</span>
            )}
            {toast.type === 'info' && (
              <span className="text-indigo-500 font-bold" aria-hidden="true">ℹ</span>
            )}
            <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-auto text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-hidden text-base leading-none font-bold"
              aria-label="Fechar notificação"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
