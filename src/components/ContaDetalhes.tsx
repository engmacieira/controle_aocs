import React from 'react';
import { AocsRecord, CiRecord } from '../types';
import { CreditCard, Wallet, Layers, TrendingUp, CheckCircle, FileCheck, Landmark } from 'lucide-react';

interface ContaDetalhesProps {
  conta: string;
  aocsRecords: AocsRecord[];
  ciRecords: CiRecord[];
}

export function ContaDetalhes({ conta, aocsRecords, ciRecords }: ContaDetalhesProps) {
  const contaAocs = React.useMemo(() => {
    return aocsRecords.filter(a => {
      const c = a.contaBancaria ? String(a.contaBancaria).trim() : 'Não Informada';
      return c === conta;
    });
  }, [aocsRecords, conta]);

  const contaCis = React.useMemo(() => {
    return ciRecords.filter(ci => {
      const c = ci.contaBancaria ? String(ci.contaBancaria).trim() : 'Não Informada';
      return c === conta;
    });
  }, [ciRecords, conta]);

  const stats = React.useMemo(() => {
    let comprado = 0;
    let faturado = 0;
    let naoRecebido = 0;
    let pago = 0;

    contaAocs.forEach(a => {
      const val = a.valor || 0;
      comprado += val;
      const nf = a.notaFiscal ? String(a.notaFiscal).trim() : '';
      if (nf !== '' && nf !== '-') {
        faturado += val;
      } else {
        naoRecebido += val;
      }
    });

    contaCis.forEach(ci => {
      pago += (ci.valorPago || 0);
    });

    return { comprado, faturado, naoRecebido, pago };
  }, [contaAocs, contaCis]);

  const saldoPendente = Math.max(0, stats.faturado - stats.pago);
  const percentPaid = stats.faturado > 0 ? Math.min(100, Math.round((stats.pago / stats.faturado) * 100)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Resumo Financeiro da Conta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Comprado</span>
            <h3 className="text-lg font-bold text-slate-700 mt-1 font-mono">
              {stats.comprado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-500/70 uppercase tracking-wider block">Total Faturado</span>
            <h3 className="text-lg font-bold text-emerald-700 mt-1 font-mono">
              {stats.faturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-500/70 uppercase tracking-wider block">Total Pago</span>
            <h3 className="text-lg font-bold text-emerald-700 mt-1 font-mono">
              {stats.pago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-500/70 uppercase tracking-wider block">Saldo a Pagar</span>
            <h3 className="text-lg font-bold text-rose-600 mt-1 font-mono">
              {saldoPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
          </div>
          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Progresso de Quitação (Pago vs Faturado)</span>
          <span className="text-sm font-bold text-indigo-600">{percentPaid}%</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${percentPaid === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
            style={{ width: `${percentPaid}%` }}
          />
        </div>
      </div>

      {/* Tabelas de Detalhamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AOCS Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              AOCS Vinculadas
            </div>
            <div className="text-xs font-mono bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-500">
              {contaAocs.length} registros
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white border-b border-slate-100 text-slate-400 font-medium">
                <tr>
                  <th className="p-3">AOCS</th>
                  <th className="p-3">Fornecedor</th>
                  <th className="p-3">NF</th>
                  <th className="p-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {contaAocs.length > 0 ? (
                  contaAocs.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-700">{rec.aocs || '-'}</td>
                      <td className="p-3 text-slate-600 truncate max-w-[150px]" title={rec.empresa}>{rec.empresa || '-'}</td>
                      <td className="p-3 text-slate-600">
                        {rec.notaFiscal && rec.notaFiscal !== '-' ? (
                          <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-mono text-[10px]">NF: {rec.notaFiscal}</span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-slate-700">
                        {(rec.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma AOCS vinculada a esta conta.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CI Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <Landmark className="w-4 h-4 text-emerald-500" />
              CIs (Pagamentos) Vinculados
            </div>
            <div className="text-xs font-mono bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-500">
              {contaCis.length} registros
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white border-b border-slate-100 text-slate-400 font-medium">
                <tr>
                  <th className="p-3">CI</th>
                  <th className="p-3">AOCS</th>
                  <th className="p-3">Data Pgto</th>
                  <th className="p-3 text-right">Valor Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {contaCis.length > 0 ? (
                  contaCis.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-700">{rec.ci || '-'}</td>
                      <td className="p-3 text-slate-600">{rec.aocs || '-'}</td>
                      <td className="p-3 text-slate-500 font-mono">{rec.dataPagamento || '-'}</td>
                      <td className="p-3 text-right font-mono font-medium text-emerald-600">
                        {(rec.valorPago || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma CI de pagamento vinculada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
