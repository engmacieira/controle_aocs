/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AocsRecord, SortOrder } from '../types';
import { ArrowUpDown, Edit3, Search, Plus, Sparkles, Receipt, FileSignature } from 'lucide-react';
import { Pagination } from './Pagination';

interface FaturamentoTableProps {
  records: AocsRecord[];
  onEdit: (item: AocsRecord) => void;
  onAdd: () => void;
}

export function FaturamentoTable({ records, onEdit, onAdd }: FaturamentoTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'todos' | 'faturados' | 'pendentes'>('todos');
  const [sortField, setSortField] = React.useState<keyof AocsRecord>('aocs');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Filter & Search
  const filteredRecords = React.useMemo(() => {
    let result = [...records];

    // Status filter
    if (filterStatus === 'faturados') {
      result = result.filter(r => r.notaFiscal && String(r.notaFiscal).trim() !== '');
    } else if (filterStatus === 'pendentes') {
      result = result.filter(r => !r.notaFiscal || String(r.notaFiscal).trim() === '');
    }

    // Search term filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        r => 
          String(r.aocs || '').toLowerCase().includes(q) ||
          String(r.empresa || '').toLowerCase().includes(q) ||
          String(r.notaFiscal || '').toLowerCase().includes(q) ||
          String(r.numeroCI || '').toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'aocs') {
        const numA = parseInt(a.aocs || '0', 10);
        const numB = parseInt(b.aocs || '0', 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          comparison = numA - numB;
        } else {
          comparison = String(a.aocs || '').localeCompare(String(b.aocs || ''));
        }
      } else if (sortField === 'valor') {
        comparison = (a.valor || 0) - (b.valor || 0);
      } else {
        const valA = (a[sortField] || '').toString().toLowerCase();
        const valB = (b[sortField] || '').toString().toLowerCase();
        comparison = valA.localeCompare(valB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [records, filterStatus, searchTerm, sortField, sortOrder]);

  // Reset page on search/filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleSort = (field: keyof AocsRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totals = React.useMemo(() => {
    const total = filteredRecords.length;
    const faturadosCount = filteredRecords.filter(r => r.notaFiscal && String(r.notaFiscal).trim() !== '').length;
    const pendentesCount = total - faturadosCount;
    const somaValorTotal = filteredRecords.reduce((sum, r) => sum + (r.valor || 0), 0);
    return { total, faturadosCount, pendentesCount, somaValorTotal };
  }, [filteredRecords]);

  return (
    <div id="faturamento-table-container" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4 animate-in fade-in-50 duration-200">
      
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Faturamento & Liquidação AOCS
            </h3>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100 font-mono">
              NFs & VÍNCULO CI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Lance Notas Fiscais, configure datas de emissão e atribua o Número da CI correspondente para cada AOCS.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setFilterStatus('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'todos'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('faturados')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'faturados'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Com NF
            </button>
            <button
              onClick={() => setFilterStatus('pendentes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'pendentes'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sem NF
            </button>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar em Faturamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-hidden text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50"
            />
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-4.5 h-4.5" />
            Vincular Faturamento
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-wrap gap-8 items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AOCS Exibidas</span>
            <p className="text-lg font-bold text-slate-800 font-mono">{filteredRecords.length}</p>
          </div>
          <div className="border-l border-slate-200 h-8" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Com NF Lançada</span>
            <p className="text-lg font-bold text-emerald-600 font-mono">{totals.faturadosCount}</p>
          </div>
          <div className="border-l border-slate-200 h-8" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Faturamento Pendente</span>
            <p className="text-lg font-bold text-amber-600 font-mono">{totals.pendentesCount}</p>
          </div>
          <div className="border-l border-slate-200 h-8" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valor Global Filtrado</span>
            <p className="text-lg font-bold text-indigo-700 font-mono">
              {totals.somaValorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
            <tr>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors w-[100px]" onClick={() => handleSort('aocs')}>
                <div className="flex items-center gap-2">
                  <span>AOCS #</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('empresa')}>
                <div className="flex items-center gap-2">
                  <span>Fornecedor</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('valor')}>
                <div className="flex items-center gap-2">
                  <span>Valor Contrato (R$)</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('notaFiscal')}>
                <div className="flex items-center gap-2">
                  <span>Nota Fiscal</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('dataNF')}>
                <div className="flex items-center gap-2">
                  <span>Data NF</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('numeroCI')}>
                <div className="flex items-center gap-2">
                  <span>Número CI Atribuído</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((rec) => {
                const hasNF = rec.notaFiscal && String(rec.notaFiscal).trim() !== '';
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-700 font-mono">#{rec.aocs}</td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800 truncate max-w-[200px]" title={rec.empresa}>
                          {rec.empresa}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={rec.resumo}>
                          {rec.resumo}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 font-mono">
                      {rec.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-5 py-4">
                      {hasNF ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg w-max font-mono">
                          <Receipt className="w-3.5 h-3.5 text-slate-400" />
                          <span>NF {rec.notaFiscal}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">Aguardando NF</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono whitespace-nowrap">{rec.dataNF || '-'}</td>
                    <td className="px-5 py-4">
                      {rec.numeroCI ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg w-max font-mono">
                          <FileSignature className="w-3.5 h-3.5 text-indigo-500" />
                          <span>CI #{rec.numeroCI}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono font-normal">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onEdit(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-100 text-indigo-600 rounded-lg transition-colors font-semibold text-xs"
                        title="Vincular / Editar Faturamento"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Preencher</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                  Nenhum faturamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredRecords.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        itemName="faturamentos"
      />
    </div>
  );
}
