/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
  Receipt,
  FolderOpen,
  History
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
import { RegistroAtividades } from './components/RegistroAtividades';
import { ProjecaoSaldo } from './components/ProjecaoSaldo';
import { AuditLogs } from './components/AuditLogs';
import { Administracao } from './components/Administracao';

import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { TopActionBar } from './components/TopActionBar';
import { ToastContainer } from './components/ToastContainer';

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
    registroAtividadesRecords,
    lancamentosFuturosRecords,
    auditLogs,
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


  // --- Routing State ---
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'relatorio';
    if (path === '/espelho') return 'espelho';
    if (path === '/projecao-saldo') return 'projecao_saldo';
    if (path === '/aocs') return 'aocs';
    if (path === '/pedidos') return 'pedidos';
    if (path === '/faturamento') return 'faturamento';
    if (path === '/ci') return 'ci';
    if (path === '/registro-atividades') return 'registro_atividades';
    if (path === '/conta-detalhes') return 'conta_detalhes';
    if (path === '/administracao') return 'administracao';
    return 'relatorio';
  };

  const activeTab = getActiveTab();

  const [selectedConta, setSelectedConta] = React.useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // --- Modal Control State ---
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [itemToEdit, setItemToEdit] = React.useState<any | null>(null);
  const [modalOverrideTab, setModalOverrideTab] = React.useState<string | null>(null);

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

  const handleEditClick = (item: any, overrideTab?: string) => {
    setItemToEdit(item);
    if (overrideTab) {
      setModalOverrideTab(overrideTab);
    } else {
      setModalOverrideTab(null);
    }
    setIsModalOpen(true);
  };

  const handleAddClick = (overrideTab?: string) => {
    setItemToEdit(null);
    if (overrideTab) {
      setModalOverrideTab(overrideTab);
    } else {
      setModalOverrideTab(null);
    }
    setIsModalOpen(true);
  };

  const handleTabChange = (tab: 'relatorio' | 'aocs' | 'pedidos' | 'faturamento' | 'ci' | 'espelho' | 'projecao_saldo' | 'conta_detalhes' | 'registro_atividades' | 'administracao') => {
    const pathToTab: Record<string, string> = {
      relatorio: '/',
      espelho: '/espelho',
      projecao_saldo: '/projecao-saldo',
      aocs: '/aocs',
      pedidos: '/pedidos',
      faturamento: '/faturamento',
      ci: '/ci',
      registro_atividades: '/registro-atividades',
      conta_detalhes: '/conta-detalhes',
      administracao: '/administracao'
    };
    navigate(pathToTab[tab] || '/');
    if (tab !== 'conta_detalhes') setSelectedConta(null);
    setMobileMenuOpen(false);
  };


  // --- Atividades Actions Handlers ---
  const handleSaveAtividade = async (item: any) => {
    await saveRecord('registro_atividades', item);
    showToast('Registro de atividade gravado com sucesso!', 'success');
  };

  const handleDeleteAtividade = (id: string, title: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Atividade',
      message: `Tem certeza de que deseja excluir o registro de atividade "\${title}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        await deleteRecord('registro_atividades', id);
        showToast(`Atividade "\${title}" excluída com sucesso!`, 'success');
      }
    });
  };

  const handleViewContaDetails = (conta: string) => {
    setSelectedConta(conta);
    navigate('/conta-detalhes');
  };

  const navigation = [
    { id: 'relatorio', label: 'Contas Relatório', icon: LayoutDashboard },
    { id: 'espelho', label: 'Espelho Bancário', icon: Landmark },
    { id: 'projecao_saldo', label: 'Projeção de Saldo', icon: Sparkles },
    { id: 'aocs', label: 'AOCS (Contratação)', icon: FileCheck },
    { id: 'pedidos', label: 'Pedidos de Compra', icon: ShoppingCart },
    { id: 'faturamento', label: 'Faturamento AOCS', icon: Receipt },
    { id: 'ci', label: 'Financeiro CI', icon: Landmark },
    { id: 'registro_atividades', label: 'Comprovação de Atividades', icon: FolderOpen },
  ] as const;

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      
      <Sidebar 
        navigation={navigation}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        onLogOut={logOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        <MobileHeader 
          navigation={navigation}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
          onLogOut={logOut}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <TopActionBar 
          activeTab={activeTab}
          selectedConta={selectedConta}
          navigation={navigation}
          user={user}
          onSignIn={signIn}
          onExportCSV={handleExportCSV}
          onTabChange={handleTabChange}
        />

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
                <Routes>
                  <Route path="/aocs" element={
                    <AocsTable
                      records={aocsRecords}
                      onEdit={handleEditClick}
                      onDelete={(id, num) => handleDelete(id, `AOCS #${num}`)}
                      onBulkDelete={handleBulkDelete}
                      onAdd={handleAddClick}
                    />
                  } />

                  <Route path="/pedidos" element={
                    <PedidosTable
                      records={aocsRecords}
                      onEdit={handleEditClick}
                      onAdd={handleAddClick}
                    />
                  } />

                  <Route path="/faturamento" element={
                    <FaturamentoTable
                      records={aocsRecords}
                      onEdit={handleEditClick}
                      onAdd={handleAddClick}
                    />
                  } />

                  <Route path="/ci" element={
                    <CiTable
                      records={ciRecords}
                      contasRecords={contasRecords}
                      onEdit={handleEditClick}
                      onDelete={(id, ciNum) => handleDelete(id, `CI #${ciNum}`)}
                      onBulkDelete={handleBulkDelete}
                      onAdd={handleAddClick}
                    />
                  } />

                  <Route path="/" element={
                    <ContasRelatorio
                      aocsRecords={aocsRecords}
                      ciRecords={ciRecords}
                      onViewDetails={handleViewContaDetails}
                    />
                  } />

                  <Route path="/conta-detalhes" element={
                    selectedConta ? (
                      <ContaDetalhes
                        conta={selectedConta}
                        aocsRecords={aocsRecords}
                        ciRecords={ciRecords}
                      />
                    ) : <Navigate to="/" replace />
                  } />

                  <Route path="/registro-atividades" element={
                    <RegistroAtividades
                      records={registroAtividadesRecords}
                      aocsRecords={aocsRecords}
                      ciRecords={ciRecords}
                      userEmail={user ? user.email : null}
                      onSave={handleSaveAtividade}
                      onDelete={handleDeleteAtividade}
                    />
                  } />

                  <Route path="/espelho" element={
                    <EspelhoBancario 
                      extratoRecords={extratoRecords}
                      ciRecords={ciRecords}
                      contasRecords={contasRecords}
                      onSave={saveRecord}
                      onDelete={deleteRecord}
                      showToast={showToast}
                      onEditCI={(ci) => handleEditClick(ci, 'ci')}
                    />
                  } />
                  
                  <Route path="/projecao-saldo" element={
                    <ProjecaoSaldo
                      aocsRecords={aocsRecords}
                      ciRecords={ciRecords}
                      contasRecords={contasRecords}
                      extratoRecords={extratoRecords}
                      lancamentosFuturosRecords={lancamentosFuturosRecords}
                      onSaveLancamento={saveRecord}
                      onDeleteLancamento={deleteRecord}
                      showToast={showToast}
                    />
                  } />
                  
                  <Route path="/administracao" element={
                    <Administracao 
                      logs={auditLogs}
                      dbData={{
                        aocs: aocsRecords,
                        ci: ciRecords,
                        extrato: extratoRecords,
                        contas: contasRecords,
                        registro_atividades: registroAtividadesRecords,
                        lancamentos_futuros: lancamentosFuturosRecords
                      }}
                    />
                  } />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
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
          setModalOverrideTab(null);
        }}
        activeTab={modalOverrideTab || activeTab}
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

      <ToastContainer 
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

    </div>
  );
}
