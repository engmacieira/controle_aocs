import React, { useState } from 'react';
import { Download, Plus, ArrowRightLeft, Landmark, TrendingUp, Wallet, Edit, Trash2, X } from 'lucide-react';
import { CiRecord, ExtratoRecord, ContaBancariaRecord } from '../types';
import { ExtratoModal } from './ExtratoModal';

interface EspelhoBancarioProps {
  extratoRecords: ExtratoRecord[];
  ciRecords: CiRecord[];
  contasRecords: ContaBancariaRecord[];
  onSave: (collectionName: string, item: any) => void;
  onDelete: (collectionName: string, id: string) => void;
}

export function EspelhoBancario({ extratoRecords, ciRecords, contasRecords, onSave, onDelete }: EspelhoBancarioProps) {
  const [contaFiltro, setContaFiltro] = useState(contasRecords.length > 0 ? contasRecords[0].nome : '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ExtratoRecord | null>(null);
  const [defaultMode, setDefaultMode] = useState<'saida' | 'entrada' | 'transferencia'>('saida');

  const [isContaModalOpen, setIsContaModalOpen] = useState(false);
  const [novaContaNome, setNovaContaNome] = useState('');

  React.useEffect(() => {
    if (contasRecords.length > 0 && !contasRecords.find(c => c.nome === contaFiltro)) {
      setContaFiltro(contasRecords[0].nome);
    }
  }, [contasRecords, contaFiltro]);

  const toggleConciliado = (id: string, current: boolean) => {
    const record = extratoRecords.find(r => r.id === id);
    if (record) {
      onSave('extrato', { ...record, conciliado: !current });
    }
  };

  const handleEdit = (item: ExtratoRecord) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este lançamento?')) {
      onDelete('extrato', id);
    }
  };

  const handleOpenModal = (mode: 'saida' | 'entrada' | 'transferencia') => {
    setItemToEdit(null);
    setDefaultMode(mode);
    setIsModalOpen(true);
  };

  const handleSaveModal = (item: any) => {
    onSave('extrato', item);
    setIsModalOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  // Calculations
  const accountRecords = extratoRecords.filter(r => r.contaBancaria === contaFiltro);
  const recordsToShow = accountRecords.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const saldoCC = accountRecords
    .filter(r => r.subConta !== 'investimento') // default to corrente
    .reduce((acc, r) => acc + (r.tipo === 'entrada' ? r.valor : -r.valor), 0);
  
  const saldoInvestimentos = accountRecords
    .filter(r => r.subConta === 'investimento')
    .reduce((acc, r) => acc + (r.tipo === 'entrada' ? r.valor : -r.valor), 0);
  
  const rendimentoMes = accountRecords
    .filter(r => r.subConta === 'investimento' && r.subTipo === 'rendimento')
    .reduce((acc, r) => acc + r.valor, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* 1. Cabeçalho de Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Conta Bancária</label>
            <div className="flex items-center gap-2">
              <select 
                value={contaFiltro}
                onChange={(e) => setContaFiltro(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 bg-slate-50"
              >
                {contasRecords.map(conta => (
                  <option key={conta.id} value={conta.nome}>{conta.nome}</option>
                ))}
                {contasRecords.length === 0 && (
                  <option value="">Nenhuma conta cadastrada</option>
                )}
              </select>
              <button 
                onClick={() => setIsContaModalOpen(true)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                title="Nova Conta"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mês / Ano</label>
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 bg-slate-50">
              <option>Janeiro 2026</option>
              <option>Fevereiro 2026</option>
              <option>Março 2026</option>
            </select>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap">
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* 2. Painel de Saldos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Conta Corrente</h3>
            <Landmark className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(saldoCC)}</p>
            <p className="text-xs text-slate-400 mt-1">Atualizado em tempo real</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Investimentos / Aplicação</h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(saldoInvestimentos)}</p>
            <p className="text-xs text-slate-400 mt-1">Rendimento acumulado: {formatCurrency(rendimentoMes)}</p>
          </div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-indigo-900">Saldo Total</h3>
            <Wallet className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-700">{formatCurrency(saldoCC + saldoInvestimentos)}</p>
            <p className="text-xs text-indigo-500 mt-1 font-medium">Conta + Aplicação</p>
          </div>
        </div>
      </div>

      {/* 3. Ações Rápidas */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => handleOpenModal('saida')} className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:border-red-400 hover:bg-red-50 text-slate-700 hover:text-red-700 text-sm font-medium rounded-lg transition-colors bg-white shadow-sm">
          <Plus className="w-4 h-4" />
          Nova Tarifa / Saída
        </button>
        <button onClick={() => handleOpenModal('entrada')} className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-sm font-medium rounded-lg transition-colors bg-white shadow-sm">
          <Plus className="w-4 h-4" />
          Nova Entrada
        </button>
        <button onClick={() => handleOpenModal('transferencia')} className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-medium rounded-lg transition-colors bg-white shadow-sm">
          <ArrowRightLeft className="w-4 h-4" />
          Transferência
        </button>
      </div>

      {/* 4. Tabela de Extrato Detalhado */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ref/CI</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dotação/Fonte</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Valor</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Conciliado</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recordsToShow.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                    Nenhum lançamento encontrado para esta conta.
                  </td>
                </tr>
              ) : (
                recordsToShow.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium whitespace-nowrap">{item.refCi || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.descricao}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.dotacao || '-'}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-xs font-medium border ${
                          item.tipo === 'entrada' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.tipo === 'entrada' ? '+ Entrada' : '- Saída'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          {item.subConta === 'investimento' ? 'Investimento' : 'Conta Corrente'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right whitespace-nowrap ${
                      item.tipo === 'entrada' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {formatCurrency(item.valor)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                        checked={!!item.conciliado}
                        onChange={() => toggleConciliado(item.id, !!item.conciliado)}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExtratoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        itemToEdit={itemToEdit}
        ciRecords={ciRecords}
        contasRecords={contasRecords}
        defaultMode={defaultMode}
      />

      {isContaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Nova Conta Bancária</h2>
              <button onClick={() => setIsContaModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Conta</label>
              <input 
                type="text" 
                value={novaContaNome}
                onChange={(e) => setNovaContaNome(e.target.value)}
                placeholder="Ex: Banco do Brasil - Ag 1234"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setIsContaModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (novaContaNome.trim()) {
                      onSave('contas', { nome: novaContaNome.trim() });
                      setNovaContaNome('');
                      setIsContaModalOpen(false);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Salvar Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
