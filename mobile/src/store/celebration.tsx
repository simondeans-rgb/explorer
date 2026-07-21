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
export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<CelebrationItem | null>(null);
  const queue = useRef<CelebrationItem[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNext = useCallback(() => {
    const next = queue.current.shift() ?? null;
    setCurrent(next);
  }, []);

  const celebrate = useCallback(
    (item: CelebrationItem) => {
      queue.current.push(item);
      setCurrent((c) => c ?? queue.current.shift() ?? null);
    },
    [],
  );

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    showNext();
  }, [showNext]);

  useEffect(() => {
    if (!current) return;
    hSuccess(); // a success buzz the moment any celebration appears
    timer.current = setTimeout(() => showNext(), 3600);
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
