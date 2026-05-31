import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRIES, countryName } from '../data/countries';
import { flagEmoji } from '../lib/flags';
import { inputClass } from '../lib/formClass';
import { cn } from '../lib/cn';

// Shared form primitives used across the add/edit sheets.

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-[11px] uppercase tracking-[0.16em] text-black/45 dark:text-white/45 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

export function CountryPicker({
  value,
  onChange,
  placeholder = 'Choose a country',
}: {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(needle));
  }, [q]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(inputClass, 'flex items-center justify-between text-left')}
      >
        <span className="flex items-center gap-2">
          {value ? (
            <>
              <span className="text-xl leading-none">{flagEmoji(value)}</span>
              {countryName(value)}
            </>
          ) : (
            <span className="text-black/40 dark:text-white/40">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={16} className="opacity-50" />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-passport-carddark shadow-page overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-black/5 dark:border-white/10">
            <Search size={14} className="opacity-50" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search countries"
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto no-scrollbar py-1">
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                    setQ('');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="text-xl leading-none">{flagEmoji(c.code)}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="text-[11px] text-black/40 dark:text-white/40">
                    {c.continent}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-black/40 dark:text-white/40">
                No matches.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
