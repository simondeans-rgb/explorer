import { useEffect, useRef, useState } from 'react';
import { Trash2, Palette } from 'lucide-react';
import { cn } from '../lib/cn';
import {
  COLOR_CLASSES,
  COLOR_SWATCH,
  NOTE_COLORS,
  type Note as NoteType,
  type NoteColor,
} from '../types';

interface NoteProps {
  note: NoteType;
  tilt: number;
  onChange: (text: string) => void;
  onColorChange: (color: NoteColor) => void;
  onDelete: () => void;
}

export function Note({
  note,
  tilt,
  onChange,
  onColorChange,
  onDelete,
}: NoteProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
  }, [note.text]);

  return (
    <div
      style={{ ['--tilt' as string]: `${tilt}deg` }}
      className={cn(
        'group relative flex flex-col w-64 min-h-[16rem] p-4 pt-10 rounded-sm',
        'shadow-note hover:shadow-note-lift transition-shadow',
        'animate-pop-in',
        COLOR_CLASSES[note.color],
      )}
    >
      <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-12 rounded-sm bg-black/10" />

      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          aria-label="Change color"
          onClick={() => setPaletteOpen((v) => !v)}
          className="p-1.5 rounded-full hover:bg-black/10 text-black/60"
        >
          <Palette size={14} />
        </button>
        <button
          type="button"
          aria-label="Delete note"
          onClick={onDelete}
          className="p-1.5 rounded-full hover:bg-black/10 text-black/60"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {paletteOpen && (
        <div className="absolute top-10 right-2 z-10 flex gap-1 p-2 rounded-md bg-white/90 backdrop-blur shadow-note">
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Set color to ${c}`}
              onClick={() => {
                onColorChange(c);
                setPaletteOpen(false);
              }}
              style={{ backgroundColor: COLOR_SWATCH[c] }}
              className={cn(
                'h-5 w-5 rounded-full border border-black/10',
                c === note.color && 'ring-2 ring-black/40',
              )}
            />
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={note.text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write something…"
        className={cn(
          'flex-1 w-full bg-transparent outline-none border-0',
          'font-hand text-2xl leading-snug text-black/85 placeholder:text-black/30',
        )}
      />
    </div>
  );
}
