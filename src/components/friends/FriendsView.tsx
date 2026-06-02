import { useMemo, useState } from 'react';
import { Check, Copy, UserPlus, Users, X } from 'lucide-react';
import {
  acceptConnection,
  removeConnection,
  sendRequest,
  type Connection,
} from '../../lib/connections';
import type { FriendPresence } from '../../lib/friends';
import { countryName } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import { VERDICT_META, type RecommendationVerdict } from '../../types';
import { cn } from '../../lib/cn';
import { inputClass } from '../../lib/formClass';
import { VERDICT_STYLE } from '../discoveries/verdictStyle';

interface Props {
  userId: string;
  myName: string;
  code: string | null;
  connections: Connection[];
  friendCountryMap: Map<string, FriendPresence[]>;
  demo: boolean;
}

interface Pick {
  code: string;
  friend: string;
  name: string;
  verdict?: RecommendationVerdict;
}

export function FriendsView({
  userId,
  myName,
  code,
  connections,
  friendCountryMap,
  demo,
}: Props) {
  const [entry, setEntry] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const [pickFilter, setPickFilter] = useState<'all' | RecommendationVerdict>(
    'all',
  );

  const { incoming, outgoing, friends } = useMemo(() => {
    const incoming = connections.filter(
      (c) => c.status === 'pending' && c.requestedBy !== userId,
    );
    const outgoing = connections.filter(
      (c) => c.status === 'pending' && c.requestedBy === userId,
    );
    const friends = connections.filter((c) => c.status === 'accepted');
    return { incoming, outgoing, friends };
  }, [connections, userId]);

  const picks = useMemo(() => {
    const out: Pick[] = [];
    for (const [code, presences] of friendCountryMap) {
      for (const p of presences) {
        for (const d of p.discoveries) {
          out.push({ code, friend: p.name, name: d.name, verdict: d.verdict });
        }
      }
    }
    return out;
  }, [friendCountryMap]);

  const presentVerdicts = useMemo(() => {
    const set = new Set<RecommendationVerdict>();
    for (const p of picks) if (p.verdict) set.add(p.verdict);
    return set;
  }, [picks]);

  const groupedPicks = useMemo(() => {
    const filtered =
      pickFilter === 'all'
        ? picks
        : picks.filter((p) => p.verdict === pickFilter);
    const m = new Map<string, Pick[]>();
    for (const p of filtered) {
      const list = m.get(p.code) ?? [];
      list.push(p);
      m.set(p.code, list);
    }
    return [...m.entries()].sort((a, b) =>
      countryName(a[0]).localeCompare(countryName(b[0])),
    );
  }, [picks, pickFilter]);

  const otherName = (c: Connection) => {
    const other = c.members.find((m) => m !== userId) ?? '';
    return c.names[other] || 'Member';
  };

  async function handleSend() {
    if (busy || !entry.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await sendRequest({ uid: userId, name: myName }, entry);
      setMessage({
        ok: res.ok,
        text: res.ok ? 'Request sent.' : (res.error ?? 'Something went wrong.'),
      });
      if (res.ok) setEntry('');
    } catch {
      setMessage({ ok: false, text: 'Couldn’t send the request. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  function copyCode() {
    if (!code) return;
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header className="pt-2">
        <p className="text-sm font-medium text-passport-gold">Your circle</p>
        <h1 className="font-display text-[2rem] leading-tight font-semibold text-passport-navy dark:text-white">
          Friends
        </h1>
        <p className="text-sm text-passport-ink2 dark:text-white/55 mt-1 max-w-md">
          Connect with people you trust. Their visits and recommendations appear
          right where you&rsquo;re planning.
        </p>
      </header>

      {demo ? (
        <div className="rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-3xl bg-brand-gradient flex items-center justify-center shadow-card">
            <Users size={26} className="text-white" />
          </div>
          <p className="font-display text-xl font-semibold text-passport-navy dark:text-white mb-1.5">
            Sign in to connect
          </p>
          <p className="text-sm text-passport-ink2 dark:text-white/60 max-w-xs mx-auto">
            Connecting needs an account — the local demo can&rsquo;t reach other
            people. Sign in to share your code and see friends&rsquo;
            recommendations.
          </p>
        </div>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white p-6 shadow-float text-center">
            <div
              className="pointer-events-none absolute -right-8 -bottom-10 h-40 w-40 rounded-full border border-white/15"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75 mb-2">
                Your invite code
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-2.5 font-display text-[2rem] font-semibold tracking-wider hover:opacity-90"
              >
                {code ?? '··· ···'}
                {copied ? <Check size={20} /> : <Copy size={18} className="opacity-70" />}
              </button>
              <p className="text-xs text-white/70 mt-2">
                Tap to copy, then share to connect.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-passport-ink3 px-1">
              Add someone by code
            </label>
            <div className="flex gap-2">
              <input
                value={entry}
                onChange={(e) => setEntry(e.target.value.toUpperCase())}
                placeholder="SD-XXXXXX"
                className={cn(inputClass, 'flex-1 min-w-0')}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={busy || !entry.trim()}
                className="inline-flex items-center gap-1.5 px-5 rounded-2xl text-sm font-semibold bg-brand-gradient text-white shadow-card hover:opacity-95 disabled:opacity-40 active:scale-[0.98] transition-all shrink-0"
              >
                <UserPlus size={16} /> Send
              </button>
            </div>
            {message && (
              <p
                className={cn(
                  'text-sm px-1',
                  message.ok
                    ? 'text-passport-brass'
                    : 'text-passport-burgundy dark:text-passport-expedition',
                )}
              >
                {message.text}
              </p>
            )}
          </section>

          {incoming.length > 0 && (
            <Section title="Requests">
              {incoming.map((c) => (
                <Row key={c.id} name={otherName(c)} subtitle="Wants to connect">
                  <IconBtn
                    label="Accept"
                    onClick={() => acceptConnection(c.id)}
                    tone="accept"
                  >
                    <Check size={16} />
                  </IconBtn>
                  <IconBtn
                    label="Decline"
                    onClick={() => removeConnection(c.id)}
                    tone="plain"
                  >
                    <X size={16} />
                  </IconBtn>
                </Row>
              ))}
            </Section>
          )}

          {friends.length > 0 && (
            <Section title="Connections">
              {friends.map((c) => (
                <Row key={c.id} name={otherName(c)} subtitle="Connected">
                  <IconBtn
                    label="Remove"
                    onClick={() => removeConnection(c.id)}
                    tone="plain"
                  >
                    <X size={16} />
                  </IconBtn>
                </Row>
              ))}
            </Section>
          )}

          {outgoing.length > 0 && (
            <Section title="Pending">
              {outgoing.map((c) => (
                <Row key={c.id} name={otherName(c)} subtitle="Request sent">
                  <IconBtn
                    label="Cancel"
                    onClick={() => removeConnection(c.id)}
                    tone="plain"
                  >
                    <X size={16} />
                  </IconBtn>
                </Row>
              ))}
            </Section>
          )}

          {picks.length > 0 && (
            <Section title="Friends’ picks">
              <div className="flex flex-wrap gap-2">
                <PickChip
                  label="All"
                  active={pickFilter === 'all'}
                  onClick={() => setPickFilter('all')}
                />
                {(
                  [
                    'recommend',
                    'hidden-gem',
                    'worth-visiting',
                    'overrated',
                    'avoid',
                  ] as RecommendationVerdict[]
                )
                  .filter((v) => presentVerdicts.has(v))
                  .map((v) => (
                    <PickChip
                      key={v}
                      label={VERDICT_META[v].label}
                      active={pickFilter === v}
                      onClick={() => setPickFilter(v)}
                    />
                  ))}
              </div>
              {groupedPicks.map(([countryCode, list]) => (
                <div
                  key={countryCode}
                  className="rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-4"
                >
                  <div className="flex items-center gap-2.5 mb-3 font-display text-lg font-semibold text-passport-navy dark:text-white">
                    <span className="h-9 w-9 rounded-xl bg-passport-cartridge dark:bg-white/5 flex items-center justify-center text-xl leading-none">
                      {flagEmoji(countryCode)}
                    </span>
                    {countryName(countryCode)}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((p, i) => (
                      <span
                        key={i}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border',
                          p.verdict
                            ? VERDICT_STYLE[p.verdict].chip
                            : 'bg-passport-navy/[0.04] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/65 border-black/10 dark:border-white/10',
                        )}
                      >
                        {p.name}
                        <span className="opacity-70">
                          · {p.friend}
                          {p.verdict ? ` · ${VERDICT_META[p.verdict].label}` : ''}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {incoming.length === 0 &&
            outgoing.length === 0 &&
            friends.length === 0 &&
            picks.length === 0 && (
              <p className="text-sm text-center text-passport-ink3 py-4">
                No connections yet. Share your code, or add someone above.
              </p>
            )}
        </>
      )}
    </div>
  );
}

function PickChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm border transition-colors',
        active
          ? 'bg-passport-navy text-white dark:bg-white dark:text-passport-navy shadow-card border-transparent'
          : 'border-black/15 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-passport-gold/60',
      )}
    >
      {label}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({
  name,
  subtitle,
  children,
}: {
  name: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-4 py-3">
      <div className="h-10 w-10 rounded-full bg-brand-gradient flex items-center justify-center font-semibold text-white shrink-0">
        {name[0]?.toUpperCase() ?? 'M'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-passport-ink dark:text-white/90 truncate capitalize">
          {name}
        </div>
        <div className="text-xs text-passport-ink3 dark:text-white/45">
          {subtitle}
        </div>
      </div>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  tone,
  children,
}: {
  label: string;
  onClick: () => void;
  tone: 'accept' | 'plain';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center h-9 w-9 rounded-full transition-all active:scale-95',
        tone === 'accept'
          ? 'bg-brand-gradient text-white shadow-card hover:opacity-90'
          : 'text-passport-ink3 hover:bg-passport-navy/[0.06] dark:hover:bg-white/10',
      )}
    >
      {children}
    </button>
  );
}
