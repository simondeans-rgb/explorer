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
    <section className="rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-passport-gold">
            <Feather size={14} /> Your story
          </div>
          <p className="text-sm text-passport-ink2 dark:text-white/55 mt-1 max-w-md">
            Have your {scopeLabel} written for you, from everywhere you&rsquo;ve
            been.
          </p>
        </div>
        <button
          type="button"
          onClick={compose}
          disabled={status === 'writing'}
          className={cn(
            'shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold transition-all',
            'bg-brand-gradient text-white shadow-card',
            'hover:opacity-95 active:scale-[0.98] disabled:opacity-50',
          )}
        >
          {status === 'writing' ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Writing…
            </>
          ) : status === 'idle' ? (
            <>
              <Feather size={15} /> Write it
            </>
          ) : (
            <>
              <Feather size={15} /> Again
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-passport-burgundy dark:text-passport-expedition">
          {error}
        </p>
      )}

      {(text || status === 'writing') && (
        <div className="mt-4 page-divide-none border-t border-passport-navy/[0.06] dark:border-white/10 pt-4">
          <p className="font-display text-lg leading-relaxed text-passport-ink dark:text-white/85 whitespace-pre-wrap">
            {text}
            {status === 'writing' && (
              <span className="inline-block w-[2px] h-5 align-middle ml-0.5 bg-passport-gold animate-pulse" />
            )}
          </p>
        </div>
      )}
    </section>
  );
}
