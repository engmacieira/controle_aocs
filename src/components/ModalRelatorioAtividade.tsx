import React from 'react';
import { X, Printer, Link, Calendar, User, ShieldAlert } from 'lucide-react';
import { RegistroAtividadeRecord } from '../types';

interface ModalRelatorioAtividadeProps {
  isOpen: boolean;
  onClose: () => void;
  activity: RegistroAtividadeRecord | null;
}

export function ModalRelatorioAtividade({
  isOpen,
  onClose,
  activity
}: ModalRelatorioAtividadeProps) {
  if (!isOpen || !activity) return null;

  const handlePrint = () => {
    window.print();
  };

  // Helper to format date cleanly
  const formatDateBr = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:static print:bg-white print:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      {/* Print CSS stylesheet added dynamically to only target this modal */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-scale-up print:shadow-none print:border-none print:my-0 print:rounded-none max-h-[90vh] print:max-h-none flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Hidden on Print */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/80 no-print">
          <div>
            <h3 id="report-modal-title" className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>📋 Visualização de Relatório Oficial</span>
              {activity.aocs_ci_vinculada && (
                <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                  {activity.aocs_ci_vinculada}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estilo A4 oficial com cabeçalho institucional e formatação de prestação de contas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              aria-label="Imprimir ou Salvar como PDF"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden"
              aria-label="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Document Content (Simulated A4 Paper) */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-slate-100 print:bg-white print:p-0">
          <div 
            id="print-area"
            className="bg-white mx-auto p-12 sm:p-16 border border-slate-200 shadow-sm rounded-md w-full max-w-[210mm] min-h-[297mm] print:shadow-none print:border-none print:p-4 print:max-w-none print:min-h-0 text-slate-950 font-serif leading-relaxed text-sm flex flex-col justify-between"
          >
            <div>
              {/* Institutional Header */}
              <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-slate-200 border-2 border-dashed border-slate-400 rounded-full flex items-center justify-center text-slate-500 font-bold font-sans text-xs">
                  BRASÃO
                </div>
                <h1 className="text-base font-bold uppercase tracking-wider font-sans text-slate-900">
                  PREFEITURA MUNICIPAL / SECRETARIA MUNICIPAL
                </h1>
                <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-1 font-sans">
                  RELATÓRIO DE COMPROVAÇÃO DE ATIVIDADES E EXECUÇÃO DE OBJETO
                </h2>
                <div className="text-[10px] font-mono text-slate-400 mt-2">
                  Controle Interno • Prestação de Contas Simplificada
                </div>
              </div>

              {/* General Metadata Section */}
              <div className="mb-8 font-sans">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 bg-slate-50 px-3 py-1.5 border-l-4 border-slate-900">
                  1. Informações de Identificação do Objeto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded-xl p-4 text-xs">
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-500 block uppercase text-[10px]">Título da Ação/Atividade:</span>
                    <span className="text-slate-900 font-semibold text-sm leading-tight">{activity.titulo_atividade}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block uppercase text-[10px]">Período de Execução:</span>
                    <span className="text-slate-900 font-medium">
                      {formatDateBr(activity.data_inicio)} até {formatDateBr(activity.data_fim)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block uppercase text-[10px]">Processo / Vínculo Associado:</span>
                    <span className="text-slate-900 font-semibold">{activity.aocs_ci_vinculada || 'Nenhum Processo Vinculado'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-500 block uppercase text-[10px]">Técnico ou Fiscal de Execução Responsável:</span>
                    <span className="text-slate-900 font-medium">{activity.tecnico_responsavel || 'Não Identificado'}</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="mb-8 font-sans">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 bg-slate-50 px-3 py-1.5 border-l-4 border-slate-900">
                  2. Síntese Executiva das Ações
                </h3>
                <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 text-xs italic text-slate-800 leading-relaxed">
                  "{activity.resumo}"
                </div>
              </div>

              {/* Detailed Narrative Section */}
              <div className="mb-8 font-sans">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 bg-slate-50 px-3 py-1.5 border-l-4 border-slate-900">
                  3. Relato Descritivo e Detalhado
                </h3>
                <div className="prose prose-slate text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-wrap px-1">
                  {activity.relato_detalhado || 'Nenhum relato narrativo detalhado foi registrado para esta atividade.'}
                </div>
              </div>

              {/* Media links and evidences */}
              <div className="mb-8 font-sans break-inside-avoid">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 bg-slate-50 px-3 py-1.5 border-l-4 border-slate-900">
                  4. Relatório Fotográfico & Evidências (Hiperlink Externo)
                </h3>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <p className="text-xs text-slate-600 mb-3">
                    As comprovações fotográficas, listas de presença, certidões de recebimento e notas técnicas complementares encontram-se digitalizadas e acessíveis no repositório digital compartilhado.
                  </p>
                  {activity.link_drive_midias ? (
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-slate-500">Endereço de Acesso:</span>
                      <a 
                        href={activity.link_drive_midias} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline break-all font-mono"
                      >
                        {activity.link_drive_midias}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-100 p-3 rounded-lg">
                      <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Nenhum endereço digital de mídias/evidências foi vinculado a este relatório.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-16 border-t border-slate-200 pt-8 text-center font-sans break-inside-avoid">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-48 border-b border-slate-400 mb-2"></div>
                  <span className="font-bold text-slate-900">{activity.tecnico_responsavel || 'Fiscal/Técnico Responsável'}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">Assinatura do Técnico Responsável</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-48 border-b border-slate-400 mb-2"></div>
                  <span className="font-bold text-slate-900">Controlador Interno</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">Visto / Homologação</span>
                </div>
              </div>
              <div className="text-[9px] text-slate-400 mt-12 text-center border-t border-slate-100 pt-4 font-mono">
                Documento gerado automaticamente pelo Sincronizador Financeiro • LicitaDocs em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
