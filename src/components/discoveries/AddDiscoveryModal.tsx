import { useEffect, useState } from 'react';
import { Check, Landmark, Trash2, X } from 'lucide-react';
import {
  createDiscovery,
  deleteDiscovery,
  updateDiscovery,
} from '../../lib/discoveries';
import { countryFacts } from '../../data/countryFacts';
import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_SUBCATEGORIES,
  DISCOVERY_CATEGORY_META,
  RECOMMENDATION_VERDICTS,
  VERDICT_META,
  type DiscoveryCategory,
  type Expedition,
  type RecommendationVerdict,
} from '../../types';
import { cn } from '../../lib/cn';
import { inputClass } from '../../lib/formClass';
import { CountryPicker, Field } from '../forms';
import { CATEGORY_ICON } from './categoryIcons';
import { VERDICT_STYLE } from './verdictStyle';

export interface DiscoveryModalInitial {
  id?: string;
  name?: string;
  category?: DiscoveryCategory;
  subcategory?: string;
  countryCode?: string;
  city?: string;
  landmark?: string;
  expeditionId?: string;
  verdict?: RecommendationVerdict;
  note?: string;
}

interface Props {
  userId: string;
  initial: DiscoveryModalInitial;
  expeditions: Expedition[];
  onClose: () => void;
}

export function AddDiscoveryModal({
  userId,
  initial,
  expeditions,
  onClose,
}: Props) {
  const editing = Boolean(initial.id);
  const [name, setName] = useState(initial.name ?? '');
  const [category, setCategory] = useState<DiscoveryCategory>(
    initial.category ?? 'food',
  );
  const [subcategory, setSubcategory] = useState<string | undefined>(
    initial.subcategory,
  );
  const [countryCode, setCountryCode] = useState(initial.countryCode ?? '');
  const [city, setCity] = useState(initial.city ?? '');
  const [landmark, setLandmark] = useState(initial.landmark ?? '');
  const [expeditionId, setExpeditionId] = useState(initial.expeditionId ?? '');
  const [verdict, setVerdict] = useState<RecommendationVerdict | undefined>(
    initial.verdict,
  );
  const [note, setNote] = useState(initial.note ?? '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canSave = name.trim().length > 0;

  const landmarkOptions = countryCode
    ? (countryFacts(countryCode)?.landmarks ?? [])
    : [];

  function selectCategory(c: DiscoveryCategory) {
    if (c !== category) setSubcategory(undefined);
    setCategory(c);
  }

  function pickLandmark(l: string) {
    if (landmark === l) {
      // Toggle off — keep the name but unlink.
      setLandmark('');
      return;
    }
    setLandmark(l);
    if (!name.trim()) setName(l);
    // Landmarks are sights — nudge the category unless the user already chose.
    if (category === 'food') {
      setCategory('culture');
      setSubcategory(undefined);
    }
  }

  async function handleSave() {
    if (!canSave || busy) return;
    setBusy(true);
    const input = {
      name: name.trim(),
      category,
      subcategory: subcategory || undefined,
      countryCode: countryCode || undefined,
      city: city.trim() || undefined,
      landmark: landmark.trim() || undefined,
      expeditionId: expeditionId || undefined,
      verdict,
      note: note.trim() || undefined,
    };
    try {
      if (initial.id) await updateDiscovery(initial.id, input);
      else await createDiscovery(userId, input);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!initial.id || busy) return;
    setBusy(true);
    try {
      await deleteDiscovery(initial.id);
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
            {editing ? 'Edit discovery' : 'Record a discovery'}
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
          <Field label="Name">
            <input
              autoFocus={!editing}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Belcanto"
              className={inputClass}
            />
          </Field>

          <Field label="Category">
            <div className="flex flex-wrap gap-2">
              {DISCOVERY_CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICON[c];
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => selectCategory(c)}
                    title={DISCOVERY_CATEGORY_META[c].hint}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all active:scale-[0.97]',
                      active
                        ? 'bg-passport-navy text-white dark:bg-white dark:text-passport-navy shadow-card'
                        : 'bg-white dark:bg-white/5 shadow-card text-passport-ink2 dark:text-white/70',
                    )}
                  >
                    <Icon size={14} />
                    {DISCOVERY_CATEGORY_META[c].label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Type">
            <div className="flex flex-wrap gap-2">
              {DISCOVERY_SUBCATEGORIES[category].map((s) => {
                const active = subcategory === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setSubcategory(active ? undefined : s.id)
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-[0.97]',
                      active
                        ? 'bg-coral text-white shadow-card'
                        : 'bg-white dark:bg-white/5 shadow-card text-passport-ink2 dark:text-white/70',
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Country">
              <CountryPicker
                value={countryCode}
                onChange={setCountryCode}
                placeholder="Optional"
              />
            </Field>
            <Field label="City">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </Field>
          </div>

          {landmarkOptions.length > 0 && (
            <Field label="Is this a well-known landmark?">
              <div className="flex flex-wrap gap-2">
                {landmarkOptions.map((l) => {
                  const active = landmark === l;
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => pickLandmark(l)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all active:scale-[0.97]',
                        active
                          ? 'bg-passport-navy text-white dark:bg-white dark:text-passport-navy shadow-card'
                          : 'bg-white dark:bg-white/5 shadow-card text-passport-ink2 dark:text-white/70',
                      )}
                    >
                      <Landmark size={13} />
                      {l}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-black/45 dark:text-white/45">
                Linking your record to a landmark connects it to the country
                card — and lets friends see what you said about it.
              </p>
            </Field>
          )}

          {expeditions.length > 0 && (
            <Field label="Expedition">
              <select
                value={expeditionId}
                onChange={(e) => setExpeditionId(e.target.value)}
                className={inputClass}
              >
                <option value="">None</option>
                {expeditions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Your verdict">
            <div className="flex flex-wrap gap-2">
              {RECOMMENDATION_VERDICTS.map((v) => {
                const active = verdict === v;
                const style = VERDICT_STYLE[v];
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVerdict(active ? undefined : v)}
                    title={VERDICT_META[v].hint}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-colors',
                      active
                        ? style.active
                        : 'border-black/15 dark:border-white/15 text-black/70 dark:text-white/70 hover:border-passport-gold/60',
                    )}
                  >
                    {VERDICT_META[v].label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="A detail worth remembering">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Why it stayed with you…"
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
            {busy ? 'Saving…' : editing ? 'Save' : 'Record discovery'}
          </button>
        </div>
      </div>
    </div>
  );
}
