import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Check, ImagePlus, X } from 'lucide-react';
import { createCapture } from '../../lib/captures';
import { fileToCompactJpeg } from '../../lib/imageCompress';
import type { Expedition } from '../../types';
import { cn } from '../../lib/cn';
import { inputClass } from '../../lib/formClass';
import { useToast } from '../../contexts/toast';
import { CountryPicker, Field } from '../forms';

export interface CaptureModalInitial {
  countryCode?: string;
  city?: string;
  expeditionId?: string;
  discoveryId?: string;
}

interface Props {
  userId: string;
  initial?: CaptureModalInitial;
  expeditions: Expedition[];
  onClose: () => void;
}

export function AddCaptureModal({
  userId,
  initial = {},
  expeditions,
  onClose,
}: Props) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dataUrl, setDataUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [countryCode, setCountryCode] = useState(initial.countryCode ?? '');
  const [city, setCity] = useState(initial.city ?? '');
  const [expeditionId, setExpeditionId] = useState(initial.expeditionId ?? '');
  const [processing, setProcessing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      setDataUrl(await fileToCompactJpeg(file));
    } finally {
      setProcessing(false);
    }
  }

  const canSave = dataUrl.length > 0 && !processing;

  async function handleSave() {
    if (!canSave || busy) return;
    setBusy(true);
    try {
      await createCapture(userId, {
        dataUrl,
        countryCode: countryCode || undefined,
        city: city.trim() || undefined,
        expeditionId: expeditionId || undefined,
        discoveryId: initial.discoveryId || undefined,
        caption: caption.trim() || undefined,
      });
      onClose();
    } catch {
      toast({ kind: 'error', message: 'Couldn’t save your photo — try again' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          'w-full sm:max-w-md max-h-[92vh] overflow-y-auto no-scrollbar',
          'rounded-t-3xl sm:rounded-3xl shadow-float animate-rise-in',
          'bg-passport-cartridge dark:bg-passport-carddark',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-passport-navy/[0.06] dark:border-white/10">
          <h2 className="font-display text-lg font-semibold text-passport-navy dark:text-white/90">
            Add a photo
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/50 dark:text-white/50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              'relative w-full overflow-hidden rounded-2xl shadow-card transition-all active:scale-[0.99]',
              dataUrl
                ? 'aspect-[4/3]'
                : 'aspect-[4/3] bg-white dark:bg-white/5 grid place-items-center',
            )}
          >
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="Capture preview"
                className="h-full w-full object-cover vivid-photo"
              />
            ) : (
              <span className="flex flex-col items-center gap-2 text-passport-ink3">
                <ImagePlus size={28} />
                <span className="text-sm font-medium">
                  {processing ? 'Processing…' : 'Choose a photo'}
                </span>
              </span>
            )}
            {dataUrl && (
              <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                Change
              </span>
            )}
          </button>

          <Field label="Caption">
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional — a few words about this moment"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Country">
              <CountryPicker
                value={countryCode}
                onChange={setCountryCode}
                placeholder="Optional"
              />
            </Field>
            <Field label="City">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </Field>
          </div>

          {expeditions.length > 0 && (
            <Field label="Journey">
              <select
                value={expeditionId}
                onChange={(e) => setExpeditionId(e.target.value)}
                className={inputClass}
              >
                <option value="">None</option>
                {expeditions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-passport-navy/[0.06] dark:border-white/10">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || busy}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              'bg-brand-gradient text-white shadow-card',
              'hover:opacity-95 active:scale-[0.99]',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <Check size={16} />
            {busy ? 'Saving…' : 'Save photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
