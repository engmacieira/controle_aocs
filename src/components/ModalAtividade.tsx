import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, Calendar, User, Link, FileText, Sparkles } from 'lucide-react';
import { RegistroAtividadeRecord, AocsRecord, CiRecord } from '../types';

interface ModalAtividadeProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Omit<RegistroAtividadeRecord, 'id' | 'created_at'> & { id?: string; created_at?: any }) => Promise<void>;
  activityToEdit: RegistroAtividadeRecord | null;
  currentUserEmail?: string | null;
  aocsRecords?: AocsRecord[];
  ciRecords?: CiRecord[];
}

export function ModalAtividade({
  isOpen,
  onClose,
  onSave,
  activityToEdit,
  currentUserEmail,
  aocsRecords = [],
  ciRecords = []
}: ModalAtividadeProps) {
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [vinculo, setVinculo] = useState('');
  const [relato, setRelato] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (activityToEdit) {
        setTitulo(activityToEdit.titulo_atividade || '');
        setResumo(activityToEdit.resumo || '');
        setDataInicio(activityToEdit.data_inicio || '');
        setDataFim(activityToEdit.data_fim || '');
        setTecnico(activityToEdit.tecnico_responsavel || '');
        setVinculo(activityToEdit.aocs_ci_vinculada || '');
        setRelato(activityToEdit.relato_detalhado || '');
        setLinkDrive(activityToEdit.link_drive_midias || '');
      } else {
        // Default empty states
        setTitulo('');
        setResumo('');
        
        // Default to today's date formatted in YYYY-MM-DD local time
        const today = new Date().toISOString().split('T')[0];
        setDataInicio(today);
        setDataFim(today);
        
        // Suggest current user if logged in, but keep editable
        setTecnico(currentUserEmail || '');
        setVinculo('');
        setRelato('');
        setLinkDrive('');
      }
      setErrors({});
    }
  }, [isOpen, activityToEdit, currentUserEmail]);

  if (!isOpen) return null;

  // Visual warning if the link doesn't contain drive.google.com or docs.google.com
  const isGoogleDriveLink = (url: string) => {
    if (!url) return true;
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!titulo.trim()) newErrors.titulo = 'O título da atividade é obrigatório.';
    if (!resumo.trim()) newErrors.resumo = 'O resumo da atividade é obrigatório.';
    if (!dataInicio) newErrors.dataInicio = 'A data de início é obrigatória.';
    if (!dataFim) newErrors.dataFim = 'A data de fim é obrigatória.';
    if (dataInicio && dataFim && dataInicio > dataFim) {
      newErrors.dataFim = 'A data de fim não pode ser anterior à data de início.';
    }
    if (linkDrive && !validateUrl(linkDrive)) {
      newErrors.linkDrive = 'Por favor, insira uma URL válida (ex: https://...).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...(activityToEdit?.id ? { id: activityToEdit.id, created_at: activityToEdit.created_at } : {}),
        titulo_atividade: titulo.trim(),
        resumo: resumo.trim(),
        data_inicio: dataInicio,
        data_fim: dataFim,
        tecnico_responsavel: tecnico.trim(),
        aocs_ci_vinculada: vinculo.trim(),
        relato_detalhado: relato.trim(),
        link_drive_midias: linkDrive.trim()
      });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar atividade:', err);
      alert('Ocorreu um erro ao salvar o registro de atividade. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Build a list of unique labels for suggestions
  const suggestions = [
    ...aocsRecords.map(a => `AOCS #${a.aocs}`),
    ...ciRecords.map(c => `CI #${c.ci}`)
  ].filter((value, index, self) => self.indexOf(value) === index);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-150 w-full max-w-2xl overflow-hidden my-8 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 id="modal-title" className="font-bold text-slate-900 text-lg">
              {activityToEdit ? '✏️ Editar Registro de Atividade' : '➕ Novo Registro de Atividade'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Insira as informações e mídias comprobatórias para prestação de contas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden"
            aria-label="Fechar modal de cadastro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Título da Atividade */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Título da Atividade *
            </label>
            <input
              type="text"
              required
              aria-required="true"
              aria-invalid={!!errors.titulo}
              placeholder="Ex: Entrega de Material Esportivo nas Unidades de Saúde"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border ${
                errors.titulo ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-indigo-500'
              } focus-visible:ring-2 focus-visible:outline-hidden outline-hidden text-sm`}
            />
            {errors.titulo && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.titulo}</p>
            )}
          </div>

          {/* Resumo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Resumo / Síntese Executiva *
            </label>
            <input
              type="text"
              required
              aria-required="true"
              aria-invalid={!!errors.resumo}
              placeholder="Ex: Entrega de bolas, coletes e cones para os polos de iniciação esportiva."
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border ${
                errors.resumo ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-indigo-500'
              } focus-visible:ring-2 focus-visible:outline-hidden outline-hidden text-sm`}
            />
            {errors.resumo && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.resumo}</p>
            )}
          </div>

          {/* Período (Início e Fim) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data de Início *
              </label>
              <input
                type="date"
                required
                aria-required="true"
                aria-invalid={!!errors.dataInicio}
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  errors.dataInicio ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-indigo-500'
                } focus-visible:ring-2 focus-visible:outline-hidden outline-hidden text-sm`}
              />
              {errors.dataInicio && (
                <p className="text-xs text-red-500 font-medium mt-1">{errors.dataInicio}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data de Fim *
              </label>
              <input
                type="date"
                required
                aria-required="true"
                aria-invalid={!!errors.dataFim}
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  errors.dataFim ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-indigo-500'
                } focus-visible:ring-2 focus-visible:outline-hidden outline-hidden text-sm`}
              />
              {errors.dataFim && (
                <p className="text-xs text-red-500 font-medium mt-1">{errors.dataFim}</p>
              )}
            </div>
          </div>

          {/* Técnico Responsável e AOCS/CI Vinculada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Técnico / Fiscal Responsável
              </label>
              <input
                type="text"
                placeholder="Nome do técnico ou e-mail"
                value={tecnico}
                onChange={(e) => setTecnico(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-1">Sugerido automaticamente, mas editável.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                Processo / AOCS / CI Vinculada
              </label>
              <input
                type="text"
                list="vinculos-sugeridos"
                placeholder="Digite ou selecione (Ex: CI 12/2026)"
                value={vinculo}
                onChange={(e) => setVinculo(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden outline-hidden text-sm"
              />
              <datalist id="vinculos-sugeridos">
                {suggestions.map((sug, idx) => (
                  <option key={idx} value={sug} />
                ))}
              </datalist>
              <p className="text-[10px] text-slate-400 mt-1">Vinculação flexível de processo para controle interno.</p>
            </div>
          </div>

          {/* Relato Detalhado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Relato Narrativo Detalhado (Markdown suportado)
            </label>
            <textarea
              rows={5}
              placeholder="Descreva detalhadamente o evento, locais de entrega, público atendido, etc."
              value={relato}
              onChange={(e) => setRelato(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden outline-hidden text-sm font-sans"
            />
          </div>

          {/* Link para mídias/Google Drive */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Link className="w-3.5 h-3.5 text-slate-400" />
              Link da Pasta de Evidências (Google Drive / Mídias)
            </label>
            <input
              type="url"
              aria-invalid={!!errors.linkDrive}
              placeholder="https://drive.google.com/drive/folders/..."
              value={linkDrive}
              onChange={(e) => setLinkDrive(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border ${
                errors.linkDrive ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-indigo-500'
              } focus-visible:ring-2 focus-visible:outline-hidden outline-hidden text-sm`}
            />
            {errors.linkDrive && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.linkDrive}</p>
            )}
            
            {/* Visual warning for non-google links as requested */}
            {linkDrive && validateUrl(linkDrive) && !isGoogleDriveLink(linkDrive) && (
              <div className="mt-2 bg-amber-50 border border-amber-150 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Aviso de Compatibilidade:</span> O link informado não parece ser uma pasta nativa do Google Drive/Docs. Certifique-se de que a pasta está compartilhada publicamente para visualização de mídias por outros fiscais ou controle interno.
                </div>
              </div>
            )}

            <div className="mt-2 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2 text-xs text-indigo-800 leading-normal">
              <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Dica de Interface:</strong> Cole aqui o link compartilhado da pasta no Google Drive com as fotos e documentos do evento.
              </span>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 -mx-6 -mb-6 p-6">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg outline-hidden disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-hidden flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Gravando...
                </>
              ) : (
                'Salvar Registro'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
