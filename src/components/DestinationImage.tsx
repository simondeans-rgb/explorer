import { useEffect, useState } from 'react';
import { destinationImage } from '../lib/destinationImage';
import { flagEmoji } from '../lib/flags';
import { cn } from '../lib/cn';

/**
 * Destination backdrop: an on-brand gradient that always renders, with a
 * bundled photo (when one exists for the country) fading in over it once it
 * loads. When there's no photo, a large faded flag is shown over the gradient
 * so every country still reads as a designed "picture", never a blank panel.
 */
export function DestinationImage({
  code,
  className,
  rounded = '',
  children,
  scrim = false,
}: {
  code: string;
  /** Deprecated — images are bundled at a fixed size; kept for call-site compat. */
  width?: number;
  className?: string;
  rounded?: string;
  children?: React.ReactNode;
  scrim?: boolean;
}) {
  const { photo, gradient } = destinationImage(code);
  const [loaded, setLoaded] = useState(false);

  // Reset when the country changes so the fade plays again.
  useEffect(() => {
    setLoaded(false);
  }, [photo]);

  return (
    <div
      className={cn('relative overflow-hidden', rounded, className)}
      style={{ backgroundImage: gradient }}
    >
      {/* No-photo fallback: a big translucent flag motif over the gradient. */}
      {!photo && code && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center select-none"
        >
          <span className="text-[7rem] leading-none opacity-25 blur-[1px]">
            {flagEmoji(code)}
          </span>
        </div>
      )}
      {photo && (
        <img
          src={photo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
      {scrim && <div className="absolute inset-0 hero-scrim" />}
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}

