import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AocsRecord, CiRecord, ContaBancariaRecord, RegistroAtividadeRecord, LancamentoFuturo } from '../types';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

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

  useEffect(() => {
    if (isMock) {
      setUser({ email: 'tecnico.jules@municipio.gov.br', uid: 'mock_uid_jules' } as any);
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
      
      // Periodically poll localStorage for modifications
      const interval = setInterval(() => {
        setAocsRecords(getMockData('aocs'));
        setCiRecords(getMockData('ci'));
        setExtratoRecords(getMockData('extrato'));
        setContasRecords(getMockData('contas').length ? getMockData('contas') : [{ id: '1', nome: 'Banco do Brasil - Geral' }]);
        setRegistroAtividadesRecords(getMockData('registro_atividades'));
        setLancamentosFuturosRecords(getMockData('lancamentos_futuros'));
      }, 500);

      return () => clearInterval(interval);
    }

    const unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(collection(db, 'aocs'), (snap) => {
      setAocsRecords(snap.docs.map(d => d.data() as AocsRecord));
    }, (err) => {
      console.error('Error loading AOCS:', err);
      alert('Ocorreu um erro ao carregar os dados de AOCS. Por favor, tente novamente mais tarde.');
    }));

    unsubs.push(onSnapshot(collection(db, 'ci'), (snap) => {
      setCiRecords(snap.docs.map(d => d.data() as CiRecord));
    }, (err) => {
      console.error('Error loading CI:', err);
      alert('Ocorreu um erro ao carregar os dados de CI. Por favor, tente novamente mais tarde.');
    }));

    unsubs.push(onSnapshot(collection(db, 'extrato'), (snap) => {
      setExtratoRecords(snap.docs.map(d => d.data() as any));
    }, (err) => {
      console.error('Error loading extrato:', err);
      alert('Ocorreu um erro ao carregar os dados do extrato. Por favor, tente novamente mais tarde.');
    }));

    unsubs.push(onSnapshot(collection(db, 'registro_atividades'), (snap) => {
      setRegistroAtividadesRecords(snap.docs.map(d => d.data() as RegistroAtividadeRecord));
    }, (err) => {
      console.error('Error loading registro_atividades:', err);
      alert('Ocorreu um erro ao carregar os dados de Registro de Atividades. Por favor, tente novamente mais tarde.');
    }));
    
    unsubs.push(onSnapshot(collection(db, 'lancamentos_futuros'), (snap) => {
      setLancamentosFuturosRecords(snap.docs.map(d => d.data() as LancamentoFuturo));
    }, (err) => {
      console.error('Error loading lancamentos_futuros:', err);
      alert('Ocorreu um erro ao carregar os lançamentos futuros. Por favor, tente novamente mais tarde.');
    }));

    unsubs.push(onSnapshot(collection(db, 'contas'), (snap) => {
      setContasRecords(snap.docs.map(d => d.data() as ContaBancariaRecord));
    }, (err) => {
      console.error('Error loading contas:', err);
      alert('Ocorreu um erro ao carregar as contas bancárias. Por favor, tente novamente mais tarde.');
    }));

    return () => unsubs.forEach(fn => fn());
  }, [user]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error', error);
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
      await setDoc(doc(db, collectionName, id), newItem);
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
      await deleteDoc(doc(db, collectionName, id));
    } catch (e: any) {
      console.error('Error deleting:', e);
      alert('Ocorreu um erro ao excluir o registro. Tente novamente mais tarde.');
    }
  };

  const deleteRecords = async (collectionName: string, ids: string[]) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.delete(doc(db, collectionName, id));
      });
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
    saveRecord,
    deleteRecord,
    deleteRecords
  };
}
