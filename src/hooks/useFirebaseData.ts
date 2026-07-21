import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AocsRecord, CiRecord, ContaBancariaRecord } from '../types';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

export function useFirebaseData() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [aocsRecords, setAocsRecords] = useState<AocsRecord[]>([]);
  const [ciRecords, setCiRecords] = useState<CiRecord[]>([]);
  const [extratoRecords, setExtratoRecords] = useState<any[]>([]);
  const [contasRecords, setContasRecords] = useState<ContaBancariaRecord[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setAocsRecords([]);
      setCiRecords([]);
      setExtratoRecords([]);
      setContasRecords([]);
      return;
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
    try {
      await setDoc(doc(db, collectionName, id), newItem);
    } catch (e: any) {
      console.error('Error saving:', e);
      alert('Ocorreu um erro ao salvar o registro. Tente novamente mais tarde.');
    }
  };

  const deleteRecord = async (collectionName: string, id: string) => {
    if (!user) return;
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
    saveRecord,
    deleteRecord,
    deleteRecords
  };
}
