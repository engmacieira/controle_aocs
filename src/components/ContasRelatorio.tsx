/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AocsRecord, CiRecord } from '../types';
import { ExternalLink, CreditCard, Wallet, Layers, TrendingUp, CheckCircle, Search } from 'lucide-react';

import { CSVImporter } from './CSVImporter';

interface ContasRelatorioProps {
  aocsRecords: AocsRecord[];
  ciRecords: CiRecord[];
  onViewDetails?: (conta: string) => void;
}

export function ContasRelatorio({
  aocsRecords,
  ciRecords,
  onViewDetails
}: ContasRelatorioProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // 1. Identify all unique bank accounts across all lists
  const contasResumo = React.useMemo(() => {
    const contasMap: { 
      [key: string]: { 
        conta: string; 
        comprado: number;
        faturado: number;
        naoRecebido: number;
        pago: number; 
      } 
    } = {};

    const getCleanConta = (c: string) => {
      if (!c || c === '-' || String(c).trim() === '') return 'Não Informada';
      return String(c).trim();
    };

    // Aggregate AOCS
    aocsRecords.forEach(a => {
      const c = getCleanConta(a.contaBancaria);
      if (!contasMap[c]) {
        contasMap[c] = { conta: c, comprado: 0, faturado: 0, naoRecebido: 0, pago: 0 };
      }
      const val = a.valor || 0;
      contasMap[c].comprado += val;
      const nf = a.notaFiscal ? String(a.notaFiscal).trim() : '';
      if (nf !== '' && nf !== '-') {
        contasMap[c].faturado += val;
      } else {
        contasMap[c].naoRecebido += val;
      }
    });

    // Aggregate CIs and Pago
    ciRecords.forEach(ci => {
      const c = getCleanConta(ci.contaBancaria);
      if (!contasMap[c]) {
        contasMap[c] = { conta: c, comprado: 0, faturado: 0, naoRecebido: 0, pago: 0 };
      }
      contasMap[c].pago += (ci.valorPago || 0);
    });

    return Object.values(contasMap);
  }, [aocsRecords, ciRecords]);

  // Filter accounts
  const filteredContas = React.useMemo(() => {
    if (!searchTerm.trim()) return contasResumo;
    const q = searchTerm.toLowerCase().trim();
    return contasResumo.filter(c => c.conta.toLowerCase().includes(q));
  }, [contasResumo, searchTerm]);

  // Overall totals
  const totals = React.useMemo(() => {
    return contasResumo.reduce((acc, curr) => {
      acc.comprado += curr.comprado;
      acc.faturado += curr.faturado;
      acc.naoRecebido += curr.naoRecebido;
      acc.pago += curr.pago;
      return acc;
    }, { comprado: 0, faturado: 0, naoRecebido: 0, pago: 0 });
  }, [contasResumo]);

  return (
    <div id="relatorio-contas-root" className="space-y-6">
      
      {/* Cards Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Comprado</span>
            <h3 className="text-xl font-bold text-slate-700 mt-1 font-mono">
              {totals.comprado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1.5 font-mono">Pedidos Contratados</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">AOCS Faturadas</span>
            <h3 className="text-xl font-bold text-emerald-600 mt-1 font-mono">
              {totals.faturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1.5 font-mono">Com NF recebida</p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pendente Entrega</span>
            <h3 className="text-xl font-bold text-rose-600 mt-1 font-mono">
              {totals.naoRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1.5 font-mono">AOCS sem Nota Fiscal</p>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
            <Search className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Pago</span>
            <h3 className="text-xl font-bold text-indigo-700 mt-1 font-mono">
              {totals.pago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1.5 font-mono">Quitação em CIs</p>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Account aggregation */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Cálculos por Contas Bancárias</h3>
            <p className="text-xs text-slate-400 mt-1">Consolidação automática e em tempo real dos valores de Pedidos, AOCS, CIs e Pagamentos agregados por Conta Bancária</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar contas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-hidden text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Conta Bancária</th>
                <th className="px-6 py-4 text-right">Total Comprado</th>
                <th className="px-6 py-4 text-right">Faturadas</th>
                <th className="px-6 py-4 text-right">Pendente Entrega</th>
                <th className="px-6 py-4 text-right">Total Pago</th>
                <th className="px-6 py-4 text-right">Saldo a Pagar</th>
                <th className="px-6 py-4">Progresso de Quitação</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContas.length > 0 ? (
                filteredContas.map((rec, index) => {
                  const percentPaid = rec.faturado > 0 ? Math.min(100, Math.round((rec.pago / rec.faturado) * 100)) : 0;
                  const saldoPendente = Math.max(0, rec.faturado - rec.pago);
                  
                  return (
                    <tr key={index} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-slate-900 max-w-[280px]">
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span title={rec.conta}>{rec.conta}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold font-mono text-slate-600">
                        {rec.comprado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold font-mono text-emerald-600">
                        {rec.faturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold font-mono text-rose-600">
                        {rec.naoRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-right font-bold font-mono text-emerald-700">
                        {rec.pago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold font-mono ${saldoPendente > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {saldoPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 min-w-[160px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${percentPaid === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                              style={{ width: `${percentPaid}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700">{percentPaid}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onViewDetails && onViewDetails(rec.conta)}
                          className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Ver Detalhes"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Nenhuma conta bancária encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* CSV Importer */}
      <div className="mt-8">
        <CSVImporter />
      </div>
    </div>
  );
}
