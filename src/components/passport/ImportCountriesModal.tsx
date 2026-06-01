import { useEffect, useState } from 'react';
import { Check, Globe2, X } from 'lucide-react';
import { flagEmoji } from '../../lib/flags';
import {
  applyCountryImportPlan,
  buildCountryImportPlan,
  type CountryImportPlan,
} from '../../lib/countryListImport';
import type { Place } from '../../types';
import { cn } from '../../lib/cn';
import { inputClass } from '../../lib/formClass';

interface Props {
  userId: string;
  places: Place[];
  onClose: () => void;
}

type Stage = 'paste' | 'preview' | 'importing' | 'done';

export function ImportCountriesModal({ userId, places, onClose }: Props) {
  const [stage, setStage] = useState<Stage>('paste');
  const [text, setText] = useState('');
  const [plan, setPlan] = useState<CountryImportPlan | null>(null);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState(0);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && stage !== 'importing') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, stage]);

  function review() {
    setError('');
    const built = buildCountryImportPlan(text, places);
    if (built.stats.found === 0) {
      setError(
        "Couldn't recognise any countries in that list. Paste one country per line (names or codes).",
      );
      return;
    }
    setPlan(built);
    setStage('preview');
  }

  async function confirm() {
    if (!plan) return;
    setStage('importing');
    setProgress({ done: 0, total: 0 });
    try {
      const result = await applyCountryImportPlan(userId, plan, (done, total) =>
        setProgress({ done, total }),
      );
      setFailed(result.failed);
      setStage('done');
    } catch {
      setError('The import couldn’t be completed. Please try again.');
      setStage('preview');
    }
  }

  const nothingNew = plan != null && plan.stats.toAdd === 0;

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
            Import countries
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
          {stage === 'paste' && (
            <div className="space-y-4">
              <p className="text-sm text-black/60 dark:text-white/60">
                Switching from another app? Paste your list of countries below —
                one per line or comma-separated. In <strong>Been</strong>, use
                Profile → export your countries as text, then paste it here.
                Country names or codes both work.
              </p>
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder={'Belgium\nCanada\nFrance\nUnited States of America\n…'}
                className={cn(inputClass, 'resize-none font-mono text-sm')}
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          )}

          {stage === 'preview' && plan && (
            <div className="space-y-4">
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat n={plan.stats.found} label="Recognised" />
                <Stat n={plan.stats.toAdd} label="New" />
                <Stat n={plan.stats.already} label="Already in" />
              </div>

              {nothingNew ? (
                <p className="text-sm text-black/65 dark:text-white/65">
                  Every country in this list is already in your Passport —
                  nothing new to add.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-passport-fieldlabel">
                    Countries to add
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto no-scrollbar">
                    {plan.matched
                      .filter((m) => !m.existing)
                      .map((m) => (
                        <span
                          key={m.code}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm bg-passport-navy/[0.05] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/75"
                        >
                          <span className="text-base leading-none">
                            {flagEmoji(m.code)}
                          </span>
                          {m.name}
                          {m.year != null && (
                            <span className="text-xs text-passport-ink3 dark:text-white/45">
                              {m.year}
                            </span>
                          )}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {plan.unmatched.length > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {plan.unmatched.length} line
                  {plan.unmatched.length === 1 ? '' : 's'} weren&rsquo;t
                  recognised and were skipped: {plan.unmatched.join(', ')}.
                </p>
              )}
            </div>
          )}

          {stage === 'importing' && (
            <div className="py-8 text-center space-y-3">
              <Globe2
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
                {plan.stats.toAdd} countr
                {plan.stats.toAdd === 1 ? 'y' : 'ies'} added to your Passport.
              </p>
              {failed > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {failed} couldn’t be saved. You can run the import again to
                  retry.
                </p>
              )}
            </div>
          )}
        </div>

        {(stage === 'paste' || stage === 'preview' || stage === 'done') && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-black/5 dark:border-white/10">
            {stage === 'paste' && (
              <button
                type="button"
                onClick={review}
                disabled={!text.trim()}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium',
                  'bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink',
                  'hover:opacity-90 disabled:opacity-40',
                )}
              >
                Review
              </button>
            )}
            {stage === 'preview' && (
              <>
                <button
                  type="button"
                  onClick={() => setStage('paste')}
                  className="px-3 py-2 rounded-xl text-sm text-black/55 dark:text-white/55 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Back
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
                  <Check size={16} /> Add {plan?.stats.toAdd} countries
                </button>
              </>
            )}
            {stage === 'done' && (
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
