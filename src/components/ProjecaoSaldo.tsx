import React, { useState, useMemo } from 'react';
import { Plus, Wallet, TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Edit3, Trash2, Banknote, Calendar } from 'lucide-react';
import { AocsRecord, CiRecord, ContaBancariaRecord, ExtratoRecord, LancamentoFuturo } from '../types';
import { ModalLancamentoFuturo } from './ModalLancamentoFuturo';

interface ProjecaoSaldoProps {
  aocsRecords: AocsRecord[];
  ciRecords: CiRecord[];
  contasRecords: ContaBancariaRecord[];
  extratoRecords: ExtratoRecord[];
  lancamentosFuturosRecords: LancamentoFuturo[];
  onSaveLancamento: (collectionName: string, item: any) => void;
  onDeleteLancamento: (collectionName: string, id: string) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ProjecaoSaldo({
  aocsRecords,
  ciRecords,
  contasRecords,
  extratoRecords,
  lancamentosFuturosRecords,
  onSaveLancamento,
  onDeleteLancamento,
  showToast
}: ProjecaoSaldoProps) {
  const [contaFiltro, setContaFiltro] = useState(contasRecords.length > 0 ? contasRecords[0].nome : '');
  const [horizonte, setHorizonte] = useState<'current_month' | 'next_3_months' | 'next_6_months' | 'all'>('next_3_months');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<LancamentoFuturo | null>(null);

  React.useEffect(() => {
    if (contasRecords.length > 0 && !contasRecords.find(c => c.nome === contaFiltro)) {
      setContaFiltro(contasRecords[0].nome);
    }
  }, [contasRecords, contaFiltro]);

  // Calculations
  const { saldoAtual, pendingAocs, pendingCis, filteredLancamentos } = useMemo(() => {
    // 1. Saldo Atual (sum of all extratos for the account)
    const saldo = extratoRecords
      .filter(r => r.contaBancaria === contaFiltro)
      .reduce((acc, r) => acc + (r.tipo === 'entrada' ? r.valor : -r.valor), 0);

    // 2. Pending CIs (status !== 'Pago')
    const cIs = ciRecords.filter(c => c.contaBancaria === contaFiltro && c.status?.toLowerCase() !== 'pago');
    
    // 3. Pending AOCs (no CI linked)
    const aOcs = aocsRecords.filter(a => {
      if (a.contaBancaria !== contaFiltro) return false;
      // if it has a CI linked, it's covered by the CI logic
      const hasCi = ciRecords.some(c => c.aocs === a.aocs);
      return !hasCi;
    });

    // 4. Lançamentos Futuros within horizon
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 6, 0);

    let lFuturos = lancamentosFuturosRecords.filter(l => l.conta_id === contaFiltro && l.status !== 'CANCELADO');

    if (horizonte === 'current_month') {
      const eom = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      lFuturos = lFuturos.filter(l => {
        const d = new Date(l.data_prevista);
        return d >= currentMonthStart && d <= eom;
      });
    } else if (horizonte === 'next_3_months') {
      lFuturos = lFuturos.filter(l => {
        const d = new Date(l.data_prevista);
        return d >= currentMonthStart && d <= threeMonthsLater;
      });
    } else if (horizonte === 'next_6_months') {
      lFuturos = lFuturos.filter(l => {
        const d = new Date(l.data_prevista);
        return d >= currentMonthStart && d <= sixMonthsLater;
      });
    }

    // Sort lancamentos futuros by date
    lFuturos.sort((a, b) => new Date(a.data_prevista).getTime() - new Date(b.data_prevista).getTime());

    return {
      saldoAtual: saldo,
      pendingAocs: aOcs,
      pendingCis: cIs,
      filteredLancamentos: lFuturos
    };
  }, [contaFiltro, extratoRecords, ciRecords, aocsRecords, lancamentosFuturosRecords, horizonte]);

  const totalCis = pendingCis.reduce((sum, c) => sum + (c.valor || 0), 0);
  const totalAocs = pendingAocs.reduce((sum, a) => sum + (a.valor || 0), 0);
  const comprometidoOrdens = totalCis + totalAocs;
  
  const saidasFuturas = filteredLancamentos.filter(l => l.tipo_lancamento === 'saida').reduce((sum, l) => sum + (l.valor || 0), 0);
  const entradasFuturas = filteredLancamentos.filter(l => l.tipo_lancamento === 'entrada').reduce((sum, l) => sum + (l.valor || 0), 0);

  const saldoComprometidoTotal = comprometidoOrdens + saidasFuturas;
  const saldoDisponivelReal = saldoAtual + entradasFuturas - saldoComprometidoTotal;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const handleEdit = (item: LancamentoFuturo) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este lançamento futuro?')) {
      onDeleteLancamento('lancamentos_futuros', id);
      if (showToast) showToast('Lançamento futuro excluído com sucesso!', 'success');
    }
  };

  const handleSaveModal = (item: any) => {
    onSaveLancamento('lancamentos_futuros', item);
    if (showToast) showToast('Lançamento futuro salvo com sucesso!', 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in" aria-label="Visualização e Projeção de Saldo">
      
      {/* 1. Cabeçalho de Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex flex-col">
            <label htmlFor="conta-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Conta Bancária</label>
            <select
              id="conta-select"
              value={contaFiltro}
              onChange={(e) => setContaFiltro(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden text-slate-700 bg-slate-50 min-w-[200px]"
            >
              {contasRecords.map(conta => (
                <option key={conta.id} value={conta.nome}>{conta.nome}</option>
              ))}
              {contasRecords.length === 0 && <option value="">Nenhuma conta</option>}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="horizonte-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Horizonte Temporal</label>
            <select
              id="horizonte-select"
              value={horizonte}
              onChange={(e) => setHorizonte(e.target.value as any)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden text-slate-700 bg-slate-50"
            >
              <option value="current_month">Mês Atual</option>
              <option value="next_3_months">Próximos 3 Meses</option>
              <option value="next_6_months">Próximos 6 Meses</option>
              <option value="all">Todo o Período</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Saldo Atual em Conta</h3>
            <Wallet className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(saldoAtual)}</p>
            <p className="text-xs text-slate-400 mt-1">Saldo Bruto (CC + Aplicações)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-emerald-600">Entradas Previstas</h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(entradasFuturas)}</p>
            <p className="text-xs text-emerald-500/70 mt-1">
              Repasses e créditos futuros
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-rose-600">Total Comprometido</h3>
            <TrendingDown className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-rose-600">{formatCurrency(saldoComprometidoTotal)}</p>
            <p className="text-xs text-rose-500/70 mt-1">
              Pendentes: {formatCurrency(comprometidoOrdens)} | Futuros: {formatCurrency(saidasFuturas)}
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between ${
          saldoDisponivelReal >= 0 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold ${saldoDisponivelReal >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
              Saldo Disponível Real
            </h3>
            {saldoDisponivelReal >= 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div>
            <p className={`text-3xl font-bold ${saldoDisponivelReal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatCurrency(saldoDisponivelReal)}
            </p>
            <p className={`text-xs mt-1 font-medium ${saldoDisponivelReal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Livre para contratações
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Tabela de Detalhamento do Comprometido */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-800">Obrigações Pendentes</h3>
            <span className="ml-auto text-xs font-bold text-slate-500">{pendingAocs.length + pendingCis.length} registros</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse" aria-label="Tabela de Obrigações Pendentes">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 shadow-sm">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo / Ref</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Resumo</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingCis.map(ci => (
                  <tr key={ci.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 mb-1">CI</span>
                      <div className="font-semibold text-slate-700">#{ci.ci}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-slate-800 truncate max-w-[200px]" title={ci.empresa}>{ci.empresa}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]" title={ci.resumo}>{ci.resumo || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-rose-600 whitespace-nowrap">
                      {formatCurrency(ci.valor)}
                    </td>
                  </tr>
                ))}
                {pendingAocs.map(aoc => (
                  <tr key={aoc.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 mb-1">AOC</span>
                      <div className="font-semibold text-slate-700">#{aoc.aocs}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-slate-800 truncate max-w-[200px]" title={aoc.empresa}>{aoc.empresa}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]" title={aoc.resumo}>{aoc.resumo || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-rose-600 whitespace-nowrap">
                      {formatCurrency(aoc.valor)}
                    </td>
                  </tr>
                ))}
                {(pendingCis.length === 0 && pendingAocs.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                      Nenhuma obrigação pendente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Seção Lançamentos Futuros */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <h3 className="font-semibold text-slate-800">Lançamentos Futuros</h3>
            </div>
            <button
              onClick={() => { setItemToEdit(null); setIsModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar
            </button>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse" aria-label="Tabela de Lançamentos Futuros">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 shadow-sm">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Valor</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center w-[80px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLancamentos.map(lanc => (
                  <tr key={lanc.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(lanc.data_prevista + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-slate-800">{lanc.descricao}</div>
                      <div className="flex gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${lanc.tipo_lancamento === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {lanc.tipo_lancamento === 'entrada' ? 'Crédito' : 'Débito'}
                        </span>
                        {lanc.tipo_categoria && <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{lanc.tipo_categoria}</span>}
                        {lanc.recorrente && <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Recorrente</span>}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right whitespace-nowrap ${lanc.tipo_lancamento === 'entrada' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {lanc.tipo_lancamento === 'entrada' ? '+' : '-'}{formatCurrency(lanc.valor)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleEdit(lanc)} className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 outline-hidden" title="Editar">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(lanc.id)} className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 outline-hidden" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLancamentos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      Nenhum lançamento futuro no período selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalLancamentoFuturo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        itemToEdit={itemToEdit}
        contasRecords={contasRecords}
        initialConta={contaFiltro}
      />
    </div>
  );
}
