import { initializeApp } from "firebase/app";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBto_kwZ-ruSshaqg1JgAHBGVkuFtEv7Fo",
  authDomain: "appfinance-e6d2d.firebaseapp.com",
  projectId: "appfinance-e6d2d",
  storageBucket: "appfinance-e6d2d.firebasestorage.app",
  messagingSenderId: "1005003387876",
  appId: "1:1005003387876:web:5b6294934d5b88d4ea0df1"
};

function createE2eFirebase() {
  let idSeq = 1;
  const listeners = new Set<(user: unknown) => void>();
  const snapshots = new Map<string, Set<(snapshot: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }) => void>>();
  const data = new Map<string, Record<string, Record<string, unknown>>>();
  const fakeAuth = { currentUser: null as null | { uid: string; email: string; displayName: string } };
  const fakeDb = "e2e-db";

  const collectionPath = (...segments: string[]) => segments.join("/");
  const docPath = (...segments: string[]) => segments.join("/");
  const collectionFromDoc = (path: string) => path.split("/").slice(0, -1).join("/");
  const docId = (path: string) => path.split("/").at(-1) || "";
  const isDocPath = (path: string) => path.split("/").length % 2 === 0;
  const docValue = (path: string) => (data.get(collectionFromDoc(path)) || {})[docId(path)] || {};
  const snapshotFor = (path: string) => ({
    docs: Object.entries(data.get(path) || {}).map(([id, value]) => ({ id, data: () => value }))
  });
  const notifyCollection = (path: string) => {
    const snapshot = snapshotFor(path);
    for (const cb of snapshots.get(path) || []) cb(snapshot);
  };
  const notifyAuth = () => {
    for (const cb of listeners) cb(fakeAuth.currentUser);
  };
  const setCurrentUser = (email: string, displayName = "Felipe") => {
    fakeAuth.currentUser = { uid: "e2e-user", email, displayName };
    notifyAuth();
    return fakeAuth.currentUser;
  };

  return {
    app: { name: "e2e-app" },
    auth: fakeAuth,
    db: fakeDb,
    fs: {
      addDoc: async (collectionRef: unknown, value: Record<string, unknown>) => {
        const path = String(collectionRef);
        const id = "e2e-" + idSeq++;
        data.set(path, { ...(data.get(path) || {}), [id]: value });
        notifyCollection(path);
        return { id };
      },
      arrayUnion: (...values: string[]) => values,
      collection: (_db: unknown, ...segments: string[]) => collectionPath(...segments),
      deleteDoc: async (docRef: unknown) => {
        const path = String(docRef);
        const collectionRef = collectionFromDoc(path);
        const docs = { ...(data.get(collectionRef) || {}) };
        delete docs[docId(path)];
        data.set(collectionRef, docs);
        notifyCollection(collectionRef);
      },
      doc: (_db: unknown, ...segments: string[]) => docPath(...segments),
      getDoc: async (docRef: unknown) => {
        const value = docValue(String(docRef));
        return { exists: () => Object.keys(value).length > 0, data: () => value };
      },
      getDocs: async (collectionRef: unknown) => snapshotFor(String(collectionRef)),
      onSnapshot: (ref: unknown, next: (snapshot: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }) => void) => {
        const path = typeof ref === "string" ? ref : String((ref as { ref?: unknown }).ref || ref);
        if (isDocPath(path)) {
          const value = docValue(path);
          next({ exists: () => Object.keys(value).length > 0, data: () => value } as unknown as { docs: Array<{ id: string; data: () => Record<string, unknown> }> });
          return () => {};
        }
        const bucket = snapshots.get(path) || new Set();
        bucket.add(next);
        snapshots.set(path, bucket);
        next(snapshotFor(path));
        return () => bucket.delete(next);
      },
      query: (ref: unknown, ...parts: unknown[]) => ({ ref, parts }),
      setDoc: async (docRef: unknown, value: Record<string, unknown>) => {
        const path = String(docRef);
        const collectionRef = collectionFromDoc(path);
        data.set(collectionRef, { ...(data.get(collectionRef) || {}), [docId(path)]: value });
        notifyCollection(collectionRef);
      },
      updateDoc: async (docRef: unknown, value: Record<string, unknown>) => {
        const path = String(docRef);
        const collectionRef = collectionFromDoc(path);
        const docs = { ...(data.get(collectionRef) || {}) };
        docs[docId(path)] = { ...(docs[docId(path)] || {}), ...value };
        data.set(collectionRef, docs);
        notifyCollection(collectionRef);
      },
      where: (field: string, op: string, value: unknown) => ({ field, op, value })
    },
    authApi: {
      createUserWithEmailAndPassword: async (_auth: unknown, email: string) => ({ user: setCurrentUser(email) }),
      onAuthStateChanged: (_auth: unknown, cb: (user: unknown) => void) => {
        listeners.add(cb);
        cb(fakeAuth.currentUser);
        return () => listeners.delete(cb);
      },
      signInWithEmailAndPassword: async (_auth: unknown, email: string) => ({ user: setCurrentUser(email) }),
      signOut: async () => {
        fakeAuth.currentUser = null;
        notifyAuth();
      },
      updateProfile: async (user: { displayName?: string }, value: { displayName: string }) => {
        user.displayName = value.displayName;
        if (fakeAuth.currentUser) fakeAuth.currentUser.displayName = value.displayName;
      }
    }
  };
}

const e2eFirebase = import.meta.env.VITE_E2E === "1" ? createE2eFirebase() : null;
const realFirebase = e2eFirebase
  ? null
  : (() => {
      const realApp = initializeApp(firebaseConfig);
      return {
        app: realApp,
        db: getFirestore(realApp),
        auth: getAuth(realApp),
        fs: { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, setDoc, query, where, arrayUnion },
        authApi: { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile }
      };
    })();
const firebaseRuntime = (e2eFirebase || realFirebase)!;
const { app, auth, authApi, db, fs } = firebaseRuntime;

export { app, auth, authApi, db, fs };
