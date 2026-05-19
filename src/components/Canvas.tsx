import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Note } from './Note';
import type { Note as NoteType } from '../types';

interface CanvasProps {
  notes: NoteType[];
  topId: string | null;
  onUpdate: (
    id: string,
    patch: Partial<
      Pick<NoteType, 'body' | 'x' | 'y' | 'width' | 'height' | 'color' | 'zIndex'>
    >,
  ) => void;
  onFocus: (id: string) => void;
  onDelete: (id: string) => void;
}

function tiltFor(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return ((hash % 9) - 4) * 0.45;
}

export function Canvas({
  notes,
  topId,
  onUpdate,
  onFocus,
  onDelete,
}: CanvasProps) {
  const innerRef = useRef<HTMLDivElement>(null);

  const bounds = useMemo(() => {
    let maxX = 0;
    let maxY = 0;
    for (const n of notes) {
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    }
    return {
      width: Math.max(maxX + 400, 1200),
      height: Math.max(maxY + 400, 800),
    };
  }, [notes]);

  useEffect(() => {
    if (!innerRef.current) return;
    innerRef.current.style.width = `${bounds.width}px`;
    innerRef.current.style.height = `${bounds.height}px`;
  }, [bounds]);

  return (
    <div className="canvas-bg fixed inset-0 top-14 overflow-auto no-scrollbar">
      <div ref={innerRef} className="relative">
        <AnimatePresence>
          {notes.map((n) => (
            <Note
              key={n.id}
              note={n}
              tilt={tiltFor(n.id)}
              isTop={n.id === topId}
              onUpdate={(patch) => onUpdate(n.id, patch)}
              onFocus={() => onFocus(n.id)}
              onDelete={() => onDelete(n.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
