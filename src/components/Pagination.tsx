import React from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemName
}: PaginationProps) {
  const [inputPage, setInputPage] = React.useState(currentPage.toString());

  React.useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(inputPage, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page);
      } else {
        setInputPage(currentPage.toString());
      }
    }
  };

  const handleInputBlur = () => {
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setInputPage(currentPage.toString());
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 gap-4 text-xs text-slate-500 font-medium font-mono">
      <span>
        Mostrando {Math.min(totalItems, (currentPage - 1) * pageSize + 1)} a{' '}
        {Math.min(totalItems, currentPage * pageSize)} de {totalItems} {itemName}
      </span>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden outline-hidden"
          title="Primeira Página" aria-label="Ir para a primeira página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden outline-hidden"
          title="Página Anterior" aria-label="Ir para a página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1.5 px-2">
          <span>Página</span>
          <input
            type="text"
            value={inputPage}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            aria-label="Número da página atual" className="w-12 h-8 text-center rounded-lg border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700 bg-white outline-hidden"
          />
          <span>de {totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden outline-hidden"
          title="Próxima Página" aria-label="Ir para a próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-hidden outline-hidden"
          title="Última Página" aria-label="Ir para a última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
