/** The Society seal — a gold disc bearing a navy globe-and-compass crest.
 *  Per the Brand Book, the seal is Gold Seal (#C9A84C) with the navy globe
 *  crest, and sits bottom-right on passport pages. */
export function Crest({ size = 46 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size, backgroundColor: '#C9A84C' }}
    >
      <svg
        width={size * 0.74}
        height={size * 0.74}
        viewBox="0 0 42 42"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g fill="none" stroke="#0D1B2E">
          <circle cx="21" cy="21" r="19" strokeWidth="0.6" opacity="0.5" />
          <circle cx="21" cy="21" r="14" strokeWidth="1.2" opacity="0.85" />
          <ellipse cx="21" cy="21" rx="14" ry="7" strokeWidth="0.6" opacity="0.5" />
          <line x1="7" y1="21" x2="35" y2="21" strokeWidth="0.6" opacity="0.5" />
          <ellipse cx="21" cy="21" rx="1" ry="14" strokeWidth="0.6" opacity="0.5" />
        </g>
        <g fill="#0D1B2E">
          <polygon points="21,5 22.5,10 21,9 19.5,10" opacity="0.75" />
          <polygon points="21,37 22.5,32 21,33 19.5,32" opacity="0.75" />
          <polygon points="5,21 10,19.5 9,21 10,22.5" opacity="0.75" />
          <polygon points="37,21 32,19.5 33,21 32,22.5" opacity="0.75" />
          <circle cx="21" cy="21" r="1.8" opacity="0.85" />
        </g>
      </svg>
    </span>
  );
}
