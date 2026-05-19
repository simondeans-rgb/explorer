import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { useAuth } from '../contexts/AuthContext';
import { useNotes } from '../hooks/useNotes';
import { createNote, deleteNote, updateNote } from '../lib/notes';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, type Note } from '../types';

export function Board() {
  const { user } = useAuth();
  const { notes, loading } = useNotes(user?.uid);
  const [topId, setTopId] = useState<string | null>(null);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => a.zIndex - b.zIndex),
    [notes],
  );

  const maxZ = useMemo(
    () => notes.reduce((m, n) => Math.max(m, n.zIndex), 0),
    [notes],
  );

  const handleAdd = useCallback(async () => {
    if (!user) return;
    const scroller = document.querySelector('.canvas-bg') as HTMLElement | null;
    const sx = scroller?.scrollLeft ?? 0;
    const sy = scroller?.scrollTop ?? 0;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const jitterX = (Math.random() - 0.5) * 60;
    const jitterY = (Math.random() - 0.5) * 40;
    const x = Math.max(20, sx + vw / 2 - DEFAULT_WIDTH / 2 + jitterX);
    const y = Math.max(20, sy + vh / 2 - DEFAULT_HEIGHT / 2 + jitterY - 28);
    const id = await createNote({
      userId: user.uid,
      x,
      y,
      zIndex: maxZ + 1,
    });
    if (id) setTopId(id);
  }, [user, maxZ]);

  const handleUpdate = useCallback(
    (id: string, patch: Partial<Note>) => {
      void updateNote(id, patch);
    },
    [],
  );

  const handleFocus = useCallback(
    (id: string) => {
      setTopId(id);
      const target = notes.find((n) => n.id === id);
      if (target && target.zIndex < maxZ) {
        void updateNote(id, { zIndex: maxZ + 1 });
      }
    },
    [notes, maxZ],
  );

  const handleDelete = useCallback((id: string) => {
    void deleteNote(id);
  }, []);

  return (
    <>
      <Toolbar count={notes.length} onAdd={handleAdd} />
      <Canvas
        notes={sortedNotes}
        topId={topId}
        onUpdate={handleUpdate}
        onFocus={handleFocus}
        onDelete={handleDelete}
      />
      {!loading && notes.length === 0 && (
        <EmptyState onAdd={handleAdd} />
      )}
      {loading && <Loading />}
    </>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="canvas-bg fixed inset-0 top-14 flex items-center justify-center pointer-events-none">
      <div className="text-center animate-fade-in pointer-events-auto">
        <p className="font-hand text-5xl text-black/55 dark:text-white/55 mb-3">
          Your board is empty.
        </p>
        <p className="text-sm text-black/45 dark:text-white/45 mb-6">
          Drop a note anywhere. It'll sync to every device you sign in on.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-90"
        >
          <Plus size={16} /> Add a note
        </button>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="canvas-bg fixed inset-0 top-14 flex items-center justify-center">
      <p className="text-sm text-black/50 dark:text-white/50 animate-fade-in">
        Loading your notes…
      </p>
    </div>
  );
}
