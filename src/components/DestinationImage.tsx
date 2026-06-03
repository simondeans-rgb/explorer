import { useEffect, useState } from 'react';
import { destinationImage } from '../lib/destinationImage';
import { cn } from '../lib/cn';

/**
 * Destination backdrop: an on-brand gradient that always renders, with a
 * curated photo (when one exists for the country) fading in over it once it
 * loads. If the photo fails — offline, blocked network, no curated image — the
 * gradient simply stays, so there are never broken-image states.
 */
export function DestinationImage({
  code,
  width = 800,
  className,
  rounded = '',
  children,
  scrim = false,
}: {
  code: string;
  width?: number;
  className?: string;
  rounded?: string;
  children?: React.ReactNode;
  scrim?: boolean;
}) {
  const { photo, gradient } = destinationImage(code, width);
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
