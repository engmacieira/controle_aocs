import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    pageSize: 10,
    onPageChange: vi.fn(),
    itemName: 'items',
  };

  it('renders nothing when totalPages is 1 or less', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with default props', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText(/Mostrando 1 a 10 de 50 items/i)).toBeInTheDocument();
    expect(screen.getByText('de 5')).toBeInTheDocument();
  });

  it('calls onPageChange with correct values when buttons are clicked', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    const firstPageBtn = screen.getByTitle('Primeira Página');
    const prevPageBtn = screen.getByTitle('Página Anterior');
    const nextPageBtn = screen.getByTitle('Próxima Página');
    const lastPageBtn = screen.getByTitle('Última Página');

    fireEvent.click(firstPageBtn);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(prevPageBtn);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);

    fireEvent.click(nextPageBtn);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);

    fireEvent.click(lastPageBtn);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(5);
  });

  it('disables prev/first buttons on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    expect(screen.getByTitle('Primeira Página')).toBeDisabled();
    expect(screen.getByTitle('Página Anterior')).toBeDisabled();
    expect(screen.getByTitle('Próxima Página')).not.toBeDisabled();
    expect(screen.getByTitle('Última Página')).not.toBeDisabled();
  });

  it('disables next/last buttons on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    
    expect(screen.getByTitle('Primeira Página')).not.toBeDisabled();
    expect(screen.getByTitle('Página Anterior')).not.toBeDisabled();
    expect(screen.getByTitle('Próxima Página')).toBeDisabled();
    expect(screen.getByTitle('Última Página')).toBeDisabled();
  });

  it('updates input value on change', () => {
    render(<Pagination {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: '3' } });
    expect(input).toHaveValue('3');
  });

  it('calls onPageChange when valid page is entered and Enter is pressed', () => {
    render(<Pagination {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it('resets input when invalid page is entered and Enter is pressed', () => {
    render(<Pagination {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(input).toHaveValue('1');
    expect(defaultProps.onPageChange).not.toHaveBeenCalledWith(10);
  });

  it('calls onPageChange when valid page is entered and input loses focus (blur)', () => {
    render(<Pagination {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.blur(input);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
  });

  it('resets input when invalid page is entered and input loses focus', () => {
    render(<Pagination {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);
    
    expect(input).toHaveValue('1');
  });
});
