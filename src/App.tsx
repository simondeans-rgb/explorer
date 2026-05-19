import { useEffect, useMemo, useState } from 'react';
import { Note } from './components/Note';
import { Toolbar } from './components/Toolbar';
import { loadNotes, newId, saveNotes } from './lib/storage';
import { NOTE_COLORS, type Note as NoteType, type NoteColor } from './types';

function randomColor(): NoteColor {
  return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
}

export default function App() {
  const [notes, setNotes] = useState<NoteType[]>(() => loadNotes());

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const tilts = useMemo(() => {
    return notes.map((n) => {
      let hash = 0;
      for (let i = 0; i < n.id.length; i++) {
        hash = (hash * 31 + n.id.charCodeAt(i)) | 0;
      }
      return ((hash % 7) - 3) * 0.6;
    });
  }, [notes]);

  function addNote() {
    const now = Date.now();
    const note: NoteType = {
      id: newId(),
      text: '',
      color: randomColor(),
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
  }

  function updateNote(id: string, patch: Partial<NoteType>) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
      ),
    );
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="min-h-full flex flex-col">
      <Toolbar count={notes.length} onAdd={addNote} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {notes.length === 0 ? (
          <EmptyState onAdd={addNote} />
        ) : (
          <div className="flex flex-wrap gap-6">
            {notes.map((n, i) => (
              <Note
                key={n.id}
                note={n}
                tilt={tilts[i] ?? 0}
                onChange={(text) => updateNote(n.id, { text })}
                onColorChange={(color) => updateNote(n.id, { color })}
                onDelete={() => deleteNote(n.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-24 animate-fade-in">
      <p className="font-hand text-4xl text-black/70 mb-2">
        Your board is empty.
      </p>
      <p className="text-black/50 mb-6">
        Jot something down — it's saved in your browser.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/85 text-white font-medium hover:bg-black transition-colors"
      >
        Add your first note
      </button>
    </div>
  );
}
