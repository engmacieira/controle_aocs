import React, { useState } from 'react';
import { Download, Plus, ArrowRightLeft, Landmark, TrendingUp, Wallet, Edit, Trash2, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { CiRecord, ExtratoRecord, ContaBancariaRecord } from '../types';
import { ExtratoModal } from './ExtratoModal';

interface EspelhoBancarioProps {
  extratoRecords: ExtratoRecord[];
  ciRecords: CiRecord[];
  contasRecords: ContaBancariaRecord[];
  onSave: (collectionName: string, item: any) => void;
  onDelete: (collectionName: string, id: string) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function EspelhoBancario({ extratoRecords, ciRecords, contasRecords, onSave, onDelete, showToast }: EspelhoBancarioProps) {
  const [contaFiltro, setContaFiltro] = useState(contasRecords.length > 0 ? contasRecords[0].nome : '');
  const [mesAnoFiltro, setMesAnoFiltro] = useState<string>('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [subContaFiltro, setSubContaFiltro] = useState<'todas' | 'corrente' | 'investimento'>('todas');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ExtratoRecord; direction: 'asc' | 'desc' } | null>({ key: 'data', direction: 'desc' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ExtratoRecord | null>(null);
  const [defaultMode, setDefaultMode] = useState<'saida' | 'entrada' | 'transferencia'>('saida');

  const [isContaModalOpen, setIsContaModalOpen] = useState(false);
  const [novaContaNome, setNovaContaNome] = useState('');

  // Extract unique month/year from extratoRecords
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    extratoRecords.forEach(r => {
      if (r.data) {
        const date = new Date(r.data + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          const m = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
          const capitalized = m.charAt(0).toUpperCase() + m.slice(1);
          months.add(`${capitalized}|${r.data.substring(0, 7)}`);
        }
      }
    });

    const now = new Date();
    const currentM = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const currentCapitalized = currentM.charAt(0).toUpperCase() + currentM.slice(1);
    const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    months.add(`${currentCapitalized}|${currentYm}`);

    return Array.from(months).sort((a, b) => b.split('|')[1].localeCompare(a.split('|')[1]));
  }, [extratoRecords]);

  React.useEffect(() => {
    if (!mesAnoFiltro && availableMonths.length > 0) {
      setMesAnoFiltro(availableMonths[0].split('|')[1]);
    }
  }, [availableMonths, mesAnoFiltro]);

  React.useEffect(() => {
    if (contasRecords.length > 0 && !contasRecords.find(c => c.nome === contaFiltro)) {
      setContaFiltro(contasRecords[0].nome);
    }
  }, [contasRecords, contaFiltro]);

  const toggleConciliado = (id: string, current: boolean) => {
    const record = extratoRecords.find(r => r.id === id);
    if (record) {
      onSave('extrato', { ...record, conciliado: !current });
      if (showToast) {
        showToast(
          !current ? 'Lançamento conciliado com sucesso!' : 'Conciliação removida com sucesso!',
          'success'
        );
      }
    }
  };

  const handleEdit = (item: ExtratoRecord) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este lançamento?')) {
      onDelete('extrato', id);
      if (showToast) {
        showToast('Lançamento excluído com sucesso!', 'success');
      }
    }
  };

  const handleOpenModal = (mode: 'saida' | 'entrada' | 'transferencia') => {
    setItemToEdit(null);
    setDefaultMode(mode);
    setIsModalOpen(true);
  };

  const handleSaveModal = (item: any) => {
    onSave('extrato', item);
    if (showToast) {
      showToast('Lançamento de extrato salvo com sucesso!', 'success');
    }
    setIsModalOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  // Calculations
  const accountRecords = extratoRecords.filter(r => r.contaBancaria === contaFiltro);

  let recordsToShow = accountRecords
    .filter(r => {
      if (mesAnoFiltro && mesAnoFiltro !== 'todos' && r.data && !r.data.startsWith(mesAnoFiltro)) return false;
      if (tipoFiltro !== 'todos' && r.tipo !== tipoFiltro) return false;
      if (subContaFiltro !== 'todas') {
        const isCorrente = r.subConta !== 'investimento';
        if (subContaFiltro === 'corrente' && !isCorrente) return false;
        if (subContaFiltro === 'investimento' && isCorrente) return false;
      }
      return true;
    });

  if (sortConfig) {
    recordsToShow.sort((a, b) => {
      let valA: any = a[sortConfig.key];
      let valB: any = b[sortConfig.key];

      if (sortConfig.key === 'data') {
        valA = new Date((valA as string) + 'T00:00:00').getTime();
        valB = new Date((valB as string) + 'T00:00:00').getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const saldoCC = accountRecords
    .filter(r => r.subConta !== 'investimento') // default to corrente
    .reduce((acc, r) => acc + (r.tipo === 'entrada' ? r.valor : -r.valor), 0);

  const saldoInvestimentos = accountRecords
    .filter(r => r.subConta === 'investimento')
    .reduce((acc, r) => acc + (r.tipo === 'entrada' ? r.valor : -r.valor), 0);

  const rendimentoMes = accountRecords
    .filter(r => {
      if (mesAnoFiltro && mesAnoFiltro !== 'todos' && r.data && !r.data.startsWith(mesAnoFiltro)) return false;
      return r.subConta === 'investimento' && r.subTipo === 'rendimento';
    })
    .reduce((acc, r) => acc + r.valor, 0);

  const monthlyRecords = mesAnoFiltro && mesAnoFiltro !== 'todos'
    ? accountRecords.filter(r => r.data && r.data.startsWith(mesAnoFiltro))
    : accountRecords;

  const resumoMes = {
    cc: {
      entradas: monthlyRecords.filter(r => r.subConta !== 'investimento' && r.tipo === 'entrada').reduce((acc, r) => acc + r.valor, 0),
      saidas: monthlyRecords.filter(r => r.subConta !== 'investimento' && r.tipo === 'saida').reduce((acc, r) => acc + r.valor, 0),
    },
    inv: {
      entradas: monthlyRecords.filter(r => r.subConta === 'investimento' && r.tipo === 'entrada').reduce((acc, r) => acc + r.valor, 0),
      saidas: monthlyRecords.filter(r => r.subConta === 'investimento' && r.tipo === 'saida').reduce((acc, r) => acc + r.valor, 0),
    }
  };
  const resultadoCCMes = resumoMes.cc.entradas - resumoMes.cc.saidas;
  const resultadoInvMes = resumoMes.inv.entradas - resumoMes.inv.saidas;

  const handleSort = (key: keyof ExtratoRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* 1. Cabeçalho de Filtros */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Conta Bancária</label>
            <div className="flex items-center gap-2">
              <select
                value={contaFiltro}
                onChange={(e) => setContaFiltro(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 outline-hidden text-slate-700 bg-slate-50"
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
            <select
              value={mesAnoFiltro}
              onChange={(e) => setMesAnoFiltro(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 outline-hidden text-slate-700 bg-slate-50"
            >
              <option value="todos">Todos os lançamentos</option>
              {availableMonths.map(m => {
                const [label, value] = m.split('|');
                return <option key={value} value={value}>{label}</option>;
              })}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo de Movimento</label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as any)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 outline-hidden text-slate-700 bg-slate-50"
            >
              <option value="todos">Todos</option>
              <option value="entrada">Apenas Entradas</option>
              <option value="saida">Apenas Saídas</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo de Conta</label>
            <select
              value={subContaFiltro}
              onChange={(e) => setSubContaFiltro(e.target.value as any)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 outline-hidden text-slate-700 bg-slate-50"
            >
              <option value="todas">Corrente + Investimento</option>
              <option value="corrente">Apenas Corrente</option>
              <option value="investimento">Apenas Investimento</option>
            </select>
          </div>
        </div>
        <div className="pt-5 xl:pt-0">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
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
                <th 
                  className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('data')}
                >
                  <div className="flex items-center gap-1">
                    Data
                    {sortConfig?.key === 'data' ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ref/CI</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dotação/Fonte</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th 
                  className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('valor')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Valor
                    {sortConfig?.key === 'valor' ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                    )}
                  </div>
                </th>
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
                  <tr key={item.id} className={`transition-all duration-300 ${item.conciliado ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium whitespace-nowrap">{item.refCi || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.descricao}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.dotacao || '-'}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-xs font-medium border ${item.tipo === 'entrada'
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
                    <td className={`px-4 py-3 text-sm font-semibold text-right whitespace-nowrap ${item.tipo === 'entrada' ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                      {formatCurrency(item.valor)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer outline-hidden"
                        checked={!!item.conciliado}
                        onChange={() => toggleConciliado(item.id, !!item.conciliado)}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden" title="Editar" aria-label="Editar lançamento">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 outline-hidden" title="Excluir" aria-label="Excluir lançamento">
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

      {/* 4. Resumo do Período */}
      {mesAnoFiltro && mesAnoFiltro !== 'todos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-fade-in">
          {/* Resumo Conta Corrente */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-500" />
                Resumo Mês - Conta Corrente
              </h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{mesAnoFiltro}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Entradas</p>
                <p className="text-sm font-semibold text-emerald-600">{formatCurrency(resumoMes.cc.entradas)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Saídas</p>
                <p className="text-sm font-semibold text-rose-600">{formatCurrency(resumoMes.cc.saidas)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Situação Final</p>
                <p className={`text-sm font-bold ${resultadoCCMes >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {resultadoCCMes >= 0 ? '+' : ''}{formatCurrency(resultadoCCMes)}
                </p>
              </div>
            </div>
          </div>

          {/* Resumo Investimento */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Resumo Mês - Investimento
              </h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{mesAnoFiltro}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Entradas</p>
                <p className="text-sm font-semibold text-emerald-600">{formatCurrency(resumoMes.inv.entradas)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Saídas</p>
                <p className="text-sm font-semibold text-rose-600">{formatCurrency(resumoMes.inv.saidas)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Situação Final</p>
                <p className={`text-sm font-bold ${resultadoInvMes >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {resultadoInvMes >= 0 ? '+' : ''}{formatCurrency(resultadoInvMes)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      if (showToast) {
                        showToast(`Conta bancária "${novaContaNome.trim()}" criada com sucesso!`, 'success');
                      }
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
