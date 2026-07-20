import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFirebaseData } from './useFirebaseData';
import { 
  mockOnAuthStateChanged, 
  mockSignInWithPopup, 
  mockSignOut, 
  mockOnSnapshot,
  mockSetDoc,
  mockDeleteDoc,
  mockWriteBatch
} from '../test/mocks/firebase';

describe('useFirebaseData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com o estado correto de carregamento e sem usuário logado', () => {
    // Simular que o observador de autenticação ainda não emitiu valor
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      // Não faz nada imediatamente
    });

    const { result } = renderHook(() => useFirebaseData());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.aocsRecords).toEqual([]);
    expect(result.current.ciRecords).toEqual([]);
  });

  it('deve atualizar o usuário e parar de carregar quando o onAuthStateChanged retornar o usuário', () => {
    const fakeUser = { uid: 'user_123', email: 'test@example.com' };
    
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      callback(fakeUser);
    });

    const { result } = renderHook(() => useFirebaseData());

    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.loading).toBe(false);
  });

  it('deve assinar as coleções do Firestore em tempo real quando o usuário estiver logado', () => {
    const fakeUser = { uid: 'user_123', email: 'test@example.com' };
    
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      callback(fakeUser);
    });

    let aocsCallback: any = null;
    let ciCallback: any = null;

    mockOnSnapshot.mockImplementation((ref: any, callback: any) => {
      if (ref.name === 'aocs') {
        aocsCallback = callback;
      } else if (ref.name === 'ci') {
        ciCallback = callback;
      }
      return vi.fn();
    });

    const { result } = renderHook(() => useFirebaseData());

    // Disparar atualizações do onSnapshot manualmente
    act(() => {
      aocsCallback({
        docs: [
          {
            data: () => ({ id: 'aocs_1', aocs: '10', empresa: 'Empresa Teste', valor: 500 })
          }
        ]
      });

      ciCallback({
        docs: [
          {
            data: () => ({ id: 'ci_1', ci: '1', empresa: 'Empresa Teste CI', valor: 200 })
          }
        ]
      });
    });

    expect(result.current.aocsRecords).toEqual([
      { id: 'aocs_1', aocs: '10', empresa: 'Empresa Teste', valor: 500 }
    ]);
    expect(result.current.ciRecords).toEqual([
      { id: 'ci_1', ci: '1', empresa: 'Empresa Teste CI', valor: 200 }
    ]);
  });

  it('deve chamar as funções de login e logout do Firebase', async () => {
    const { result } = renderHook(() => useFirebaseData());

    await act(async () => {
      await result.current.signIn();
    });
    expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.logOut();
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('deve salvar um registro no Firestore se o usuário estiver logado', async () => {
    const fakeUser = { uid: 'user_123', email: 'test@example.com' };
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      callback(fakeUser);
    });

    const { result } = renderHook(() => useFirebaseData());

    const itemToSave = { aocs: '12', empresa: 'Nova Empresa', valor: 1000 };

    await act(async () => {
      await result.current.saveRecord('aocs', itemToSave);
    });

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'aocs' }),
      expect.objectContaining({ aocs: '12', empresa: 'Nova Empresa', valor: 1000 })
    );
  });

  it('deve deletar um registro do Firestore se o usuário estiver logado', async () => {
    const fakeUser = { uid: 'user_123', email: 'test@example.com' };
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      callback(fakeUser);
    });

    const { result } = renderHook(() => useFirebaseData());

    await act(async () => {
      await result.current.deleteRecord('aocs', 'aocs_123');
    });

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    expect(mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'aocs_123', collection: 'aocs' })
    );
  });
});
