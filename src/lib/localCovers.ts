// localStorage-backed country cover photos for demo mode.
const STORAGE_KEY = 'explorer:demo-covers';
const EVENT = 'explorer:demo-covers-changed';

function read(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function write(map: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeCovers(
  _userId: string,
  onChange: (map: Map<string, string>) => void,
): () => void {
  const emit = () => onChange(new Map(Object.entries(read())));
  emit();
  const handler = () => emit();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) emit();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
}

export async function setCover(
  _userId: string,
  countryCode: string,
  dataUrl: string,
): Promise<void> {
  const map = read();
  map[countryCode] = dataUrl;
  write(map);
}

export async function removeCover(
  _userId: string,
  countryCode: string,
): Promise<void> {
  const map = read();
  delete map[countryCode];
  write(map);
}
