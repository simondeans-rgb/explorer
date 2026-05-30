import { useEffect, useRef, useState } from 'react';
import { Feather, Loader2 } from 'lucide-react';
import { streamStory } from '../../lib/historian';
import { cn } from '../../lib/cn';

type Status = 'idle' | 'writing' | 'done' | 'error';

export function TravelHistorian({
  context,
  scopeLabel,
}: {
  context: string;
  scopeLabel: string;
}) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function compose() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setText('');
    setError('');
    setStatus('writing');
    try {
      await streamStory(context, (d) => setText((t) => t + d), ctrl.signal);
      setStatus('done');
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  return (
    <section className="rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10 shadow-page p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-passport-gold">
            <Feather size={13} /> The Travel Historian
          </div>
          <p className="text-sm text-black/55 dark:text-white/55 mt-1 max-w-md">
            The Society&rsquo;s Historian will compose your {scopeLabel} from the
            record of your Passport.
          </p>
        </div>
        <button
          type="button"
          onClick={compose}
          disabled={status === 'writing'}
          className={cn(
            'shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            'bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink',
            'hover:opacity-90 active:scale-[0.98] disabled:opacity-50',
          )}
        >
          {status === 'writing' ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Composing…
            </>
          ) : status === 'idle' ? (
            <>
              <Feather size={14} /> Compose
            </>
          ) : (
            <>
              <Feather size={14} /> Compose again
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {(text || status === 'writing') && (
        <div className="mt-4 border-t border-black/5 dark:border-white/10 pt-4">
          <p className="font-display text-lg leading-relaxed text-passport-ink dark:text-white/85 whitespace-pre-wrap">
            {text}
            {status === 'writing' && (
              <span className="inline-block w-[2px] h-5 align-middle ml-0.5 bg-passport-gold animate-pulse" />
            )}
          </p>
          {status === 'done' && (
            <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-passport-fieldlabel">
              Composed by the Society of Discovery
            </div>
          )}
        </div>
      )}
    </section>
  );
}
