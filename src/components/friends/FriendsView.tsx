import { useMemo, useState } from 'react';
import { Check, Copy, UserPlus, Users, X } from 'lucide-react';
import {
  acceptConnection,
  removeConnection,
  sendRequest,
  type Connection,
} from '../../lib/connections';
import { cn } from '../../lib/cn';
import { inputClass } from '../../lib/formClass';

interface Props {
  userId: string;
  myName: string;
  code: string | null;
  connections: Connection[];
  demo: boolean;
}

export function FriendsView({ userId, myName, code, connections, demo }: Props) {
  const [entry, setEntry] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

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

  const otherName = (c: Connection) => {
    const other = c.members.find((m) => m !== userId) ?? '';
    return c.names[other] || 'Member';
  };

  async function handleSend() {
    if (busy || !entry.trim()) return;
    setBusy(true);
    setMessage(null);
    const res = await sendRequest({ uid: userId, name: myName }, entry);
    setMessage({
      ok: res.ok,
      text: res.ok ? 'Request sent.' : (res.error ?? 'Something went wrong.'),
    });
    if (res.ok) setEntry('');
    setBusy(false);
  }

  function copyCode() {
    if (!code) return;
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header className="text-center">
        <Users size={26} className="mx-auto text-passport-gold mb-2" />
        <h1 className="font-display text-3xl font-semibold text-passport-navy dark:text-white/90">
          Fellow Members
        </h1>
        <p className="text-sm text-black/55 dark:text-white/55 mt-1 max-w-md mx-auto">
          Connect with people you trust. When you plan a place, their visits and
          recommendations appear in your Passport.
        </p>
      </header>

      {demo ? (
        <div className="rounded-xl border border-dashed border-passport-gold/40 bg-passport-card/60 dark:bg-passport-carddark/60 p-6 text-center">
          <p className="font-display text-xl font-semibold text-passport-navy dark:text-white/90 mb-1">
            Sign in to connect
          </p>
          <p className="text-sm text-black/55 dark:text-white/55">
            Connecting with fellow Members needs a Society account — the local
            demo can&rsquo;t reach other Members. Sign in to share codes and see
            friends&rsquo; recommendations.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-xl bg-passport-navy text-passport-parchment p-5 shadow-page text-center">
            <div className="text-[10px] uppercase tracking-[0.28em] text-passport-goldsoft mb-2">
              Your Member code
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-2 font-display text-3xl font-semibold tracking-wider hover:opacity-90"
            >
              {code ?? '··· ···'}
              {copied ? (
                <Check size={18} className="text-passport-goldsoft" />
              ) : (
                <Copy size={18} className="opacity-60" />
              )}
            </button>
            <p className="text-xs text-passport-parchment/55 mt-2">
              Share this code with someone to connect.
            </p>
          </section>

          <section className="space-y-2">
            <label className="block text-[11px] uppercase tracking-[0.16em] text-black/45 dark:text-white/45">
              Add a Member by code
            </label>
            <div className="flex gap-2">
              <input
                value={entry}
                onChange={(e) => setEntry(e.target.value.toUpperCase())}
                placeholder="SD-XXXXXX"
                className={inputClass}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={busy || !entry.trim()}
                className="inline-flex items-center gap-1.5 px-4 rounded-xl text-sm font-medium bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink hover:opacity-90 disabled:opacity-40 shrink-0"
              >
                <UserPlus size={15} /> Send
              </button>
            </div>
            {message && (
              <p
                className={cn(
                  'text-sm',
                  message.ok
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400',
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

          {incoming.length === 0 &&
            outgoing.length === 0 &&
            friends.length === 0 && (
              <p className="text-sm text-center text-black/45 dark:text-white/45">
                No connections yet. Share your code, or add a Member above.
              </p>
            )}
        </>
      )}
    </div>
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
    <section className="space-y-2">
      <h2 className="font-display text-lg font-semibold text-passport-navy dark:text-white/90">
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
    <div className="flex items-center gap-3 rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/10 dark:border-white/10 shadow-page px-4 py-3">
      <div className="h-9 w-9 rounded-full bg-passport-navy/[0.06] dark:bg-white/[0.06] flex items-center justify-center font-display text-lg font-semibold text-passport-navy dark:text-passport-goldsoft shrink-0">
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
        'inline-flex items-center justify-center h-8 w-8 rounded-full transition-colors',
        tone === 'accept'
          ? 'bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink hover:opacity-90'
          : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10',
      )}
    >
      {children}
    </button>
  );
}
