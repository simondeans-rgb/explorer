import { useEffect, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { countryName } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import { createPlace, deletePlace, updatePlace } from '../../lib/places';
import {
  RELATIONSHIPS,
  RELATIONSHIP_META,
  type PlaceKind,
  type Relationship,
} from '../../types';
import { cn } from '../../lib/cn';
import { inputClass } from '../../lib/formClass';
import { CountryPicker, Field } from '../forms';
import { RELATIONSHIP_ICON } from './relationshipIcons';

export interface ModalInitial {
  id?: string;
  kind: PlaceKind;
  countryCode?: string;
  name?: string;
  relationships?: Relationship[];
  firstYear?: number;
  livedFrom?: string;
  livedTo?: string;
  note?: string;
  lockKind?: boolean;
  lockCountry?: boolean;
}

interface Props {
  userId: string;
  initial: ModalInitial;
  onClose: () => void;
}

export function AddPlaceModal({ userId, initial, onClose }: Props) {
  const editing = Boolean(initial.id);
  const [kind, setKind] = useState<PlaceKind>(initial.kind);
  const [countryCode, setCountryCode] = useState(initial.countryCode ?? '');
  const [cityName, setCityName] = useState(
    initial.kind === 'city' ? (initial.name ?? '') : '',
  );
  const [relationships, setRelationships] = useState<Set<Relationship>>(
    new Set(initial.relationships ?? (initial.kind === 'city' ? ['visited'] : [])),
  );
  const [year, setYear] = useState(
    initial.firstYear ? String(initial.firstYear) : '',
  );
  const [livedFrom, setLivedFrom] = useState(initial.livedFrom ?? '');
  const [livedTo, setLivedTo] = useState(initial.livedTo ?? '');
  const [note, setNote] = useState(initial.note ?? '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggleRel(r: Relationship) {
    setRelationships((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  }

  const canSave =
    countryCode &&
    relationships.size > 0 &&
    (kind === 'country' || cityName.trim().length > 0);

  async function handleSave() {
    if (!canSave || busy) return;
    setBusy(true);
    const parsedYear = year ? Number.parseInt(year, 10) : undefined;
    const lived = relationships.has('lived');
    const input = {
      kind,
      countryCode,
      name: kind === 'country' ? countryName(countryCode) : cityName,
      relationships: [...relationships],
      firstYear:
        parsedYear && !Number.isNaN(parsedYear) ? parsedYear : undefined,
      livedFrom: lived ? livedFrom || undefined : undefined,
      livedTo: lived ? livedTo || undefined : undefined,
      note: note.trim() || undefined,
    };
    try {
      if (initial.id) await updatePlace(initial.id, input);
      else await createPlace(userId, input);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!initial.id || busy) return;
    setBusy(true);
    try {
      await deletePlace(initial.id);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  const title = editing
    ? kind === 'city'
      ? 'Edit city'
      : `Edit ${countryName(countryCode)}`
    : kind === 'city'
      ? 'Add a city'
      : 'Add to your Passport';

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
            {title}
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
          {!initial.lockKind && !editing && (
            <KindToggle kind={kind} onChange={setKind} />
          )}

          <Field label={kind === 'city' ? 'Country' : 'Country'}>
            {initial.lockCountry || editing ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10">
                <span className="text-xl leading-none">
                  {flagEmoji(countryCode)}
                </span>
                <span className="text-sm">{countryName(countryCode)}</span>
              </div>
            ) : (
              <CountryPicker value={countryCode} onChange={setCountryCode} />
            )}
          </Field>

          {kind === 'city' && (
            <Field label="City">
              <input
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. Lisbon"
                className={inputClass}
              />
            </Field>
          )}

          <Field label="Your relationship">
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map((r) => {
                const Icon = RELATIONSHIP_ICON[r];
                const active = relationships.has(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRel(r)}
                    title={RELATIONSHIP_META[r].description}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors',
                      active
                        ? 'bg-passport-navy text-passport-parchment border-passport-navy dark:bg-passport-gold dark:text-passport-ink dark:border-passport-gold'
                        : 'border-black/15 dark:border-white/15 text-black/70 dark:text-white/70 hover:border-passport-gold/60',
                    )}
                  >
                    <Icon size={14} />
                    {RELATIONSHIP_META[r].label}
                  </button>
                );
              })}
            </div>
          </Field>

          {relationships.has('lived') && (
            <div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lived from">
                  <input
                    type="month"
                    value={livedFrom}
                    onChange={(e) => setLivedFrom(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Lived until">
                  <input
                    type="month"
                    value={livedTo}
                    onChange={(e) => setLivedTo(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <p className="text-xs text-black/45 dark:text-white/45 mt-1.5">
                Dates let the Flighty importer work out which trips were home and
                which were away. Leave “until” empty if you live here now.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="First discovered">
              <input
                value={year}
                onChange={(e) =>
                  setYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))
                }
                inputMode="numeric"
                placeholder="Year"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="A detail worth remembering">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="A meal, a view, a moment…"
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
            {busy ? 'Saving…' : editing ? 'Save' : 'Add to Passport'}
          </button>
        </div>
      </div>
    </div>
  );
}

function KindToggle({
  kind,
  onChange,
}: {
  kind: PlaceKind;
  onChange: (k: PlaceKind) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
      {(['country', 'city'] as PlaceKind[]).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={cn(
            'py-2 rounded-lg text-sm font-medium capitalize transition-colors',
            kind === k
              ? 'bg-white dark:bg-passport-navy text-passport-navy dark:text-passport-goldsoft shadow-sm'
              : 'text-black/55 dark:text-white/55',
          )}
        >
          {k}
        </button>
      ))}
    </div>
  );
}

