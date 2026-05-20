import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as RPointerEvent,
} from 'react';
import {
  motion,
  useMotionValue,
  type PanInfo,
} from 'framer-motion';
import { Palette, Trash2 } from 'lucide-react';
import { cn } from '../lib/cn';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { useTheme } from '../contexts/ThemeContext';
import {
  COLOR_SPEC,
  INK_COLORS,
  MIN_HEIGHT,
  MIN_WIDTH,
  NOTE_COLORS,
  type InkColor,
  type Note as NoteType,
  type NoteColor,
} from '../types';

interface NoteProps {
  note: NoteType;
  tilt: number;
  isTop: boolean;
  onUpdate: (
    patch: Partial<Pick<NoteType, 'title' | 'body' | 'x' | 'y' | 'width' | 'height' | 'color' | 'inkColor' | 'zIndex'>>,
  ) => void;
  onFocus: () => void;
  onDelete: () => void;
}

export function Note({
  note,
  tilt,
  isTop,
  onUpdate,
  onFocus,
  onDelete,
}: NoteProps) {
  const { theme } = useTheme();
  const spec = COLOR_SPEC[note.color];
  const bg = theme === 'dark' ? spec.dark : spec.light;
  const autoInk = theme === 'dark' ? spec.inkDark : spec.ink;
  const ink = note.inkColor === 'black' ? '#000000' : autoInk;

  const x = useMotionValue(note.x);
  const y = useMotionValue(note.y);
  const [size, setSize] = useState({ w: note.width, h: note.height });

  const [title, setTitle] = useState(note.title ?? '');
  const [text, setText] = useState(note.body);
  const [editing, setEditing] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    x.set(note.x);
  }, [note.x, x]);
  useEffect(() => {
    y.set(note.y);
  }, [note.y, y]);
  useEffect(() => {
    setSize({ w: note.width, h: note.height });
  }, [note.width, note.height]);

  useEffect(() => {
    if (!editing && text !== note.body) setText(note.body);
  }, [note.body, editing, text]);
  useEffect(() => {
    const remote = note.title ?? '';
    if (!editing && title !== remote) setTitle(remote);
  }, [note.title, editing, title]);

  const debouncedSaveBody = useDebouncedCallback((body: string) => {
    onUpdate({ body });
  }, 500);
  const debouncedSaveTitle = useDebouncedCallback((t: string) => {
    onUpdate({ title: t });
  }, 500);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const nx = note.x + info.offset.x;
    const ny = note.y + info.offset.y;
    x.set(nx);
    y.set(ny);
    onUpdate({ x: nx, y: ny });
  }

  function handleResizeStart(e: RPointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.w;
    const startH = size.h;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const w = Math.max(MIN_WIDTH, startW + (ev.clientX - startX));
      const h = Math.max(MIN_HEIGHT, startH + (ev.clientY - startY));
      setSize({ w, h });
    };
    const onUp = (ev: PointerEvent) => {
      target.releasePointerCapture?.(ev.pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const w = Math.max(MIN_WIDTH, startW + (ev.clientX - startX));
      const h = Math.max(MIN_HEIGHT, startH + (ev.clientY - startY));
      onUpdate({ width: w, height: h });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  useEffect(() => {
    if (!editing) return;
    function onDocPointerDown(ev: PointerEvent) {
      if (!rootRef.current?.contains(ev.target as Node)) {
        setEditing(false);
        if (text !== note.body) onUpdate({ body: text });
        if (title !== (note.title ?? '')) onUpdate({ title });
      }
    }
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [editing, text, title, note.body, note.title, onUpdate]);

  useEffect(() => {
    if (editing) {
      const ta = textareaRef.current;
      ta?.focus();
      ta?.setSelectionRange(ta.value.length, ta.value.length);
    }
  }, [editing]);

  function enterEdit() {
    if (!editing) {
      setEditing(true);
      onFocus();
    }
  }

  const showTitle = editing || title.length > 0;

  return (
    <motion.div
      ref={rootRef}
      drag={!editing}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={onFocus}
      onDragEnd={handleDragEnd}
      onPointerDown={onFocus}
      onDoubleClick={enterEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !editing) {
          e.preventDefault();
          enterEdit();
        } else if (e.key === 'Escape' && editing) {
          setEditing(false);
          if (text !== note.body) onUpdate({ body: text });
          if (title !== (note.title ?? '')) onUpdate({ title });
        }
      }}
      tabIndex={0}
      role="group"
      aria-label="Sticky note"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      whileDrag={{ scale: 1.03 }}
      style={{
        x,
        y,
        width: size.w,
        height: size.h,
        rotate: editing ? 0 : tilt,
        zIndex: note.zIndex,
        backgroundColor: bg,
        color: ink,
        position: 'absolute',
        touchAction: 'none',
      }}
      className={cn(
        'group select-none rounded-md flex flex-col',
        'shadow-note dark:shadow-note-dark hover:shadow-note-hover',
        editing && 'cursor-text',
        !editing && 'cursor-grab active:cursor-grabbing',
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-7 rounded-t-md flex items-center justify-end pr-1.5 z-10',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          isTop && 'opacity-100',
        )}
        style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
      >
        <button
          type="button"
          aria-label="Change color"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setPaletteOpen((v) => !v);
          }}
          className="p-1 rounded-full hover:bg-black/10"
          style={{ color: ink, opacity: 0.6 }}
        >
          <Palette size={13} />
        </button>
        <button
          type="button"
          aria-label="Delete note"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded-full hover:bg-black/10"
          style={{ color: ink, opacity: 0.6 }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {paletteOpen && (
        <div
          className="absolute top-8 right-1.5 z-20 flex flex-col gap-2 p-2 rounded-lg shadow-note"
          style={{
            backgroundColor:
              theme === 'dark' ? 'rgba(30,29,26,0.95)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex gap-1">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Set background to ${c}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ color: c });
                }}
                style={{
                  backgroundColor:
                    theme === 'dark' ? COLOR_SPEC[c].dark : COLOR_SPEC[c].light,
                }}
                className={cn(
                  'h-5 w-5 rounded-full border border-black/10 dark:border-white/15',
                  c === note.color && 'ring-2 ring-offset-1 ring-black/40 dark:ring-white/40',
                )}
              />
            ))}
          </div>
          <div
            className="h-px"
            style={{
              backgroundColor:
                theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            }}
          />
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{
                color: theme === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
              }}
            >
              Text
            </span>
            <div className="flex gap-1">
              {INK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c === 'auto' ? 'Auto text colour' : 'Black text'}
                  title={c === 'auto' ? 'Auto' : 'Black'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ inkColor: c });
                  }}
                  style={{
                    backgroundColor: c === 'black' ? '#000000' : autoInk,
                  }}
                  className={cn(
                    'h-5 w-5 rounded-full border border-black/10 dark:border-white/15',
                    (note.inkColor ?? 'auto') === c &&
                      'ring-2 ring-offset-1 ring-black/40 dark:ring-white/40',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {showTitle && (
        <input
          ref={titleRef}
          value={title}
          readOnly={!editing}
          onChange={(e) => {
            const v = e.target.value;
            setTitle(v);
            debouncedSaveTitle(v);
          }}
          onPointerDown={(e) => {
            if (editing) e.stopPropagation();
          }}
          placeholder={editing ? 'Title…' : ''}
          maxLength={120}
          className={cn(
            'mt-7 mx-4 bg-transparent border-0 outline-none',
            'font-hand font-bold text-2xl leading-tight placeholder:opacity-40',
            'truncate',
          )}
          style={{ color: ink }}
        />
      )}

      <textarea
        ref={textareaRef}
        value={text}
        readOnly={!editing}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          debouncedSaveBody(v);
        }}
        onPointerDown={(e) => {
          if (editing) e.stopPropagation();
        }}
        placeholder={editing ? 'Type something…' : ''}
        className={cn(
          'flex-1 w-full px-4 pb-6 bg-transparent border-0 outline-none',
          'font-hand text-2xl leading-snug placeholder:opacity-40',
          showTitle ? 'pt-2' : 'pt-8',
          editing ? 'cursor-text' : 'cursor-inherit',
        )}
        style={{ color: ink }}
      />

      <div
        onPointerDown={handleResizeStart}
        aria-label="Resize"
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(135deg, transparent 50%, ${ink}40 50%)`,
          borderBottomRightRadius: 6,
          touchAction: 'none',
        }}
      />
    </motion.div>
  );
}
