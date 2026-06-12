// A deterministic, on-brand illustrated "postcard" for any country that has no
// bundled photo — so every place still reads as a designed picture rather than
// a flat panel. The palette and scene archetype are chosen from a stable hash
// of the country code, giving each country its own consistent look.

interface Palette {
  sky: [string, string];
  sun: string;
  layers: [string, string, string];
}

// Bright, travel-magazine palettes drawn from the Worldly spectrum.
const PALETTES: Palette[] = [
  { sky: ['#9B7CFF', '#FF6B9A'], sun: '#FFE0B0', layers: ['#FF8FB0', '#E85C8E', '#3B2A57'] }, // sunrise
  { sky: ['#24D1C3', '#9B7CFF'], sun: '#FFF6DE', layers: ['#52E0D2', '#2C9FB4', '#173B57'] }, // tropical
  { sky: ['#FFB84D', '#FF6B9A'], sun: '#FFF6E0', layers: ['#FFC98A', '#E8915A', '#7A3F2A'] }, // desert
  { sky: ['#7C6BFF', '#24D1C3'], sun: '#FFE6F2', layers: ['#8A7BFF', '#5B57C4', '#1B2447'] }, // dusk
  { sky: ['#FF6B9A', '#FFB84D'], sun: '#FFF3D6', layers: ['#FF93B4', '#FF7A66', '#5A2A3A'] }, // coral
  { sky: ['#36C8E0', '#7C6BFF'], sun: '#FFF4E0', layers: ['#5FD6EA', '#3E8FD0', '#16314F'] }, // ocean
];

type SceneKind = 'mountains' | 'hills' | 'dunes' | 'skyline' | 'coast';
const SCENES: SceneKind[] = ['mountains', 'hills', 'dunes', 'skyline', 'coast'];

function hashOf(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 53 + code.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function CountryScene({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const seed = hashOf(code || 'WW');
  const pal = PALETTES[seed % PALETTES.length];
  const scene = SCENES[Math.floor(seed / PALETTES.length) % SCENES.length];
  const sunX = 60 + (seed % 5) * 50; // 60…260
  const clouds = (seed >> 3) % 2 === 0;
  const gid = `cs-${code || 'WW'}`;

  return (
    <svg
      className={className}
      viewBox="0 0 320 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.sky[0]} />
          <stop offset="1" stopColor={pal.sky[1]} />
        </linearGradient>
        <radialGradient id={`${gid}-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={pal.sun} />
          <stop offset="0.55" stopColor={pal.sun} stopOpacity="0.9" />
          <stop offset="1" stopColor={pal.sun} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="240" fill={`url(#${gid}-sky)`} />

      {/* Sun / moon glow */}
      <circle cx={sunX} cy="78" r="60" fill={`url(#${gid}-sun)`} />
      <circle cx={sunX} cy="78" r="26" fill={pal.sun} opacity="0.95" />

      {clouds && (
        <g fill="#FFFFFF" opacity="0.55">
          <ellipse cx={(sunX + 150) % 300} cy="56" rx="34" ry="11" />
          <ellipse cx={(sunX + 70) % 300} cy="40" rx="24" ry="9" />
        </g>
      )}

      {scene === 'mountains' && <Mountains pal={pal} />}
      {scene === 'hills' && <Hills pal={pal} />}
      {scene === 'dunes' && <Dunes pal={pal} />}
      {scene === 'skyline' && <Skyline pal={pal} sun={pal.sun} />}
      {scene === 'coast' && <Coast pal={pal} sunX={sunX} />}
    </svg>
  );
}

function Mountains({ pal }: { pal: Palette }) {
  return (
    <g>
      <path
        d="M0 158 L52 104 L104 150 L150 110 L210 156 L262 108 L320 150 L320 240 L0 240 Z"
        fill={pal.layers[0]}
      />
      <path
        d="M0 240 L0 182 L70 128 L128 172 L196 124 L320 176 L320 240 Z"
        fill={pal.layers[1]}
      />
      {/* snow caps on the front peaks */}
      <path d="M70 128 L86 140 L70 146 L58 140 Z" fill="#FFFFFF" opacity="0.85" />
      <path d="M196 124 L212 137 L196 143 L182 137 Z" fill="#FFFFFF" opacity="0.85" />
      <path
        d="M0 240 L0 214 L88 162 L160 202 L242 158 L320 206 L320 240 Z"
        fill={pal.layers[2]}
      />
    </g>
  );
}

function Hills({ pal }: { pal: Palette }) {
  return (
    <g>
      <path
        d="M0 164 Q 80 124 160 164 Q 240 204 320 158 L320 240 L0 240 Z"
        fill={pal.layers[0]}
      />
      <path
        d="M0 192 Q 96 156 192 192 Q 264 218 320 188 L320 240 L0 240 Z"
        fill={pal.layers[1]}
      />
      <path
        d="M0 216 Q 70 194 150 214 Q 240 236 320 210 L320 240 L0 240 Z"
        fill={pal.layers[2]}
      />
    </g>
  );
}

function Dunes({ pal }: { pal: Palette }) {
  return (
    <g>
      <path
        d="M0 156 C 70 118 130 196 210 156 C 262 130 300 168 320 152 L320 240 L0 240 Z"
        fill={pal.layers[0]}
      />
      <path
        d="M0 190 C 80 160 140 214 230 184 C 276 168 304 198 320 186 L320 240 L0 240 Z"
        fill={pal.layers[1]}
      />
      <path
        d="M0 222 C 90 202 150 236 240 216 C 280 207 305 224 320 218 L320 240 L0 240 Z"
        fill={pal.layers[2]}
      />
    </g>
  );
}

function Skyline({ pal, sun }: { pal: Palette; sun: string }) {
  const buildings = [
    [10, 168], [38, 150], [62, 178], [86, 138], [118, 160], [146, 124],
    [178, 158], [206, 144], [236, 170], [262, 132], [292, 162],
  ];
  const w = 24;
  return (
    <g>
      <path
        d="M0 196 Q 110 176 220 192 Q 280 200 320 188 L320 240 L0 240 Z"
        fill={pal.layers[1]}
      />
      <g fill={pal.layers[2]}>
        {buildings.map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={w} height={240 - y} rx="2" />
        ))}
      </g>
      {/* a few lit windows */}
      <g fill={sun} opacity="0.7">
        {buildings.map(([x, y], i) =>
          i % 2 === 0 ? (
            <rect key={i} x={x + 7} y={y + 12} width="4" height="4" rx="1" />
          ) : null,
        )}
      </g>
    </g>
  );
}

function Coast({ pal, sunX }: { pal: Palette; sunX: number }) {
  return (
    <g>
      {/* sea */}
      <rect x="0" y="150" width="320" height="60" fill={pal.layers[0]} />
      {/* sun reflection */}
      <rect x={sunX - 8} y="150" width="16" height="46" fill={pal.sun} opacity="0.4" />
      <g stroke={pal.layers[1]} strokeWidth="2" opacity="0.6">
        <line x1="20" y1="166" x2="80" y2="166" />
        <line x1="220" y1="174" x2="290" y2="174" />
        <line x1="120" y1="186" x2="190" y2="186" />
      </g>
      {/* beach */}
      <path
        d="M0 196 Q 160 178 320 198 L320 240 L0 240 Z"
        fill={pal.layers[2]}
      />
    </g>
  );
}
