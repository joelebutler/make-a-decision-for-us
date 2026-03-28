export function Background() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="pointer-events-none absolute left-1/2 -top-50 h-[80vh] w-[160vw] -translate-x-1/2 blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--brand) -60%, transparent 70%)",
        }}
      />

      <div className="absolute inset-0">
        <svg
          width="100%"
          height="100%"
          className="absolute animate-spin-slow left-1/4 top-[18%] opacity-30"
          style={{ width: "30vw", height: "30vw" }}
        >
          <defs>
            <radialGradient id="circle-gradient">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        <svg
          width="100%"
          height="100%"
          className="absolute animate-pulse left-2/3 top-[28%] opacity-20"
          style={{ width: "20vw", height: "20vw" }}
        >
          <defs>
            <linearGradient id="rect-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
