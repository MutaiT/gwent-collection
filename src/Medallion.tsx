/** Progress ring styled as an engraved medallion. */
export function Medallion({ owned, total }: { owned: number; total: number }) {
  const pct = total ? owned / total : 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);
  return (
    <div className={`medallion ${pct === 1 ? 'complete' : ''}`} role="img" aria-label={`${Math.floor(pct * 100)}% collected`}>
      <svg viewBox="0 0 128 128">
        <defs>
          <radialGradient id="med-fill" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#3a332a" />
            <stop offset="100%" stopColor="#14110d" />
          </radialGradient>
          <linearGradient id="med-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3d98b" />
            <stop offset="50%" stopColor="#c9a45c" />
            <stop offset="100%" stopColor="#7d5f2a" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r="62" fill="url(#med-fill)" stroke="#5a4a32" strokeWidth="2" />
        {ticks.map((a) => (
          <line key={a} x1="64" y1="5" x2="64" y2={a % 30 === 0 ? 12 : 9} stroke="#6d5a3a" strokeWidth="1.5" transform={`rotate(${a} 64 64)`} />
        ))}
        <circle cx="64" cy="64" r={r} fill="none" stroke="#2a241c" strokeWidth="8" />
        <circle
          className="med-progress"
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="url(#med-ring)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 64 64)"
        />
        <text x="64" y="66" textAnchor="middle" className="med-pct">
          {Math.floor(pct * 100)}%
        </text>
        <text x="64" y="84" textAnchor="middle" className="med-label">
          {owned} / {total}
        </text>
      </svg>
    </div>
  );
}
