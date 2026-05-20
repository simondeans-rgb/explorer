import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Note, NoteColor } from '../types';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, NOTE_COLORS } from '../types';

const COLLECTION = 'notes';

export function subscribeNotes(
  userId: string,
  onChange: (notes: Note[]) => void,
): () => void {
  if (!db) return () => undefined;
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (snap: QuerySnapshot) => {
    const notes: Note[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        title: data.title ?? '',
        body: data.body ?? '',
        x: data.x ?? 0,
        y: data.y ?? 0,
        width: data.width ?? DEFAULT_WIDTH,
        height: data.height ?? DEFAULT_HEIGHT,
        color: data.color ?? 'yellow',
        inkColor: data.inkColor ?? 'auto',
        zIndex: data.zIndex ?? 1,
        createdAt:
          (data.createdAt?.toMillis?.() as number | undefined) ?? Date.now(),
        updatedAt:
          (data.updatedAt?.toMillis?.() as number | undefined) ?? Date.now(),
      } satisfies Note;
    });
    onChange(notes);
  });
}

interface CreateOpts {
  userId: string;
  x: number;
  y: number;
  zIndex: number;
  color?: NoteColor;
}

export async function createNote(opts: CreateOpts): Promise<string | null> {
  if (!db) return null;
  const color =
    opts.color ?? NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
  const ref = await addDoc(collection(db, COLLECTION), {
    userId: opts.userId,
    body: '',
    x: opts.x,
    y: opts.y,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    color,
    zIndex: opts.zIndex,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNote(
  id: string,
  patch: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>,
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, COLLECTION, id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, COLLECTION, id));
}
