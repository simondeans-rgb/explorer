import { useEffect, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import {
  createExpedition,
  deleteExpedition,
  updateExpedition,
} from '../../lib/expeditions';
import { countryName } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import { JOURNEY_MODES, JOURNEY_MODE_META, type Journey } from '../../types';
import { cn } from '../../lib/cn';
import { inputClass } from '../../lib/formClass';
import { AirportPicker, CountryPicker, Field } from '../forms';
import { JOURNEY_ICON } from './journeyIcons';

export interface ExpeditionModalInitial {
  id?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  countryCodes?: string[];
  journeys?: Journey[];
  note?: string;
}

interface Props {
  userId: string;
  initial: ExpeditionModalInitial;
  onClose: () => void;
}

function newId(): string {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c) return c.randomUUID();
  return `j_${Math.random().toString(36).slice(2)}`;
}

export function AddExpeditionModal({ userId, initial, onClose }: Props) {
  const editing = Boolean(initial.id);
  const [title, setTitle] = useState(initial.title ?? '');
  const [startDate, setStartDate] = useState(initial.startDate ?? '');
  const [endDate, setEndDate] = useState(initial.endDate ?? '');
  const [countryCodes, setCountryCodes] = useState<string[]>(
    initial.countryCodes ?? [],
  );
  const [journeys, setJourneys] = useState<Journey[]>(initial.journeys ?? []);
  const [note, setNote] = useState(initial.note ?? '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function addCountry(code: string) {
    setCountryCodes((prev) => (prev.includes(code) ? prev : [...prev, code]));
  }
  function removeCountry(code: string) {
    setCountryCodes((prev) => prev.filter((c) => c !== code));
  }

  function addJourney() {
    setJourneys((prev) => [...prev, { id: newId(), mode: 'flight' }]);
  }
  function updateJourney(id: string, patch: Partial<Journey>) {
    setJourneys((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    );
  }
  function removeJourney(id: string) {
    setJourneys((prev) => prev.filter((j) => j.id !== id));
  }

  const canSave = title.trim().length > 0;

  async function handleSave() {
    if (!canSave || busy) return;
    setBusy(true);
    const input = {
      title: title.trim(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      countryCodes,
      journeys: journeys.map((j) => ({
        id: j.id,
        mode: j.mode,
        operator: j.operator?.trim() || undefined,
        from: j.from?.trim() || undefined,
        to: j.to?.trim() || undefined,
        reference: j.reference?.trim() || undefined,
        seat: j.seat?.trim() || undefined,
        date: j.date || undefined,
        note: j.note?.trim() || undefined,
      })),
      note: note.trim() || undefined,
    };
    try {
      if (initial.id) await updateExpedition(initial.id, input);
      else await createExpedition(userId, input);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!initial.id || busy) return;
    setBusy(true);
    try {
      await deleteExpedition(initial.id);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          'w-full sm:max-w-md max-h-[92vh] overflow-y-auto no-scrollbar',
          'rounded-t-2xl sm:rounded-2xl shadow-page animate-rise-in',
          'bg-passport-card dark:bg-passport-carddark',
          'border border-black/5 dark:border-white/10',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10">
          <h2 className="font-display text-lg font-semibold text-passport-navy dark:text-white/90">
            {editing ? 'Edit journey' : 'New journey'}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/50 dark:text-white/50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <Field label="Title">
            <input
              autoFocus={!editing}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mediterranean Cruise"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(inputClass, 'min-w-0 appearance-none')}
              />
            </Field>
            <Field label="End">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={cn(inputClass, 'min-w-0 appearance-none')}
              />
            </Field>
          </div>

          <Field label="Countries">
            {countryCodes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {countryCodes.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => removeCountry(c)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-passport-navy/[0.06] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/70"
                  >
                    <span className="text-base leading-none">
                      {flagEmoji(c)}
                    </span>
                    {countryName(c)}
                    <X size={11} className="opacity-60" />
                  </button>
                ))}
              </div>
            )}
            <CountryPicker
              value=""
              onChange={addCountry}
              placeholder="Add a country"
            />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-[0.16em] text-black/45 dark:text-white/45">
                Journeys
              </span>
              <button
                type="button"
                onClick={addJourney}
                className="inline-flex items-center gap-1 text-xs text-passport-navy dark:text-passport-goldsoft hover:underline"
              >
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {journeys.map((j) => (
                <JourneyRow
                  key={j.id}
                  journey={j}
                  onChange={(patch) => updateJourney(j.id, patch)}
                  onRemove={() => removeJourney(j.id)}
                />
              ))}
              {journeys.length === 0 && (
                <p className="text-xs text-black/40 dark:text-white/40">
                  No journeys yet — add flights, rail, cruises, road trips or
                  ferries.
                </p>
              )}
            </div>
          </div>

          <Field label="Notes">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What made this trip?"
              className={cn(inputClass, 'resize-none')}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-black/5 dark:border-white/10">
          {editing ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 size={15} /> Remove
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || busy}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              'bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink',
              'hover:opacity-90 active:scale-[0.99]',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <Check size={16} />
            {busy ? 'Saving…' : editing ? 'Save' : 'Create journey'}
          </button>
        </div>
      </div>
    </div>
  );
}

function JourneyRow({
  journey,
  onChange,
  onRemove,
}: {
  journey: Journey;
  onChange: (patch: Partial<Journey>) => void;
  onRemove: () => void;
}) {
  const meta = JOURNEY_MODE_META[journey.mode];
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1 flex-1">
          {JOURNEY_MODES.map((m) => {
            const Icon = JOURNEY_ICON[m];
            const active = journey.mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ mode: m })}
                title={JOURNEY_MODE_META[m].label}
                className={cn(
                  'inline-flex items-center justify-center h-7 w-7 rounded-full border transition-colors',
                  active
                    ? 'bg-passport-navy text-passport-parchment border-passport-navy dark:bg-passport-gold dark:text-passport-ink dark:border-passport-gold'
                    : 'border-black/15 dark:border-white/15 text-black/55 dark:text-white/55',
                )}
              >
                <Icon size={13} />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove journey"
          className="p-1 rounded-full text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X size={15} />
        </button>
      </div>
      <input
        value={journey.operator ?? ''}
        onChange={(e) => onChange({ operator: e.target.value })}
        placeholder={meta.operator}
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-2">
        {journey.mode === 'flight' ? (
          <>
            <AirportPicker
              value={journey.from ?? ''}
              onChange={(v) => onChange({ from: v })}
              placeholder="From — code or city"
            />
            <AirportPicker
              value={journey.to ?? ''}
              onChange={(v) => onChange({ to: v })}
              placeholder="To — code or city"
            />
          </>
        ) : (
          <>
            <input
              value={journey.from ?? ''}
              onChange={(e) => onChange({ from: e.target.value })}
              placeholder={meta.from}
              className={inputClass}
            />
            <input
              value={journey.to ?? ''}
              onChange={(e) => onChange({ to: e.target.value })}
              placeholder={meta.to}
              className={inputClass}
            />
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={journey.reference ?? ''}
          onChange={(e) => onChange({ reference: e.target.value })}
          placeholder={meta.reference}
          className={inputClass}
        />
        <input
          value={journey.seat ?? ''}
          onChange={(e) => onChange({ seat: e.target.value })}
          placeholder={meta.seat}
          className={inputClass}
        />
      </div>
    </div>
  );
}
