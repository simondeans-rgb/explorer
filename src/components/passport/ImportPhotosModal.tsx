import { useEffect, useRef, useState } from 'react';
import { Check, ImageIcon, MapPin, ScanLine, Upload, X } from 'lucide-react';
import { flagEmoji } from '../../lib/flags';
import {
  applyPhotoPlan,
  buildPhotoPlan,
  readPhotoLocation,
  resolveLocation,
  type PhotoPlan,
  type ResolvedPhoto,
} from '../../lib/photoGeo';
import type { Place } from '../../types';
import { cn } from '../../lib/cn';

interface Props {
  userId: string;
  places: Place[];
  onClose: () => void;
}

type Stage = 'pick' | 'scanning' | 'preview' | 'importing' | 'done';

export function ImportPhotosModal({ userId, places, onClose }: Props) {
  const [stage, setStage] = useState<Stage>('pick');
  const [plan, setPlan] = useState<PhotoPlan | null>(null);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState(0);
  const [scan, setScan] = useState({ done: 0, total: 0 });
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && stage !== 'importing' && stage !== 'scanning') {
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, stage]);

  async function onFiles(files: FileList) {
    setError('');
    const list = Array.from(files);
    setStage('scanning');
    setScan({ done: 0, total: list.length });
    const resolved: ResolvedPhoto[] = [];
    for (let i = 0; i < list.length; i++) {
      const loc = await readPhotoLocation(list[i]);
      if (loc) resolved.push(resolveLocation(loc));
      // Yield to the paint loop every few files so the progress bar moves.
      if (i % 5 === 0) await new Promise((r) => setTimeout(r));
      setScan({ done: i + 1, total: list.length });
    }
    const built = buildPhotoPlan(resolved, places, list.length);
    setPlan(built);
    setStage('preview');
  }

  async function confirm() {
    if (!plan) return;
    setStage('importing');
    setProgress({ done: 0, total: 0 });
    try {
      const result = await applyPhotoPlan(userId, plan, (done, total) =>
        setProgress({ done, total }),
      );
      setFailed(result.failed);
      setStage('done');
    } catch {
      setError('The import couldn’t be completed. Please try again.');
      setStage('preview');
    }
  }

  const nothingNew =
    plan != null && plan.stats.newCountries === 0 && plan.stats.newCities === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onMouseDown={() =>
        stage !== 'importing' && stage !== 'scanning' && onClose()
      }
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
            Import from photos
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={stage === 'importing' || stage === 'scanning'}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/50 dark:text-white/50 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          {stage === 'pick' && (
            <div className="space-y-4">
              <p className="text-sm text-black/60 dark:text-white/60">
                Choose photos from your gallery and the places they were taken
                are added to your Passport. We read each picture&rsquo;s location
                tag <span className="font-medium">on your device</span> —
                nothing is uploaded.
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-passport-gold/50 hover:border-passport-gold hover:bg-passport-gold/5 transition-colors py-8 flex flex-col items-center gap-2 text-passport-navy dark:text-white/80"
              >
                <Upload size={22} className="text-passport-gold" />
                <span className="font-medium">Choose photos</span>
                <span className="text-xs text-black/45 dark:text-white/45">
                  Select as many as you like
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) void onFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <p className="text-xs text-black/45 dark:text-white/45">
                Tip: photos must have location turned on in your camera to carry
                a place tag. Screenshots and some formats (e.g. HEIC) may not
                include one and are skipped.
              </p>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          )}

          {stage === 'scanning' && (
            <div className="py-8 text-center space-y-3">
              <ScanLine
                size={26}
                className="mx-auto text-passport-gold animate-pulse"
              />
              <p className="text-sm text-black/60 dark:text-white/60">
                Reading photo locations… {scan.done}/{scan.total}
              </p>
              <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-passport-gold transition-all"
                  style={{
                    width: `${scan.total ? (scan.done / scan.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {stage === 'preview' && plan && (
            <div className="space-y-4">
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              {plan.stats.located === 0 ? (
                <p className="text-sm text-black/65 dark:text-white/65">
                  None of the {plan.stats.photos} photo
                  {plan.stats.photos === 1 ? '' : 's'} had a readable location
                  tag, so there&rsquo;s nothing to add. Make sure location is
                  enabled for your camera, then try again.
                </p>
              ) : nothingNew ? (
                <p className="text-sm text-black/65 dark:text-white/65">
                  Found {plan.stats.countries} countr
                  {plan.stats.countries === 1 ? 'y' : 'ies'} in your photos —
                  all already in your Passport. Nothing new to add.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <Stat n={plan.stats.located} label="Located" />
                    <Stat n={plan.stats.countries} label="Countries" />
                    <Stat n={plan.stats.cities} label="Cities" />
                    <Stat n={plan.stats.noLocation} label="No tag" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-passport-fieldlabel">
                      Found in your photos
                    </div>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto no-scrollbar pr-1">
                      {plan.countries.map((c) => (
                        <div
                          key={c.code}
                          className="rounded-xl bg-passport-navy/[0.04] dark:bg-white/[0.05] px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base leading-none shrink-0">
                              {flagEmoji(c.code)}
                            </span>
                            <span className="font-medium text-passport-ink dark:text-white/85 truncate">
                              {c.name}
                            </span>
                            {c.year != null && (
                              <span className="text-xs text-passport-ink3 dark:text-white/45 ml-auto shrink-0">
                                {c.year}
                              </span>
                            )}
                          </div>
                          {c.cities.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {c.cities.map((city) => (
                                <span
                                  key={city}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-passport-card dark:bg-passport-carddark border border-black/10 dark:border-white/10 text-passport-ink2 dark:text-white/70"
                                >
                                  <MapPin size={10} />
                                  {city}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-black/45 dark:text-white/45">
                    Countries and cities are added as{' '}
                    <span className="font-medium">visited</span>; the earliest
                    photo date sets the year. Existing entries are kept — only
                    new places and earlier years are added.
                  </p>
                </>
              )}
            </div>
          )}

          {stage === 'importing' && (
            <div className="py-8 text-center space-y-3">
              <ImageIcon
                size={26}
                className="mx-auto text-passport-gold animate-pulse"
              />
              <p className="text-sm text-black/60 dark:text-white/60">
                Adding to your Passport… {progress.done}/{progress.total}
              </p>
              <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-passport-gold transition-all"
                  style={{
                    width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {stage === 'done' && plan && (
            <div className="py-8 text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-passport-gold/15 flex items-center justify-center">
                <Check size={24} className="text-passport-gold" />
              </div>
              <p className="font-display text-xl font-semibold text-passport-navy dark:text-white/90">
                Imported
              </p>
              <p className="text-sm text-black/55 dark:text-white/55">
                {plan.stats.newCountries} countr
                {plan.stats.newCountries === 1 ? 'y' : 'ies'} and{' '}
                {plan.stats.newCities} cit
                {plan.stats.newCities === 1 ? 'y' : 'ies'} added to your
                Passport.
              </p>
              {failed > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {failed} item{failed === 1 ? '' : 's'} couldn’t be saved. You
                  can run the import again to retry them.
                </p>
              )}
            </div>
          )}
        </div>

        {(stage === 'preview' || stage === 'done') && plan && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-passport-navy/[0.06] dark:border-white/10">
            {stage === 'preview' ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-xl text-sm text-black/55 dark:text-white/55 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={nothingNew || plan.stats.located === 0}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium',
                    'bg-brand-gradient text-white shadow-card',
                    'hover:opacity-95 disabled:opacity-40',
                  )}
                >
                  <Check size={16} /> Add {plan.stats.newCountries +
                    plan.stats.newCities}{' '}
                  places
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold bg-brand-gradient text-white shadow-card hover:opacity-95"
              >
                Done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-passport-navy/[0.04] dark:bg-white/[0.05] px-1 py-2.5">
      <div className="font-display text-xl font-semibold text-passport-navy dark:text-passport-goldsoft">
        {n}
      </div>
      <div className="text-[10px] uppercase tracking-[0.1em] text-black/45 dark:text-white/45 break-words">
        {label}
      </div>
    </div>
  );
}
