import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Plane, Upload, X } from 'lucide-react';
import { flagEmoji } from '../../lib/flags';
import {
  applyImportPlan,
  buildImportPlan,
  parseFlightyCsv,
  type ImportPlan,
} from '../../lib/flightyImport';
import type { Expedition, Place } from '../../types';
import { cn } from '../../lib/cn';

interface Props {
  userId: string;
  places: Place[];
  expeditions: Expedition[];
  onClose: () => void;
}

type Stage = 'pick' | 'preview' | 'importing' | 'done';

export function ImportFlightyModal({
  userId,
  places,
  expeditions,
  onClose,
}: Props) {
  const [stage, setStage] = useState<Stage>('pick');
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && stage !== 'importing') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, stage]);

  async function onFile(file: File) {
    setError('');
    try {
      const text = await file.text();
      const { flights, error: parseError } = parseFlightyCsv(text);
      if (parseError) {
        setError(parseError);
        return;
      }
      if (flights.length === 0) {
        setError('No flights found in this file.');
        return;
      }
      setPlan(buildImportPlan(flights, places, expeditions));
      setStage('preview');
    } catch {
      setError('Could not read that file.');
    }
  }

  async function confirm() {
    if (!plan) return;
    setStage('importing');
    setProgress({ done: 0, total: 0 });
    await applyImportPlan(userId, plan, (done, total) =>
      setProgress({ done, total }),
    );
    setStage('done');
  }

  const foreignTrips = plan?.expeditions.filter((e) => !e.title.includes('domestic flights')) ?? [];
  const domesticBuckets = plan?.expeditions.filter((e) => e.title.includes('domestic flights')) ?? [];
  const nothingNew = plan != null && plan.stats.newFlights === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onMouseDown={() => stage !== 'importing' && onClose()}
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
            Import from Flighty
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={stage === 'importing'}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/50 dark:text-white/50 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          {stage === 'pick' && (
            <div className="space-y-4">
              <p className="text-sm text-black/60 dark:text-white/60">
                In Flighty, export your flights to CSV (Settings → Export), then
                upload the file here. Your flights become journeys, and the
                countries and cities you passed through are added to your
                Passport.
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-passport-gold/50 hover:border-passport-gold hover:bg-passport-gold/5 transition-colors py-8 flex flex-col items-center gap-2 text-passport-navy dark:text-white/80"
              >
                <Upload size={22} className="text-passport-gold" />
                <span className="font-medium">Choose Flighty CSV</span>
                <span className="text-xs text-black/45 dark:text-white/45">
                  FlightyExport….csv
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                  e.target.value = '';
                }}
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          )}

          {stage === 'preview' && plan && (
            <div className="space-y-4">
              {nothingNew ? (
                <p className="text-sm text-black/65 dark:text-white/65">
                  Every flight in this file has already been imported — nothing
                  new to add.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <Stat n={plan.stats.newFlights} label="Flights" />
                    <Stat n={plan.expeditions.length} label="Trips" />
                    <Stat n={plan.stats.countries} label="Countries" />
                    <Stat n={plan.stats.cities} label="Cities" />
                  </div>

                  <div className="rounded-xl bg-passport-gold/[0.08] border border-passport-gold/30 p-3 flex gap-2.5">
                    <AlertTriangle
                      size={16}
                      className="text-passport-gold shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-passport-ink2 dark:text-white/70 leading-relaxed">
                      Trips are reconstructed from flights, assuming you stayed
                      at each destination until your next flight. Any travel not
                      flown — trains, road trips, cruises — and any flights you
                      didn&rsquo;t log won&rsquo;t appear, so add those manually.
                      Connecting-airport countries are counted as visited.
                    </p>
                  </div>

                  {foreignTrips.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-passport-fieldlabel">
                        Trips
                      </div>
                      <div className="space-y-1 max-h-56 overflow-y-auto no-scrollbar pr-1">
                        {foreignTrips.map((e, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="text-base leading-none shrink-0">
                              {e.countryCodes.map((c) => flagEmoji(c)).join('')}
                            </span>
                            <span className="font-medium text-passport-ink dark:text-white/85 truncate">
                              {e.title}
                            </span>
                            <span className="text-xs text-passport-ink3 dark:text-white/45 ml-auto shrink-0">
                              {(e.startDate ?? '').slice(0, 7)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {domesticBuckets.length > 0 && (
                    <p className="text-xs text-black/45 dark:text-white/45">
                      Plus {domesticBuckets.length}{' '}
                      {plan.homeCountryName} domestic{' '}
                      {domesticBuckets.length === 1 ? 'collection' : 'collections'}{' '}
                      (one per year).
                    </p>
                  )}

                  {plan.unknownAirports.length > 0 && (
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {plan.unknownAirports.length} airport
                      {plan.unknownAirports.length === 1 ? '' : 's'} weren&rsquo;t
                      recognised and were skipped for places:{' '}
                      {plan.unknownAirports.join(', ')}. The flights are still
                      imported.
                    </p>
                  )}

                  {plan.stats.canceled > 0 && (
                    <p className="text-xs text-black/45 dark:text-white/45">
                      {plan.stats.canceled} cancelled flight
                      {plan.stats.canceled === 1 ? '' : 's'} skipped.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {stage === 'importing' && (
            <div className="py-8 text-center space-y-3">
              <Plane
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
                {plan.expeditions.length} trips and {plan.stats.countries}{' '}
                countries added to your Passport.
              </p>
            </div>
          )}
        </div>

        {(stage === 'preview' || stage === 'done') && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-black/5 dark:border-white/10">
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
                  disabled={nothingNew}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium',
                    'bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink',
                    'hover:opacity-90 disabled:opacity-40',
                  )}
                >
                  <Check size={16} /> Import {plan?.stats.newFlights} flights
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink hover:opacity-90"
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
    <div className="rounded-xl bg-passport-navy/[0.04] dark:bg-white/[0.05] py-2.5">
      <div className="font-display text-xl font-semibold text-passport-navy dark:text-passport-goldsoft">
        {n}
      </div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-black/45 dark:text-white/45">
        {label}
      </div>
    </div>
  );
}
