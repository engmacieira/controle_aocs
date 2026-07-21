/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CiRecord, SortOrder, ContaBancariaRecord } from '../types';
import { ArrowUpDown, Edit3, Trash2, Search, Plus, Sparkles, FileText, Link, HelpCircle, Filter } from 'lucide-react';
import { Pagination } from './Pagination';

interface CiTableProps {
  records: CiRecord[];
  contasRecords: ContaBancariaRecord[];
  onEdit: (item: CiRecord) => void;
  onDelete: (id: string, ci: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onAdd: () => void;
}

export function CiTable({ records, contasRecords, onEdit, onDelete, onBulkDelete, onAdd }: CiTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterConta, setFilterConta] = React.useState<string>('all');
  const [sortField, setSortField] = React.useState<keyof CiRecord>('ci');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Filter & Search
  const filteredRecords = React.useMemo(() => {
    let result = [...records];
    
    if (filterConta !== 'all') {
      result = result.filter(r => r.contaBancaria === filterConta);
    }
    
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        r => 
          String(r.ci || '').toLowerCase().includes(q) ||
          String(r.dataCI || '').toLowerCase().includes(q) ||
          String(r.empresa || '').toLowerCase().includes(q) ||
          String(r.resumo || '').toLowerCase().includes(q) ||
          String(r.aocs || '').toLowerCase().includes(q) ||
          String(r.ordemCompra || '').toLowerCase().includes(q) ||
          String(r.contaBancaria || '').toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'ci' || sortField === 'aocs' || sortField === 'ordemCompra') {
        const numA = parseInt(a[sortField] || '0', 10);
        const numB = parseInt(b[sortField] || '0', 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          comparison = numA - numB;
        } else {
          comparison = String(a[sortField] || '').localeCompare(String(b[sortField] || ''));
        }
      } else if (sortField === 'valor') {
        comparison = a.valor - b.valor;
      } else {
        const valA = (a[sortField] || '').toString().toLowerCase();
        const valB = (b[sortField] || '').toString().toLowerCase();
        comparison = valA.localeCompare(valB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [records, searchTerm, sortField, sortOrder, filterConta]);

  // Reset page on search or filter
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterConta]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleToggleSelectAll = () => {
    if (paginatedRecords.length === 0) return;
    const allSelectedOnPage = paginatedRecords.every(r => selectedIds.includes(r.id));
    if (allSelectedOnPage) {
      setSelectedIds(selectedIds.filter(id => !paginatedRecords.find(r => r.id === id)));
    } else {
      const newSelected = new Set(selectedIds);
      paginatedRecords.forEach(r => newSelected.add(r.id));
      setSelectedIds(Array.from(newSelected));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSort = (field: keyof CiRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totalValorFiltered = React.useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + (r.valor || 0), 0);
  }, [filteredRecords]);

  return (
    <div id="ci-table-container" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-lg">Financeiro - CI</h3>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-indigo-100">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              INTEGRAÇÃO COM AOCS & DESPESAS AVULSAS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Consolidação de Comunicações Internas (CIs), reunindo notas vinculadas a processos e despesas de consumo direto (avulsas)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {selectedIds.length > 0 && onBulkDelete && (
            <button
              onClick={() => {
                onBulkDelete(selectedIds);
                setSelectedIds([]);
              }}
              className="flex items-center gap-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold text-sm px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              Excluir ({selectedIds.length})
            </button>
          )}
          <div className="relative w-full md:w-56">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={filterConta}
              onChange={(e) => setFilterConta(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-hidden text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50 appearance-none"
            >
              <option value="all">Todas as Contas</option>
              {contasRecords.map(conta => (
                <option key={conta.id} value={conta.nome}>{conta.nome}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar em CI..."
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
            Adicionar CI
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-wrap gap-8 items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registros Filtrados</span>
            <p className="text-lg font-bold text-slate-800 font-mono">{filteredRecords.length}</p>
          </div>
          <div className="border-l border-slate-200 h-8" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Soma Total CI</span>
            <p className="text-lg font-bold text-indigo-600 font-mono">
              {totalValorFiltered.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
            <tr>
              <th className="px-5 py-4 w-[50px] text-center">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  checked={paginatedRecords.length > 0 && paginatedRecords.every(r => selectedIds.includes(r.id))}
                  onChange={handleToggleSelectAll}
                />
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('ci')}>
                <div className="flex items-center gap-2">
                  <span>CI</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('dataCI')}>
                <div className="flex items-center gap-2">
                  <span>Data CI</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4">AOCS / Pedido</th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('empresa')}>
                <div className="flex items-center gap-2">
                  <span>Empresa / Favorecido</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4">Histórico / Objeto</th>
              <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('valor')}>
                <div className="flex items-center gap-2">
                  <span>Valor (R$)</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Nota Fiscal / Empenho</th>
              <th className="px-5 py-4">Conta Bancária</th>
              <th className="px-5 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={selectedIds.includes(rec.id)}
                      onChange={() => handleToggleSelect(rec.id)}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg w-max font-mono">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>CI {rec.ci}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{rec.dataCI}</td>
                  <td className="px-5 py-4">
                    {rec.aocs !== '-' ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-sm font-mono">
                          <Link className="w-2.5 h-2.5" />
                          AOCS #{rec.aocs}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">Ordem Compra: #{rec.ordemCompra}</p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
                        <HelpCircle className="w-2.5 h-2.5" />
                        AVULSA
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-700 font-semibold max-w-[180px] truncate" title={rec.empresa}>
                    {rec.empresa}
                  </td>
                  <td className="px-5 py-4 text-slate-600 font-medium max-w-[200px] truncate" title={rec.resumo}>
                    {rec.resumo}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900 font-mono">
                    {rec.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-5 py-4">
                    {(() => {
                      const status = rec.status || 'Pendente';
                      if (status === 'Pago') {
                        return (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            Pago
                          </span>
                        );
                      } else if (status === 'Atrasado') {
                        return (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            Atrasado
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                          Pendente
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-700">NF: {rec.notaFiscal}</p>
                      <p className="text-[10px] font-mono text-slate-400">Empenho: {rec.empenho}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-500 max-w-[180px] truncate" title={rec.contaBancaria}>
                    {rec.contaBancaria}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(rec)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                        title="Editar CI"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(rec.id, rec.ci)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-rose-600 rounded-lg transition-colors"
                        title="Excluir CI"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-5 py-12 text-center text-slate-400 text-sm">
                  Nenhuma CI encontrada.
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
        itemName="lançamentos de CIs"
      />
    </div>
  );
}
