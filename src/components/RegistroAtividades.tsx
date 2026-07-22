import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  ExternalLink, 
  FileText, 
  Edit2, 
  Trash2, 
  FolderOpen,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react';
import { RegistroAtividadeRecord, AocsRecord, CiRecord } from '../types';
import { ModalAtividade } from './ModalAtividade';
import { ModalRelatorioAtividade } from './ModalRelatorioAtividade';

interface RegistroAtividadesProps {
  records: RegistroAtividadeRecord[];
  aocsRecords: AocsRecord[];
  ciRecords: CiRecord[];
  userEmail: string | null;
  onSave: (activity: any) => Promise<void>;
  onDelete: (id: string, title: string) => void;
}

export function RegistroAtividades({
  records,
  aocsRecords,
  ciRecords,
  userEmail,
  onSave,
  onDelete
}: RegistroAtividadesProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Modals Control
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [isModalRelatorioOpen, setIsModalRelatorioOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<RegistroAtividadeRecord | null>(null);

  // local search & filters (Client-side)
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // 1. Text search
      const text = searchTerm.toLowerCase();
      const matchText = 
        record.titulo_atividade.toLowerCase().includes(text) ||
        record.resumo.toLowerCase().includes(text) ||
        (record.tecnico_responsavel && record.tecnico_responsavel.toLowerCase().includes(text));

      // 2. Date start filter
      let matchStart = true;
      if (dateStart) {
        // Record starts on or after dateStart OR starts before but spans over
        matchStart = record.data_inicio >= dateStart || record.data_fim >= dateStart;
      }

      // 3. Date end filter
      let matchEnd = true;
      if (dateEnd) {
        // Record ends on or before dateEnd OR starts before dateEnd
        matchEnd = record.data_inicio <= dateEnd || record.data_fim <= dateEnd;
      }

      return matchText && matchStart && matchEnd;
    }).sort((a, b) => {
      // Order by starting date desc
      return b.data_inicio.localeCompare(a.data_inicio);
    });
  }, [records, searchTerm, dateStart, dateEnd]);

  const handleEditClick = (record: RegistroAtividadeRecord) => {
    setSelectedActivity(record);
    setIsModalCadastroOpen(true);
  };

  const handleViewReportClick = (record: RegistroAtividadeRecord) => {
    setSelectedActivity(record);
    setIsModalRelatorioOpen(true);
  };

  const handleAddClick = () => {
    setSelectedActivity(null);
    setIsModalCadastroOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateStart('');
    setDateEnd('');
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
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">🔍 Filtros de Consulta</h3>
            <p className="text-xs text-slate-500 mt-0.5">Filtre as atividades locais por texto ou período.</p>
          </div>
          <button
            onClick={handleAddClick}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-150 shrink-0 self-start sm:self-auto"
            aria-label="Registrar Nova Atividade"
          >
            <Plus className="w-4 h-4" />
            Nova Atividade
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Free Text Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, resumo ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
              aria-label="Campo de busca livre"
            />
          </div>

          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              placeholder="Início"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-white"
              aria-label="Filtro de data início"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              placeholder="Fim"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:outline-hidden outline-hidden text-sm bg-white"
              aria-label="Filtro de data fim"
            />
          </div>
        </div>

        {/* Filters Clear Row */}
        {(searchTerm || dateStart || dateEnd) && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-500 font-medium">
              Encontrados <strong className="text-slate-800 font-semibold">{filteredRecords.length}</strong> registros para os filtros ativos.
            </span>
            <button
              onClick={handleClearFilters}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Grid of Clean Cards */}
      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecords.map((record) => (
            <div 
              key={record.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm p-6 flex flex-col justify-between transition-all hover:shadow-md"
              aria-label={`Atividade: ${record.titulo_atividade}`}
            >
              {/* Card Top / Header */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateBr(record.data_inicio)} — {formatDateBr(record.data_fim)}
                  </span>

                  {/* Discrete Action Icons: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(record)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden"
                      title="Editar Atividade"
                      aria-label="Editar esta atividade"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(record.id, record.titulo_atividade)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-500 outline-hidden"
                      title="Excluir Atividade"
                      aria-label="Excluir esta atividade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug mb-2 hover:text-indigo-600 transition-colors">
                  {record.titulo_atividade}
                </h4>

                {/* Technical Owner and linked process */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 mb-4 font-medium">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Resp: <strong className="text-slate-700 font-semibold">{record.tecnico_responsavel || 'Não Identificado'}</strong>
                  </span>
                  {record.aocs_ci_vinculada && (
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono text-[10px]">
                      Vínculo: {record.aocs_ci_vinculada}
                    </span>
                  )}
                </div>

                {/* Resume/Brief description */}
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 border border-slate-100 rounded-xl p-3 mb-6">
                  {record.resumo}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-2 mt-auto">
                <button
                  onClick={() => handleViewReportClick(record)}
                  className="flex-1 py-2 px-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden"
                  aria-label={`Visualizar relatório oficial da atividade ${record.titulo_atividade}`}
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  Visualizar Relatório
                </button>

                {record.link_drive_midias ? (
                  <a
                    href={record.link_drive_midias}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden shadow-xs"
                    aria-label={`Abrir pasta do Google Drive com as evidências de ${record.titulo_atividade} em nova aba`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Abrir Evidências
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-2 px-3 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200/50"
                    title="Nenhuma pasta de evidências cadastrada"
                    aria-label="Abrir evidências desabilitado"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Sem Evidências
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-slate-200 rounded-2xl shadow-sm max-w-md mx-auto">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
            <Info className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">Nenhum Registro Encontrado</h4>
          <p className="text-xs text-slate-500 max-w-sm mb-6">
            Nenhuma atividade foi registrada ou os filtros aplicados não retornaram resultados.
          </p>
          {(searchTerm || dateStart || dateEnd) ? (
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Limpar Filtros Ativos
            </button>
          ) : (
            <button
              onClick={handleAddClick}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-150"
            >
              Adicionar Nova Atividade
            </button>
          )}
        </div>
      )}

      {/* Cadastro/Edição Modal */}
      <ModalAtividade
        isOpen={isModalCadastroOpen}
        onClose={() => {
          setIsModalCadastroOpen(false);
          setSelectedActivity(null);
        }}
        onSave={onSave}
        activityToEdit={selectedActivity}
        currentUserEmail={userEmail}
        aocsRecords={aocsRecords}
        ciRecords={ciRecords}
      />

      {/* A4 Report Printable Modal */}
      <ModalRelatorioAtividade
        isOpen={isModalRelatorioOpen}
        onClose={() => {
          setIsModalRelatorioOpen(false);
          setSelectedActivity(null);
        }}
        activity={selectedActivity}
      />
    </div>
  );
}
