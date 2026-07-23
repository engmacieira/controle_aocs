import { vi } from 'vitest';

// Mocks do Firebase SDK v9/v10+ compatíveis com modular API
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

// Mock do Firebase Auth
export const mockOnAuthStateChanged = vi.fn();
export const mockSignInWithPopup = vi.fn();
export const mockSignOut = vi.fn();

// Usando uma classe real de JS no mock
class MockGoogleAuthProvider {}

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: (auth: any, callback: any) => {
    mockOnAuthStateChanged(callback);
    return vi.fn(); // unsubscribe function
  },
  signInWithPopup: (auth: any, provider: any) => mockSignInWithPopup(auth, provider),
  signOut: (auth: any) => mockSignOut(auth),
  GoogleAuthProvider: MockGoogleAuthProvider,
}));

// Mock do Firestore
export const mockOnSnapshot = vi.fn();
export const mockDoc = vi.fn((db: any, collection: string, id?: string) => ({ id, collection }));
export const mockCollection = vi.fn((db: any, name: string) => ({ name }));
export const mockSetDoc = vi.fn();
export const mockDeleteDoc = vi.fn();
export const mockUpdateDoc = vi.fn();
export const mockGetDoc = vi.fn((_ref?: any) => Promise.resolve({ exists: () => false, data: () => ({}) }));
export const mockWriteBatch = vi.fn(() => ({
  delete: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  commit: vi.fn(() => Promise.resolve()),
}));
export const mockGetDocs = vi.fn();

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: (db: any, name: string) => mockCollection(db, name),
  doc: (db: any, col: string, id?: string) => mockDoc(db, col, id),
  setDoc: (docRef: any, data: any) => mockSetDoc(docRef, data),
  deleteDoc: (docRef: any) => mockDeleteDoc(docRef),
  updateDoc: (docRef: any, data: any) => mockUpdateDoc(docRef, data),
  getDoc: (docRef: any) => mockGetDoc(docRef),
  writeBatch: () => mockWriteBatch(),
  getDocs: (ref: any) => mockGetDocs(ref),
  onSnapshot: (ref: any, callback: any, errCallback?: any) => {
    mockOnSnapshot(ref, callback, errCallback);
    return vi.fn(); // unsubscribe function
  },
}));
