import { useEffect, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { createTrip, deleteTrip, updateTrip } from '../../lib/trips';
import type { ItineraryItem } from '../../types';
import { cn } from '../../lib/cn';
import { inputClass } from '../../lib/formClass';
import { useToast } from '../../contexts/toast';
import { CountryPicker, Field } from '../forms';

export interface TripModalInitial {
  id?: string;
  title?: string;
  countryCode?: string;
  startDate?: string;
  endDate?: string;
  note?: string;
  itinerary?: ItineraryItem[];
}

interface Props {
  userId: string;
  initial: TripModalInitial;
  onClose: () => void;
  /** Called with the new trip id after creating, so the caller can open it. */
  onCreated?: (id: string) => void;
}

export function AddTripModal({ userId, initial, onClose, onCreated }: Props) {
  const { toast } = useToast();
  const editing = Boolean(initial.id);
  const [title, setTitle] = useState(initial.title ?? '');
  const [countryCode, setCountryCode] = useState(initial.countryCode ?? '');
  const [startDate, setStartDate] = useState(initial.startDate ?? '');
  const [endDate, setEndDate] = useState(initial.endDate ?? '');
  const [note, setNote] = useState(initial.note ?? '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canSave =
    title.trim().length > 0 && countryCode.length > 0 && startDate.length > 0;

  async function handleSave() {
    if (!canSave || busy) return;
    setBusy(true);
    const input = {
      title: title.trim(),
      countryCode,
      startDate,
      endDate: endDate || undefined,
      note: note.trim() || undefined,
      itinerary: initial.itinerary ?? [],
    };
    try {
      if (initial.id) {
        await updateTrip(initial.id, input);
      } else {
        const id = await createTrip(userId, input);
        if (id) onCreated?.(id);
      }
      onClose();
    } catch {
      toast({ kind: 'error', message: 'Couldn’t save your trip — try again' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!initial.id || busy) return;
    setBusy(true);
    try {
      await deleteTrip(initial.id);
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
          'rounded-t-3xl sm:rounded-3xl shadow-float animate-rise-in',
          'bg-passport-cartridge dark:bg-passport-carddark',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-passport-navy/[0.06] dark:border-white/10">
          <h2 className="font-display text-lg font-semibold text-passport-navy dark:text-white/90">
            {editing ? 'Edit trip' : 'Plan a trip'}
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
          <Field label="Where to?">
            <CountryPicker
              value={countryCode}
              onChange={setCountryCode}
              placeholder="Choose a destination"
            />
          </Field>

          <Field label="Trip name">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Japan in spring"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Leaving">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Returning">
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="A note (optional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="What are you most excited for?"
              className={cn(inputClass, 'resize-none')}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-passport-navy/[0.06] dark:border-white/10">
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
              'bg-brand-gradient text-white shadow-card',
              'hover:opacity-95 active:scale-[0.99]',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <Check size={16} />
            {busy ? 'Saving…' : editing ? 'Save' : 'Start planning'}
          </button>
        </div>
      </div>
    </div>
  );
}
