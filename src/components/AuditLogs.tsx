import React, { useState } from 'react';
import { AuditLogRecord } from '../types';
import { Search, History, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLogsProps {
  logs: AuditLogRecord[];
}

export function AuditLogs({ logs }: AuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredLogs = logs
    .filter(log => {
      const term = searchTerm.toLowerCase();
      return (
        log.userEmail.toLowerCase().includes(term) ||
        log.collectionName.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR');
    } catch {
      return iso;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">CRIAÇÃO</span>;
      case 'UPDATE':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">EDIÇÃO</span>;
      case 'DELETE':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">EXCLUSÃO</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Logs de Auditoria
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Registro de todas as alterações feitas no sistema
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuário, tabela ou ação..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-sm bg-white">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-slate-100/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-4 border-b border-slate-200/80">Data / Hora</th>
              <th className="px-5 py-4 border-b border-slate-200/80">Usuário</th>
              <th className="px-5 py-4 border-b border-slate-200/80">Ação</th>
              <th className="px-5 py-4 border-b border-slate-200/80">Tabela (Módulo)</th>
              <th className="px-5 py-4 border-b border-slate-200/80 text-right">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap border-b border-slate-100 font-mono text-xs">{formatDate(log.timestamp)}</td>
                  <td className="px-5 py-4 text-slate-700 font-medium border-b border-slate-100">{log.userEmail}</td>
                  <td className="px-5 py-4 border-b border-slate-100">{getActionBadge(log.action)}</td>
                  <td className="px-5 py-4 text-slate-600 border-b border-slate-100 font-mono text-xs">{log.collectionName}</td>
                  <td className="px-5 py-4 text-right border-b border-slate-100">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                      title="Ver Detalhes"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500 text-sm border-b border-slate-100">
                  Nenhum log encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200/80 rounded-xl shadow-sm">
          <div className="text-sm text-slate-500">
            Página <span className="font-semibold text-slate-700">{currentPage}</span> de <span className="font-semibold text-slate-700">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Detalhes do Log</h3>
              <button onClick={() => setSelectedLog(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Usuário</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedLog.userEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Ação</p>
                  <div>{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tabela</p>
                  <p className="text-sm font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 w-fit">{selectedLog.collectionName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Data / Hora</p>
                  <p className="text-sm font-mono text-slate-700">{formatDate(selectedLog.timestamp)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedLog.action !== 'CREATE' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      Dados Anteriores
                    </h4>
                    <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-[400px]">
                      <pre className="text-xs text-slate-300 font-mono">
                        {JSON.stringify(selectedLog.previousData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {selectedLog.action !== 'DELETE' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Novos Dados
                    </h4>
                    <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-[400px]">
                      <pre className="text-xs text-slate-300 font-mono">
                        {JSON.stringify(selectedLog.newData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
