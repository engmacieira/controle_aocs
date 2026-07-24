import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AocsRecord, CiRecord, ContaBancariaRecord, RegistroAtividadeRecord, LancamentoFuturo, AuditLogRecord } from '../types';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, User } from 'firebase/auth';

export function useFirebaseData() {
  const isMock = typeof window !== 'undefined' && localStorage.getItem('local_mock_mode') === 'true';

  // Mock mode helper to read/write from localStorage
  const getMockData = (key: string) => {
    const raw = localStorage.getItem('mock_' + key);
    return raw ? JSON.parse(raw) : [];
  };

  const saveMockData = (key: string, data: any[]) => {
    localStorage.setItem('mock_' + key, JSON.stringify(data));
  };
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [aocsRecords, setAocsRecords] = useState<AocsRecord[]>([]);
  const [ciRecords, setCiRecords] = useState<CiRecord[]>([]);
  const [extratoRecords, setExtratoRecords] = useState<any[]>([]);
  const [contasRecords, setContasRecords] = useState<ContaBancariaRecord[]>([]);
  const [registroAtividadesRecords, setRegistroAtividadesRecords] = useState<RegistroAtividadeRecord[]>([]);
  const [lancamentosFuturosRecords, setLancamentosFuturosRecords] = useState<LancamentoFuturo[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  useEffect(() => {
    if (isMock) {
      setUser({ email: 'tecnico.jules@municipio.gov.br', uid: 'mock_uid_jules' } as any);
      setLoading(false);
      return;
    }

    // Process redirect result if coming back from a redirect login flow
    getRedirectResult(auth).catch((error) => {
      if (error && error.code !== 'auth/popup-closed-by-user') {
        console.error('Redirect result error:', error);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is allowed
          const email = user.email?.toLowerCase() || '';
          const usersSnapshot = await getDocs(collection(db, 'usuarios_permitidos'));
          
          if (usersSnapshot.empty) {
            // First user ever becomes admin
            const id = email.replace(/[^a-z0-9]/g, '_');
            await setDoc(doc(db, 'usuarios_permitidos', id), {
              email: email,
              role: 'admin'
            });
            setUser(user);
          } else {
            // Check if email is in list
            const allowedUsers = usersSnapshot.docs.map(d => d.data().email?.toLowerCase());
            if (allowedUsers.includes(email)) {
              setUser(user);
            } else {
              alert(`O e-mail ${email} não possui permissão de acesso. Entre em contato com o administrador.`);
              await signOut(auth);
              setUser(null);
            }
          }
        } catch (error: any) {
          console.error('Auth verification error:', error);
          alert('Erro ao verificar permissões de acesso: ' + (error?.message || 'Acesso não autorizado ou erro de conexão.'));
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isMock]);

  useEffect(() => {
    if (!user) {
      setAocsRecords([]);
      setCiRecords([]);
      setExtratoRecords([]);
      setContasRecords([]);
      setRegistroAtividadesRecords([]);
      setLancamentosFuturosRecords([]);
      setAuditLogs([]);
      return;
    }

    if (isMock) {
      // Load mock lists
      setAocsRecords(getMockData('aocs'));
      setCiRecords(getMockData('ci'));
      setExtratoRecords(getMockData('extrato'));
      setContasRecords(getMockData('contas').length ? getMockData('contas') : [{ id: '1', nome: 'Banco do Brasil - Geral' }]);
      setRegistroAtividadesRecords(getMockData('registro_atividades'));
      setLancamentosFuturosRecords(getMockData('lancamentos_futuros'));
      setAuditLogs(getMockData('audit_logs'));
      
      // Periodically poll localStorage for modifications
      const interval = setInterval(() => {
        setAocsRecords(getMockData('aocs'));
        setCiRecords(getMockData('ci'));
        setExtratoRecords(getMockData('extrato'));
        setContasRecords(getMockData('contas').length ? getMockData('contas') : [{ id: '1', nome: 'Banco do Brasil - Geral' }]);
        setRegistroAtividadesRecords(getMockData('registro_atividades'));
        setLancamentosFuturosRecords(getMockData('lancamentos_futuros'));
        setAuditLogs(getMockData('audit_logs'));
      }, 500);

      return () => clearInterval(interval);
    }

    const unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(collection(db, 'aocs'), (snap) => {
      setAocsRecords(snap.docs.map(d => d.data() as AocsRecord).filter((r: any) => !r.deletedAt));
    }, (err) => {
      console.error('Error loading AOCS:', err);
      alert('Ocorreu um erro ao carregar os dados de AOCS. Por favor, tente novamente mais tarde.');
    }));

    unsubs.push(onSnapshot(collection(db, 'ci'), (snap) => {
      setCiRecords(snap.docs.map(d => d.data() as CiRecord).filter((r: any) => !r.deletedAt));
    }, (err) => {
      console.error('Error loading CI:', err);
      alert('Ocorreu um erro ao carregar os dados de CI. Por favor, tente novamente mais tarde.');
    }));

    unsubs.push(onSnapshot(collection(db, 'extrato'), (snap) => {
      setExtratoRecords(snap.docs.map(d => d.data() as any).filter((r: any) => !r.deletedAt));
    }, (err) => {
      console.error('Error loading extrato:', err);
      alert('Ocorreu um erro ao carregar os dados do extrato. Por favor, tente novamente mais tarde.');
    }));

    unsubs.push(onSnapshot(collection(db, 'registro_atividades'), (snap) => {
      setRegistroAtividadesRecords(snap.docs.map(d => d.data() as RegistroAtividadeRecord).filter((r: any) => !r.deletedAt));
    }, (err) => {
      console.error('Error loading registro_atividades:', err);
      alert('Ocorreu um erro ao carregar os dados de Registro de Atividades. Por favor, tente novamente mais tarde.');
    }));
    
    unsubs.push(onSnapshot(collection(db, 'lancamentos_futuros'), (snap) => {
      setLancamentosFuturosRecords(snap.docs.map(d => d.data() as LancamentoFuturo).filter((r: any) => !r.deletedAt));
    }, (err) => {
      console.error('Error loading lancamentos_futuros:', err);
      alert('Ocorreu um erro ao carregar os lançamentos futuros. Por favor, tente novamente mais tarde.');
    }));

    unsubs.push(onSnapshot(collection(db, 'contas'), (snap) => {
      setContasRecords(snap.docs.map(d => d.data() as ContaBancariaRecord).filter((r: any) => !r.deletedAt));
    }, (err) => {
      console.error('Error loading contas:', err);
      alert('Ocorreu um erro ao carregar as contas bancárias. Por favor, tente novamente mais tarde.');
    }));

    unsubs.push(onSnapshot(collection(db, 'audit_logs'), (snap) => {
      setAuditLogs(snap.docs.map(d => d.data() as AuditLogRecord));
    }, (err) => {
      console.error('Error loading audit_logs:', err);
    }));

    return () => unsubs.forEach(fn => fn());
  }, [user]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.warn('Popup login error/blocked, attempting redirect fallback:', error);
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: any) {
          console.error('Redirect login error', redirectErr);
          alert('Ocorreu um erro ao fazer login: ' + (redirectErr.message || 'Erro desconhecido.'));
        }
      } else {
        console.error('Login error', error);
        alert('Ocorreu um erro ao fazer login: ' + (error.message || 'Erro desconhecido.'));
      }
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const saveRecord = async (collectionName: string, item: any) => {
    if (!user) return;
    const isNew = !item.id;
    const id = isNew ? `${collectionName}_${Date.now()}` : item.id;
    const newItem = { ...item, id };
    if (isMock) {
      const data = getMockData(collectionName);
      const index = data.findIndex(d => d.id === id);
      if (index >= 0) {
        data[index] = newItem;
      } else {
        data.push(newItem);
      }
      saveMockData(collectionName, data);
      return;
    }
    try {
      let previousData = null;
      if (!isNew) {
        const docSnap = await getDoc(doc(db, collectionName, id));
        if (docSnap.exists()) {
          previousData = docSnap.data();
        }
      }

      await setDoc(doc(db, collectionName, id), newItem);

      const logId = doc(collection(db, 'audit_logs')).id;
      const logRecord: AuditLogRecord = {
        id: logId,
        userEmail: user.email || 'unknown',
        action: isNew ? 'CREATE' : 'UPDATE',
        collectionName,
        recordId: id,
        timestamp: new Date().toISOString(),
        previousData: previousData || null,
        newData: newItem
      };
      await setDoc(doc(db, 'audit_logs', logId), logRecord);
    } catch (e: any) {
      console.error('Error saving:', e);
      alert('Ocorreu um erro ao salvar o registro. Tente novamente mais tarde.');
    }
  };

  const deleteRecord = async (collectionName: string, id: string) => {
    if (!user) return;
    if (isMock) {
      const data = getMockData(collectionName);
      const filtered = data.filter(d => d.id !== id);
      saveMockData(collectionName, filtered);
      return;
    }
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      let previousData = null;
      if (docSnap.exists()) {
        previousData = docSnap.data();
      }

      const deletedAt = new Date().toISOString();
      await updateDoc(docRef, { deletedAt });

      const logId = doc(collection(db, 'audit_logs')).id;
      const logRecord: AuditLogRecord = {
        id: logId,
        userEmail: user.email || 'unknown',
        action: 'DELETE',
        collectionName,
        recordId: id,
        timestamp: deletedAt,
        previousData: previousData || null,
        newData: { deletedAt }
      };
      await setDoc(doc(db, 'audit_logs', logId), logRecord);
    } catch (e: any) {
      console.error('Error deleting:', e);
      alert('Ocorreu um erro ao excluir o registro. Tente novamente mais tarde.');
    }
  };

  const deleteRecords = async (collectionName: string, ids: string[]) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      for (const id of ids) {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        let previousData = null;
        if (docSnap.exists()) {
          previousData = docSnap.data();
        }

        const deletedAt = new Date().toISOString();
        batch.update(docRef, { deletedAt });

        const logId = doc(collection(db, 'audit_logs')).id;
        const logRecord: AuditLogRecord = {
          id: logId,
          userEmail: user.email || 'unknown',
          action: 'DELETE',
          collectionName,
          recordId: id,
          timestamp: deletedAt,
          previousData: previousData || null,
          newData: { deletedAt }
        };
        batch.set(doc(db, 'audit_logs', logId), logRecord);
      }
      await batch.commit();
    } catch (e: any) {
      console.error('Error deleting records:', e);
      alert('Ocorreu um erro ao excluir os registros selecionados. Tente novamente mais tarde.');
    }
  };

  return {
    user,
    loading,
    signIn,
    logOut,
    aocsRecords,
    ciRecords,
    extratoRecords,
    contasRecords,
    registroAtividadesRecords,
    lancamentosFuturosRecords,
    auditLogs,
    saveRecord,
    deleteRecord,
    deleteRecords
  };
}
