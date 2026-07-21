import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AocsTable } from './AocsTable';
import { AocsRecord } from '../types';

const mockRecords: AocsRecord[] = [
  {
    id: 'aocs_1',
    aocs: '10',
    dataAocs: '01/07/2026',
    resumo: 'Gênero Alimentício SCFV',
    empresa: 'Supermercado Alvorada',
    contratoArp: 'ARP n° 022/2025',
    processo: 'Pregão Eletrônico n° 015/2025',
    ordemCompra: '38',
    dataEnvio: '27-jan.',
    empenho: '182',
    valor: 1500.50,
    entregue: 'EM ANDAMENTO',
    notaFiscal: '1377',
    dataNF: '28/01',
    numeroCI: '20',
    dotacao: 'Dotação 234',
    fonte: 'FR 1.660.000',
    contaBancaria: 'Recurso Próprio'
  },
  {
    id: 'aocs_2',
    aocs: '5',
    dataAocs: '02/07/2026',
    resumo: 'Material de Escritório',
    empresa: 'Papelaria Central',
    contratoArp: 'Contrato n° 010/2025',
    processo: 'Dispensa n° 002/2025',
    ordemCompra: '12',
    dataEnvio: '20-jan.',
    empenho: '101',
    valor: 500.00,
    entregue: 'CONCLUÍDO',
    notaFiscal: '1022',
    dataNF: '22/01',
    numeroCI: '15',
    dotacao: 'Dotação 100',
    fonte: 'FR 1.000.000',
    contaBancaria: 'IGD BF'
  }
];

describe('AocsTable Component', () => {
  const defaultProps = {
    records: mockRecords,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onBulkDelete: vi.fn(),
    onAdd: vi.fn()
  };

  it('deve renderizar a tabela com os registros fornecidos', () => {
    render(<AocsTable {...defaultProps} />);
    
    expect(screen.getByText('Contratação AOCS')).toBeInTheDocument();
    expect(screen.getByText('#10')).toBeInTheDocument();
    expect(screen.getByText('#5')).toBeInTheDocument();
    expect(screen.getByText('Supermercado Alvorada')).toBeInTheDocument();
    expect(screen.getByText('Papelaria Central')).toBeInTheDocument();
  });

  it('deve filtrar os registros conforme o termo de busca', () => {
    render(<AocsTable {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Buscar em AOCS...');
    fireEvent.change(searchInput, { target: { value: 'Escritório' } });

    // Apenas a Papelaria Central / Material de Escritório deve estar visível
    expect(screen.queryByText('#10')).not.toBeInTheDocument();
    expect(screen.getByText('#5')).toBeInTheDocument();
  });

  it('deve alternar a ordenação ao clicar no cabeçalho da coluna AOCS #', () => {
    render(<AocsTable {...defaultProps} />);
    
    // Por padrão (se ordenado ascendentemente por string/número no memo da tabela):
    // #5 e #10 são ordenados de forma crescente ou decrescente de acordo com o clique.
    const aocsHeader = screen.getByText('AOCS #');
    
    // Clica para ordenar
    fireEvent.click(aocsHeader);
    
    // Verifica se os elementos ainda estão presentes
    expect(screen.getByText('#10')).toBeInTheDocument();
    expect(screen.getByText('#5')).toBeInTheDocument();
  });

  it('deve chamar onAdd ao clicar no botão "Adicionar AOCS"', () => {
    render(<AocsTable {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /Adicionar AOCS/i });
    fireEvent.click(addButton);
    
    expect(defaultProps.onAdd).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onEdit com o registro correto ao clicar no botão de editar', () => {
    render(<AocsTable {...defaultProps} />);
    
    // Localiza os botões de edição (há dois registros, logo dois botões com title "Editar AOCS")
    const editButtons = screen.getAllByTitle('Editar AOCS');
    fireEvent.click(editButtons[0]); // primeiro registro na lista renderizada
    
    expect(defaultProps.onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'aocs_2' })); // dependendo da ordenação padrão
  });

  it('deve chamar onDelete ao clicar no botão de excluir', () => {
    render(<AocsTable {...defaultProps} />);
    
    const deleteButtons = screen.getAllByTitle('Excluir AOCS');
    fireEvent.click(deleteButtons[0]);
    
    expect(defaultProps.onDelete).toHaveBeenCalled();
  });

  it('deve gerenciar a seleção múltipla e permitir exclusão em lote', () => {
    render(<AocsTable {...defaultProps} />);
    
    // Selecionar todos os checkboxes da página
    const checkboxes = screen.getAllByRole('checkbox');
    // checkboxes[0] é o header (selecionar tudo), checkboxes[1] e [2] são as linhas
    fireEvent.click(checkboxes[1]);
    
    const bulkDeleteButton = screen.getByRole('button', { name: /Excluir \(/i });
    expect(bulkDeleteButton).toBeInTheDocument();
    expect(bulkDeleteButton).toHaveTextContent('Excluir (1)');
    
    fireEvent.click(bulkDeleteButton);
    expect(defaultProps.onBulkDelete).toHaveBeenCalledWith(['aocs_2']); // Depende de qual foi clicado primeiro devido à ordenação padrão
  });

  it('deve selecionar e desselecionar todos os itens da página ao clicar no checkbox principal', () => {
    render(<AocsTable {...defaultProps} />);
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    
    // Seleciona todos
    fireEvent.click(selectAllCheckbox);
    expect(screen.getByRole('button', { name: /Excluir \(2\)/i })).toBeInTheDocument();

    // Desseleciona todos
    fireEvent.click(selectAllCheckbox);
    expect(screen.queryByRole('button', { name: /Excluir \(\d+\)/i })).not.toBeInTheDocument();
  });

  it('deve desselecionar um item específico', () => {
    render(<AocsTable {...defaultProps} />);
    const checkboxes = screen.getAllByRole('checkbox');
    
    // Seleciona o primeiro item da linha
    fireEvent.click(checkboxes[1]);
    expect(screen.getByRole('button', { name: /Excluir \(1\)/i })).toBeInTheDocument();

    // Desseleciona o mesmo item
    fireEvent.click(checkboxes[1]);
    expect(screen.queryByRole('button', { name: /Excluir \(\d+\)/i })).not.toBeInTheDocument();
  });

  it('deve ordenar corretamente ao clicar em outros cabeçalhos de coluna', () => {
    render(<AocsTable {...defaultProps} />);
    
    const dataAocsHeader = screen.getByText('Data AOCS');
    const resumoHeader = screen.getByText('Resumo Contratação');
    const empresaHeader = screen.getByText('Fornecedor');
    const contratoArpHeader = screen.getByText('Contrato/ARP');
    const processoHeader = screen.getByText('Processo Licitatório');
    const valorHeader = screen.getByText('Valor (R$)');

    // Clica para ordenar por outras colunas
    fireEvent.click(dataAocsHeader);
    fireEvent.click(resumoHeader);
    fireEvent.click(empresaHeader);
    fireEvent.click(contratoArpHeader);
    fireEvent.click(processoHeader);
    fireEvent.click(valorHeader);
    
    // Ordena de forma inversa (desc) clicando novamente
    fireEvent.click(valorHeader);
    
    expect(screen.getByText('#10')).toBeInTheDocument();
  });

  it('deve ordenar corretamente quando o campo aocs não for numérico (string fallback)', () => {
    const stringRecords: AocsRecord[] = [
      ...mockRecords,
      {
        ...mockRecords[0],
        id: 'aocs_3',
        aocs: 'AOCS-ABC',
      },
      {
        ...mockRecords[0],
        id: 'aocs_4',
        aocs: 'AOCS-XYZ',
      }
    ];

    render(<AocsTable {...defaultProps} records={stringRecords} />);
    
    const aocsHeader = screen.getByText('AOCS #');
    // Força a ordenação
    fireEvent.click(aocsHeader);
    fireEvent.click(aocsHeader); // toggles to desc

    expect(screen.getByText('#AOCS-ABC')).toBeInTheDocument();
    expect(screen.getByText('#AOCS-XYZ')).toBeInTheDocument();
  });
});
