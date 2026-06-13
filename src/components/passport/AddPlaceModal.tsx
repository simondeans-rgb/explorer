import { useEffect, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { countryName } from '../../data/countries';
import { regionsFor, hasRegions } from '../../data/regions';
import { flagEmoji } from '../../lib/flags';
import { createPlace, deletePlace, updatePlace } from '../../lib/places';
import {
  RELATIONSHIPS,
  RELATIONSHIP_META,
  type PlaceKind,
  type Relationship,
  type ResidencePeriod,
} from '../../types';
import { cn } from '../../lib/cn';
import { inputClass } from '../../lib/formClass';
import { useToast } from '../../contexts/toast';
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
  residencePeriods?: ResidencePeriod[];
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
  const { toast } = useToast();
  const editing = Boolean(initial.id);
  const [kind, setKind] = useState<PlaceKind>(initial.kind);
  const [countryCode, setCountryCode] = useState(initial.countryCode ?? '');
  const [cityName, setCityName] = useState(
    initial.kind === 'city' || initial.kind === 'region'
      ? (initial.name ?? '')
      : '',
  );
  const [relationships, setRelationships] = useState<Set<Relationship>>(
    // Default to "visited" so a place can be added in a couple of taps.
    new Set(initial.relationships ?? ['visited']),
  );
  const [year, setYear] = useState(
    initial.firstYear ? String(initial.firstYear) : '',
  );
  const [periods, setPeriods] = useState<ResidencePeriod[]>(() => {
    if (initial.residencePeriods && initial.residencePeriods.length > 0) {
      return initial.residencePeriods.map((p) => ({ from: p.from, to: p.to }));
    }
    if (initial.livedFrom) {
      return [{ from: initial.livedFrom, to: initial.livedTo }];
    }
    return [];
  });
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
      // Starting a residence with no periods yet — seed an empty one to fill in.
      if (r === 'lived' && !prev.has(r)) {
        setPeriods((ps) => (ps.length === 0 ? [{ from: '', to: '' }] : ps));
      }
      return next;
    });
  }

  function setPeriod(i: number, patch: Partial<ResidencePeriod>) {
    setPeriods((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function addPeriod() {
    setPeriods((ps) => [...ps, { from: '', to: '' }]);
  }
  function removePeriod(i: number) {
    setPeriods((ps) => ps.filter((_, idx) => idx !== i));
  }

  const canSave =
    countryCode &&
    relationships.size > 0 &&
    (kind === 'country' || cityName.trim().length > 0);

  // When switching kind, default a region's relationships to 'visited' like cities.
  function changeKind(k: PlaceKind) {
    setKind(k);
    if ((k === 'city' || k === 'region') && relationships.size === 0) {
      setRelationships(new Set<Relationship>(['visited']));
    }
  }

  async function handleSave() {
    if (!canSave || busy) return;
    setBusy(true);
    const parsedYear = year ? Number.parseInt(year, 10) : undefined;
    const lived = relationships.has('lived');
    const cleanPeriods = lived
      ? periods.filter((p) => p.from).map((p) => ({ from: p.from, to: p.to || undefined }))
      : [];
    const input = {
      kind,
      countryCode,
      name: kind === 'country' ? countryName(countryCode) : cityName.trim(),
      relationships: [...relationships],
      firstYear:
        parsedYear && !Number.isNaN(parsedYear) ? parsedYear : undefined,
      residencePeriods: cleanPeriods.length > 0 ? cleanPeriods : undefined,
      note: note.trim() || undefined,
    };
    try {
      if (initial.id) await updatePlace(initial.id, input);
      else await createPlace(userId, input);
      onClose();
    } catch {
      toast({ kind: 'error', message: 'Couldn’t save — check your connection' });
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
      : kind === 'region'
        ? 'Edit region'
        : `Edit ${countryName(countryCode)}`
    : kind === 'city'
      ? 'Add a city'
      : kind === 'region'
        ? 'Add a region'
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
          'rounded-t-3xl sm:rounded-3xl shadow-float animate-rise-in',
          'bg-passport-cartridge dark:bg-passport-carddark',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-passport-navy/[0.06] dark:border-white/10">
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
            <KindToggle kind={kind} onChange={changeKind} />
          )}

          <Field label="Country">
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

          {kind === 'region' && (
            <Field label="Region">
              {countryCode && hasRegions(countryCode) ? (
                <div className="flex flex-wrap gap-2">
                  {regionsFor(countryCode).map((rg) => {
                    const active = cityName === rg.name;
                    return (
                      <button
                        key={rg.code}
                        type="button"
                        onClick={() => setCityName(active ? '' : rg.name)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-[0.97]',
                          active
                            ? 'bg-passport-navy text-white dark:bg-white dark:text-passport-navy shadow-card'
                            : 'bg-white dark:bg-white/5 shadow-card text-passport-ink2 dark:text-white/70',
                        )}
                      >
                        {rg.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder={
                    countryCode ? 'e.g. a state or province' : 'Choose a country first'
                  }
                  className={inputClass}
                />
              )}
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
                      'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all active:scale-[0.97]',
                      active
                        ? 'bg-passport-navy text-white dark:bg-white dark:text-passport-navy shadow-card'
                        : 'bg-white dark:bg-white/5 shadow-card text-passport-ink2 dark:text-white/70',
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
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] uppercase tracking-[0.16em] text-passport-fieldlabel">
                  Periods lived here
                </span>
                <button
                  type="button"
                  onClick={addPeriod}
                  className="inline-flex items-center gap-1 text-xs text-passport-navy dark:text-passport-goldsoft hover:underline"
                >
                  <Plus size={13} /> Add period
                </button>
              </div>
              <div className="space-y-2">
                {periods.length === 0 && (
                  <p className="text-xs text-black/40 dark:text-white/40">
                    No periods yet — add one with the dates you lived here.
                  </p>
                )}
                {periods.map((p, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <Field label="From">
                      <input
                        type="month"
                        value={p.from}
                        onChange={(e) => setPeriod(i, { from: e.target.value })}
                        className={cn(inputClass, 'min-w-0 appearance-none')}
                      />
                    </Field>
                    <Field label="Until">
                      <input
                        type="month"
                        value={p.to ?? ''}
                        onChange={(e) => setPeriod(i, { to: e.target.value })}
                        className={cn(inputClass, 'min-w-0 appearance-none')}
                      />
                    </Field>
                    <button
                      type="button"
                      aria-label="Remove period"
                      onClick={() => removePeriod(i)}
                      className="mb-1.5 p-2 rounded-lg text-black/40 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-black/45 dark:text-white/45 mt-1.5">
                Add a period for each spell you lived here — moving away and back
                is fine. Leave “until” empty for where you live now. These dates
                let the Flighty importer tell which trips were home and which
                were away.
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
    <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-passport-navy/[0.05] dark:bg-white/[0.06]">
      {(['country', 'region', 'city'] as PlaceKind[]).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={cn(
            'py-2.5 rounded-xl text-sm font-semibold capitalize transition-all',
            kind === k
              ? 'bg-white dark:bg-passport-carddark text-passport-navy dark:text-white shadow-card'
              : 'text-passport-ink3 dark:text-white/55',
          )}
        >
          {k}
        </button>
      ))}
    </div>
  );
}

