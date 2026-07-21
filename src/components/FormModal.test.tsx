import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormModal } from './FormModal';
import { AocsRecord, CiRecord } from '../types';

const mockAocsRecords: AocsRecord[] = [
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
  }
];

const mockCiRecords: CiRecord[] = [];

describe('FormModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    activeTab: 'aocs' as const,
    itemToEdit: null,
    onSave: vi.fn(),
    aocsRecords: mockAocsRecords,
    ciRecords: mockCiRecords,
    contasRecords: []
  };

  it('não deve renderizar nada se isOpen for false', () => {
    const { container } = render(<FormModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar o formulário da aba AOCS', () => {
    render(<FormModal {...defaultProps} activeTab="aocs" />);
    
    expect(screen.getByText('Novo Registro')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: 01/07/2026')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Gênero Alimentício SCFV')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome do fornecedor / Empresa')).toBeInTheDocument();
  });

  it('deve chamar onSave com os dados preenchidos ao submeter o formulário AOCS', () => {
    render(<FormModal {...defaultProps} activeTab="aocs" />);
    
    // Preencher campos obrigatórios por placeholder
    fireEvent.change(screen.getByPlaceholderText('Ex: 1'), { target: { value: '15' } });
    fireEvent.change(screen.getByPlaceholderText('Ex: 01/07/2026'), { target: { value: '10/07/2026' } });
    fireEvent.change(screen.getByPlaceholderText('Ex: Gênero Alimentício SCFV'), { target: { value: 'Material de Limpeza' } });
    fireEvent.change(screen.getByPlaceholderText('Nome do fornecedor / Empresa'), { target: { value: 'Distribuidora Clean' } });
    
    // Para o campo de valor contratado, podemos encontrá-lo pelo tipo "number"
    const valorInput = screen.getByRole('spinbutton');
    fireEvent.change(valorInput, { target: { value: '800' } });

    // Submeter formulário
    fireEvent.submit(screen.getByRole('button', { name: /Salvar Registro/i }));

    expect(defaultProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
      aocs: '15',
      dataAocs: '10/07/2026',
      resumo: 'Material de Limpeza',
      empresa: 'Distribuidora Clean',
      valor: 800
    }));
  });

  it('deve herdar dados de AOCS automaticamente (PROCV/VLOOKUP) na aba CI', () => {
    render(<FormModal {...defaultProps} activeTab="ci" />);
    
    // Na aba CI, há dois comboboxes (selects). Podemos pegar todos os comboboxes
    const selects = screen.getAllByRole('combobox');
    // O primeiro select é o de AOCS Relacionada
    const selectAocs = selects[0];
    expect(selectAocs).toBeInTheDocument();
    
    // Selecionar a AOCS de número '10'
    fireEvent.change(selectAocs, { target: { value: '10' } });

    // Verificar se a notificação do PROCV apareceu
    expect(screen.getByText('PROCV: Dados herdados do AOCS!')).toBeInTheDocument();

    // Validar se os campos herdados foram preenchidos corretamente nos inputs correspondentes.
    const inputs = screen.getAllByRole('textbox');
    const empresaInput = inputs.find(input => (input as HTMLInputElement).value === 'Supermercado Alvorada');
    expect(empresaInput).toBeDefined();

    // O valor proposto (que é do tipo number, ou seja, spinbutton) deve ser 1500.5
    // Pode haver múltiplos spinbuttons se houver Valor Proposto e Valor Pago, pegamos o primeiro
    const spinbuttons = screen.getAllByRole('spinbutton');
    expect((spinbuttons[0] as HTMLInputElement).value).toBe('1500.5');
  });

  it('deve renderizar a aba Pedidos de Compra e carregar os dados ao vincular AOCS', () => {
    render(<FormModal {...defaultProps} activeTab="pedidos" />);
    
    const selects = screen.getAllByRole('combobox');
    const selectAocs = selects[0];
    expect(selectAocs).toBeInTheDocument();
    
    // Selecionar a AOCS_1 para vincular
    fireEvent.change(selectAocs, { target: { value: 'aocs_1' } });

    // Após selecionar, o formulário deve ser populado com os dados da AOCS.
    // O campo "Ordem de Compra" tem o placeholder "Ex: 38"
    const ordemCompraInput = screen.getByPlaceholderText('Ex: 38') as HTMLInputElement;
    expect(ordemCompraInput.value).toBe('38');

    // Mudar campos em pedidos
    fireEvent.change(ordemCompraInput, { target: { value: '39' } });
    expect(ordemCompraInput.value).toBe('39');
    
    const empenhoInput = screen.getByPlaceholderText('Ex: 182');
    fireEvent.change(empenhoInput, { target: { value: '183' } });
    
    const dataEnvioInput = screen.getByPlaceholderText('Ex: 27-jan.');
    fireEvent.change(dataEnvioInput, { target: { value: '28-jan.' } });
    
    const dotacaoInput = screen.getByPlaceholderText('Ex: Dotação 234');
    fireEvent.change(dotacaoInput, { target: { value: 'Dotação 235' } });
    
    const fonteInput = screen.getByPlaceholderText('Ex: FR 1.660.000');
    fireEvent.change(fonteInput, { target: { value: 'FR 2.000.000' } });

    fireEvent.submit(screen.getByRole('button', { name: /Salvar Registro/i }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(expect.objectContaining({ ordemCompra: '39', empenho: '183' }));
  });

  it('deve carregar dados de um item para edição (itemToEdit)', () => {
    render(<FormModal {...defaultProps} itemToEdit={mockAocsRecords[0]} />);
    
    expect(screen.getByText('Editar Registro')).toBeInTheDocument();
    const aocsInput = screen.getByPlaceholderText('Ex: 1') as HTMLInputElement;
    expect(aocsInput.value).toBe('10');
  });

  it('deve renderizar a aba Faturamento e carregar os dados ao vincular AOCS', () => {
    render(<FormModal {...defaultProps} activeTab="faturamento" />);
    
    expect(screen.getByText('Faturamento AOCS (Vincular NF/CI)')).toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');
    const selectAocs = selects[0];
    
    fireEvent.change(selectAocs, { target: { value: 'aocs_1' } });

    const nfInput = screen.getByPlaceholderText('Ex: 1377') as HTMLInputElement;
    expect(nfInput.value).toBe('1377');

    fireEvent.change(nfInput, { target: { value: '1378' } });
    
    const dataNfInput = screen.getByPlaceholderText('Ex: 28/01');
    fireEvent.change(dataNfInput, { target: { value: '29/01' } });
    
    const ciInput = screen.getByPlaceholderText('Ex: 20');
    fireEvent.change(ciInput, { target: { value: '21' } });
    
    fireEvent.submit(screen.getByRole('button', { name: /Salvar Registro/i }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(expect.objectContaining({ notaFiscal: '1378', numeroCI: '21' }));
  });

  it('deve alterar campos adicionais na aba AOCS', () => {
    render(<FormModal {...defaultProps} activeTab="aocs" />);
    
    const contratoInput = screen.getByPlaceholderText('Ex: ARP n° 022/2025');
    fireEvent.change(contratoInput, { target: { value: 'ARP 001' } });
    
    const processoInput = screen.getByPlaceholderText('Ex: Pregão Eletrônico n° 015/2025');
    fireEvent.change(processoInput, { target: { value: 'Pregão 002' } });

    fireEvent.submit(screen.getByRole('button', { name: /Salvar Registro/i }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(expect.objectContaining({ contratoArp: 'ARP 001', processo: 'Pregão 002' }));
  });

  it('deve alterar campos adicionais na aba CI', () => {
    render(<FormModal {...defaultProps} activeTab="ci" />);
    
    const ciInput = screen.getByPlaceholderText('Ex: 20');
    fireEvent.change(ciInput, { target: { value: '21' } });

    const dataCiInput = screen.getByPlaceholderText('Ex: 28/01');
    fireEvent.change(dataCiInput, { target: { value: '29/01' } });

    const selects = screen.getAllByRole('combobox');
    const contaBancariaSelect = selects[1];
    fireEvent.change(contaBancariaSelect, { target: { value: 'Conta X' } });
    
    const dataPagamentoInput = screen.getByPlaceholderText('Ex: 02/02');
    fireEvent.change(dataPagamentoInput, { target: { value: '03/02' } });
    
    const chaveAcessoInput = screen.getByPlaceholderText('Chave de acesso da NF');
    fireEvent.change(chaveAcessoInput, { target: { value: '123456' } });
    
    const statusSelects = screen.getAllByDisplayValue('Pendente');
    fireEvent.change(statusSelects[0], { target: { value: 'Pago' } });

    fireEvent.submit(screen.getByRole('button', { name: /Salvar Registro/i }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(expect.objectContaining({ ci: '21', status: 'Pago', chaveAcessoNF: '123456' }));
  });
});
