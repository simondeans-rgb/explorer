import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Celebration, type CelebrationItem } from '../../components/Celebration';
import { hSuccess } from '../lib/haptics';

interface CelebrationApi {
  celebrate: (item: CelebrationItem) => void;
}

const CelebrationContext = createContext<CelebrationApi>({ celebrate: () => {} });

export function useCelebration(): CelebrationApi {
  return useContext(CelebrationContext);
}

/** Shows one celebration at a time; extra ones queue and play in sequence. */
const keyOf = (i: CelebrationItem) => `${i.variant ?? 'confetti'}:${i.title}`;

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<CelebrationItem | null>(null);
  const currentRef = useRef<CelebrationItem | null>(null);
  const queue = useRef<CelebrationItem[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  currentRef.current = current;

  const showNext = useCallback(() => {
    const next = queue.current.shift() ?? null;
    setCurrent(next);
  }, []);

  const celebrate = useCallback((item: CelebrationItem) => {
    // Coalesce (R38): never stack an identical celebration onto the one showing
    // or the last queued — a batch unlock shouldn't buzz/confetti N times.
    const key = keyOf(item);
    const lastQueued = queue.current[queue.current.length - 1];
    const against = lastQueued ?? currentRef.current;
    if (against && keyOf(against) === key) return;
    queue.current.push(item);
    setCurrent((c) => c ?? queue.current.shift() ?? null);
  }, []);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    showNext();
  }, [showNext]);

  useEffect(() => {
    if (!current) return;
    hSuccess(); // a success buzz the moment any celebration appears
    // Balloons rise more slowly, so give them longer on screen to finish.
    const holdMs = current.variant === 'balloons' ? 5600 : 3600;
    timer.current = setTimeout(() => showNext(), holdMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [current, showNext]);

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      {current ? <Celebration item={current} onDismiss={dismiss} /> : null}
    </CelebrationContext.Provider>
  );
}
