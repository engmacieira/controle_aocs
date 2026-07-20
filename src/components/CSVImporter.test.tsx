import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CSVImporter } from './CSVImporter';
import { useFirebaseData } from '../hooks/useFirebaseData';
import * as XLSX from 'xlsx';

// Mock do useFirebaseData hook
vi.mock('../hooks/useFirebaseData', () => ({
  useFirebaseData: vi.fn(),
}));

// Mock do writeBatch e doc do Firebase
vi.mock('firebase/firestore', () => ({
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    commit: vi.fn(() => Promise.resolve()),
  })),
  doc: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  db: {},
}));

// Mock do XLSX usando vi.mock para contornar limitações do ESM
vi.mock('xlsx', () => ({
  read: vi.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} }
  })),
  utils: {
    sheet_to_json: vi.fn(() => [
      { 'AOCS': '20', 'Data AOCS': '15/07/2026', 'Fornecedor': 'Empresa ABC', 'Valor': 'R$ 1.200,50' }
    ])
  }
}));

describe('CSVImporter Component', () => {
  const mockUser = { uid: 'user_123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFirebaseData as any).mockReturnValue({
      user: mockUser,
    });
  });

  it('deve renderizar a interface de importação corretamente', () => {
    render(<CSVImporter />);
    
    expect(screen.getByText('Importação de Planilhas')).toBeInTheDocument();
    expect(screen.getByText('1. AOCS')).toBeInTheDocument();
    expect(screen.getByText('2. CI')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro se tentar importar sem estar logado', () => {
    (useFirebaseData as any).mockReturnValue({
      user: null,
    });

    render(<CSVImporter />);
    
    // Simular o upload de arquivo na aba AOCS
    const file = new File(['aocs,dataAocs\n1,01/01/2026'], 'test.csv', { type: 'text/csv' });
    const input = screen.getAllByLabelText('Selecionar Arquivo')[0];
    
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('Você precisa estar logado para importar dados.')).toBeInTheDocument();
  });

  it('deve ler e gerar pré-visualização ao carregar um arquivo válido', async () => {
    render(<CSVImporter />);

    const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = screen.getAllByLabelText('Selecionar Arquivo')[0];

    fireEvent.change(input, { target: { files: [file] } });

    // Aguardar a pré-visualização ser exibida
    await waitFor(() => {
      expect(screen.getByText(/Pré-visualização: aocs/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Empresa ABC')).toBeInTheDocument();
    expect(screen.getByText('1200.5')).toBeInTheDocument(); // Após coerção de string do valor R$ 1.200,50 para número
  });
});
