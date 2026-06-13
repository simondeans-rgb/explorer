/** A friendly display name derived from an email's local part. */
export function memberName(email: string): string {
  const local = (email.split('@')[0] || 'Explorer').replace(/[._-]+/g, ' ');
  return local
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
