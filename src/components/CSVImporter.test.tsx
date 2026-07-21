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

  it('deve permitir cancelar a importação após gerar a pré-visualização', async () => {
    render(<CSVImporter />);

    const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = screen.getAllByLabelText('Selecionar Arquivo')[0];

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();
  });

  it('deve confirmar a importação e salvar no firebase', async () => {
    render(<CSVImporter />);

    const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = screen.getAllByLabelText('Selecionar Arquivo')[0];

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirmar Importação/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/importados com sucesso para aocs/i)).toBeInTheDocument();
    });
  });

  it('deve processar e renderizar corretamente a importação de CI', async () => {
    // Override XLSX mock for this test
    vi.spyOn(XLSX.utils, 'sheet_to_json').mockReturnValueOnce([
      { 'CI': 'CI-123', 'Data CI': '10/10/2026', 'Valor Pago': 'R$ 5.000,00', 'AOCS': null }
    ]);

    render(<CSVImporter />);

    const file = new File(['test'], 'ci.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = screen.getAllByLabelText('Selecionar Arquivo')[1]; // CI is the second input

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Pré-visualização: ci/i)).toBeInTheDocument();
    });

    // It should have coerced the 'AOCS' null into '-' and 'Valor Pago' to 5000
    expect(screen.getByText('CI-123')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro se FileReader disparar onerror', async () => {
    const readAsBinaryStringMock = vi.spyOn(FileReader.prototype, 'readAsBinaryString').mockImplementation(function(this: FileReader) {
      if (this.onerror) {
        this.onerror(new ProgressEvent('error') as any);
      }
    });

    render(<CSVImporter />);

    const file = new File(['test'], 'error.csv', { type: 'text/csv' });
    const input = screen.getAllByLabelText('Selecionar Arquivo')[0];

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Erro ao tentar ler o arquivo/i)).toBeInTheDocument();
    });

    readAsBinaryStringMock.mockRestore();
  });

  it('deve exibir mensagem de erro se a leitura falhar (exception)', async () => {
    vi.spyOn(XLSX, 'read').mockImplementationOnce(() => {
      throw new Error('Fake read error');
    });

    render(<CSVImporter />);

    const file = new File(['test'], 'error.csv', { type: 'text/csv' });
    const input = screen.getAllByLabelText('Selecionar Arquivo')[0];

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Erro ao ler arquivo: Fake read error/i)).toBeInTheDocument();
    });
  });
});
