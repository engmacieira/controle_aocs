/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AocsRecord, SortOrder } from '../types';
import { ArrowUpDown, Edit3, Search, Plus, Sparkles, ShoppingCart, Landmark } from 'lucide-react';
import { Pagination } from './Pagination';

interface PedidosTableProps {
  records: AocsRecord[];
  onEdit: (item: AocsRecord) => void;
  onAdd: () => void;
}

export function PedidosTable({ records, onEdit, onAdd }: PedidosTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'todos' | 'vinculados' | 'pendentes'>('todos');
  const [sortField, setSortField] = React.useState<keyof AocsRecord>('aocs');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Filter & Search
  const filteredRecords = React.useMemo(() => {
    let result = [...records];

    // Status filter
    if (filterStatus === 'vinculados') {
      result = result.filter(r => r.ordemCompra && String(r.ordemCompra).trim() !== '');
    } else if (filterStatus === 'pendentes') {
      result = result.filter(r => !r.ordemCompra || String(r.ordemCompra).trim() === '');
    }

    // Search term filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        r => 
          String(r.aocs || '').toLowerCase().includes(q) ||
          String(r.empresa || '').toLowerCase().includes(q) ||
          String(r.ordemCompra || '').toLowerCase().includes(q) ||
          String(r.empenho || '').toLowerCase().includes(q) ||
          String(r.dotacao || '').toLowerCase().includes(q) ||
          String(r.fonte || '').toLowerCase().includes(q) ||
          String(r.contaBancaria || '').toLowerCase().includes(q)
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
    const vinculadosCount = filteredRecords.filter(r => r.ordemCompra && String(r.ordemCompra).trim() !== '').length;
    const pendentesCount = total - vinculadosCount;
    return { total, vinculadosCount, pendentesCount };
  }, [filteredRecords]);

  return (
    <div id="pedidos-table-container" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4 animate-in fade-in-50 duration-200">
      
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              Pedidos de Compra
            </h3>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-indigo-100 font-mono">
              PROCV / LINK DE AOCS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Vincule e configure as informações do Pedido de Compra (Ordem de Compra, Empenho, Dotação e Conta) para cada AOCS emitida.
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
              onClick={() => setFilterStatus('vinculados')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'vinculados'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Com Pedido
            </button>
            <button
              onClick={() => setFilterStatus('pendentes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'pendentes'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sem Pedido
            </button>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar em Pedidos..."
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
            Vincular Pedido
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
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Com Pedidos Vinculados</span>
            <p className="text-lg font-bold text-emerald-600 font-mono">{totals.vinculadosCount}</p>
          </div>
          <div className="border-l border-slate-200 h-8" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Aguardando Lançamento</span>
            <p className="text-lg font-bold text-amber-600 font-mono">{totals.pendentesCount}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-sm bg-white">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-slate-100/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-200/50 transition-colors w-[100px] border-b border-slate-200/80" onClick={() => handleSort('aocs')}>
                <div className="flex items-center gap-2">
                  <span>AOCS #</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-200/50 transition-colors border-b border-slate-200/80" onClick={() => handleSort('empresa')}>
                <div className="flex items-center gap-2">
                  <span>Fornecedor</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-200/50 transition-colors border-b border-slate-200/80" onClick={() => handleSort('ordemCompra')}>
                <div className="flex items-center gap-2">
                  <span>Ordem de Compra (OC)</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-200/50 transition-colors border-b border-slate-200/80" onClick={() => handleSort('dataEnvio')}>
                <div className="flex items-center gap-2">
                  <span>Data Envio</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-200/50 transition-colors border-b border-slate-200/80" onClick={() => handleSort('empenho')}>
                <div className="flex items-center gap-2">
                  <span>Empenho</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 border-b border-slate-200/80">Dotação / Fonte</th>
              <th className="px-5 py-4 border-b border-slate-200/80">Conta Bancária</th>
              <th className="px-5 py-4 text-right border-b border-slate-200/80">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((rec) => {
                const isLinked = rec.ordemCompra && String(rec.ordemCompra).trim() !== '';
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4 font-semibold text-slate-700 font-mono border-b border-slate-100">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs">#{rec.aocs}</span>
                    </td>
                    <td className="px-5 py-4 border-b border-slate-100">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800 truncate max-w-[180px]" title={rec.empresa}>
                          {rec.empresa}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]" title={rec.resumo}>
                          {rec.resumo}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold border-b border-slate-100">
                      {isLinked ? (
                        <span className="text-slate-800 font-mono">#{rec.ordemCompra}</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 uppercase tracking-wider">Pendente</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap border-b border-slate-100">{rec.dataEnvio || '-'}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600 font-mono border-b border-slate-100">{rec.empenho || '-'}</td>
                    <td className="px-5 py-4 border-b border-slate-100">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-700">{rec.dotacao || '-'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{rec.fonte || '-'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-500 max-w-[160px] truncate border-b border-slate-100" title={rec.contaBancaria}>
                      {rec.contaBancaria ? (
                        <div className="flex items-center gap-1">
                          <Landmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{rec.contaBancaria}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-normal">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right border-b border-slate-100">
                      <button
                        onClick={() => onEdit(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 hover:bg-indigo-50 text-indigo-600 border border-transparent hover:border-indigo-100 rounded-lg transition-colors font-semibold text-xs opacity-0 group-hover:opacity-100"
                        title="Vincular / Editar Pedido" aria-label="Vincular ou Editar Pedido"
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
                <td colSpan={8} className="px-5 py-12 text-center text-slate-500 text-sm border-b border-slate-100">
                  Nenhum registro de pedido encontrado.
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
        itemName="pedidos"
      />
    </div>
  );
}
