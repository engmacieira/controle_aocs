import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AocsRecord, CiRecord } from '../types';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

export function useFirebaseData() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [aocsRecords, setAocsRecords] = useState<AocsRecord[]>([]);
  const [ciRecords, setCiRecords] = useState<CiRecord[]>([]);

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
      return;
    }

    const unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(collection(db, 'aocs'), (snap) => {
      setAocsRecords(snap.docs.map(d => d.data() as AocsRecord));
    }, (err) => {
      console.error(err);
      alert('Error loading AOCS: ' + err.message);
    }));

    unsubs.push(onSnapshot(collection(db, 'ci'), (snap) => {
      setCiRecords(snap.docs.map(d => d.data() as CiRecord));
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
      console.error(e);
      alert('Error saving: ' + e.message);
    }
  };

  const deleteRecord = async (collectionName: string, id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (e: any) {
      console.error(e);
      alert('Error deleting: ' + e.message);
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
      console.error(e);
      alert('Error deleting records: ' + e.message);
    }
  };


  return {
    user,
    loading,
    signIn,
    logOut,
    aocsRecords,
    ciRecords,
    saveRecord,
    deleteRecord,
    deleteRecords
  };
}
