import { useEffect, useRef, useState } from 'react';
import {
  LogOut,
  Moon,
  Plus,
  StickyNote,
  Sun,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/cn';

interface ToolbarProps {
  count: number;
  onAdd: () => void;
}

export function Toolbar({ count, onAdd }: ToolbarProps) {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-30 h-14 px-4 sm:px-6 flex items-center justify-between',
        'backdrop-blur bg-canvas-light/70 dark:bg-canvas-dark/70',
        'border-b border-black/5 dark:border-white/5',
      )}
    >
      <div className="flex items-center gap-2 text-black/80 dark:text-white/85">
        <StickyNote size={18} />
        <span className="font-semibold tracking-tight">Stickies</span>
        <span className="text-xs text-black/45 dark:text-white/45 ml-1">
          {count} {count === 1 ? 'note' : 'notes'}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            'bg-black text-white dark:bg-white dark:text-black',
            'hover:opacity-90 active:scale-[0.98]',
          )}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New note</span>
        </button>

        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggle}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/70 dark:text-white/70"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Account menu"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              'h-8 w-8 rounded-full text-sm font-medium',
              'bg-black/10 dark:bg-white/10 text-black/75 dark:text-white/85',
              'hover:bg-black/15 dark:hover:bg-white/15',
            )}
          >
            {initial}
          </button>

          {menuOpen && (
            <div
              className={cn(
                'absolute right-0 mt-2 w-56 rounded-xl p-2 shadow-note',
                'bg-white/95 dark:bg-[#222220]/95 backdrop-blur',
                'border border-black/5 dark:border-white/10',
              )}
            >
              <div className="px-3 py-2 text-xs text-black/55 dark:text-white/55 truncate">
                {user?.email ?? 'Signed in'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut();
                }}
                className={cn(
                  'w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                  'hover:bg-black/5 dark:hover:bg-white/10',
                  'text-black/80 dark:text-white/80',
                )}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
