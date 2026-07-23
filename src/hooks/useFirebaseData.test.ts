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
  mockUpdateDoc,
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

  it('deve assinar a colecao registro_atividades em tempo real quando o usuario estiver logado', () => {
    const fakeUser = { uid: 'user_123', email: 'test@example.com' };
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      callback(fakeUser);
    });

    let registroCallback: any = null;
    mockOnSnapshot.mockImplementation((ref: any, callback: any) => {
      if (ref.name === 'registro_atividades') {
        registroCallback = callback;
      }
      return vi.fn();
    });

    const { result } = renderHook(() => useFirebaseData());

    act(() => {
      registroCallback({
        docs: [
          {
            data: () => ({ id: 'reg_1', titulo_atividade: 'Entrega de Bola', resumo: 'Entregue', data_inicio: '2026-01-01', data_fim: '2026-01-02', tecnico_responsavel: 'Jules' })
          }
        ]
      });
    });

    expect(result.current.registroAtividadesRecords).toEqual([
      { id: 'reg_1', titulo_atividade: 'Entrega de Bola', resumo: 'Entregue', data_inicio: '2026-01-01', data_fim: '2026-01-02', tecnico_responsavel: 'Jules' }
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

    expect(mockSetDoc).toHaveBeenCalledTimes(2);
    expect(mockSetDoc).toHaveBeenNthCalledWith(1,
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

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'aocs_123', collection: 'aocs' }),
      expect.objectContaining({ deletedAt: expect.any(String) })
    );
  });

  it('deve deletar múltiplos registros do Firestore se o usuário estiver logado', async () => {
    const fakeUser = { uid: 'user_123', email: 'test@example.com' };
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      callback(fakeUser);
    });

    const { result } = renderHook(() => useFirebaseData());

    await act(async () => {
      await result.current.deleteRecords('aocs', ['id_1', 'id_2']);
    });

    expect(mockWriteBatch).toHaveBeenCalled();
  });

  it('deve tratar erro ao carregar AOCS (onSnapshot error)', () => {
    const fakeUser = { uid: 'user_123', email: 'test@example.com' };
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      callback(fakeUser);
    });

    let aocsErrorCallback: any = null;
    mockOnSnapshot.mockImplementation((ref: any, callback: any, errorCallback: any) => {
      if (ref.name === 'aocs') {
        aocsErrorCallback = errorCallback;
      }
      return vi.fn();
    });

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useFirebaseData());

    act(() => {
      if (aocsErrorCallback) {
        aocsErrorCallback(new Error('Permission denied'));
      }
    });

    expect(consoleErrorMock).toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith('Ocorreu um erro ao carregar os dados de AOCS. Por favor, tente novamente mais tarde.');

    alertMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  it('deve tratar erro de login', async () => {
    mockSignInWithPopup.mockRejectedValueOnce(new Error('Login failed'));
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useFirebaseData());

    await act(async () => {
      await result.current.signIn();
    });

    expect(consoleErrorMock).toHaveBeenCalled();
    consoleErrorMock.mockRestore();
  });

  it('deve tratar erro ao salvar registro', async () => {
    const fakeUser = { uid: 'user_123', email: 'test@example.com' };
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      callback(fakeUser);
    });

    mockSetDoc.mockRejectedValueOnce(new Error('Save failed'));
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useFirebaseData());

    await act(async () => {
      await result.current.saveRecord('aocs', { id: '1' });
    });

    expect(alertMock).toHaveBeenCalledWith('Ocorreu um erro ao salvar o registro. Tente novamente mais tarde.');
    alertMock.mockRestore();
  });

  it('deve tratar erro ao deletar registro', async () => {
    const fakeUser = { uid: 'user_123', email: 'test@example.com' };
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      callback(fakeUser);
    });

    mockUpdateDoc.mockRejectedValueOnce(new Error('Delete failed'));
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useFirebaseData());

    await act(async () => {
      await result.current.deleteRecord('aocs', '1');
    });

    expect(alertMock).toHaveBeenCalledWith('Ocorreu um erro ao excluir o registro. Tente novamente mais tarde.');
    alertMock.mockRestore();
  });

  it('deve tratar erro ao deletar multiplos registros', async () => {
    const fakeUser = { uid: 'user_123', email: 'test@example.com' };
    mockOnAuthStateChanged.mockImplementationOnce((callback) => {
      callback(fakeUser);
    });

    mockWriteBatch.mockImplementationOnce(() => ({
      delete: vi.fn(),
      set: vi.fn(),
      update: vi.fn(),
      commit: vi.fn().mockRejectedValueOnce(new Error('Batch delete failed'))
    }));
    
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useFirebaseData());

    await act(async () => {
      await result.current.deleteRecords('aocs', ['1', '2']);
    });

    expect(alertMock).toHaveBeenCalledWith('Ocorreu um erro ao excluir os registros selecionados. Tente novamente mais tarde.');
    alertMock.mockRestore();
  });
});
