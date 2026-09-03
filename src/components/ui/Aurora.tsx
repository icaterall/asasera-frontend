/**
 * Ambient page backdrop: three slowly drifting colour fields and a vignette
 * to keep text contrast up. Fixed and pointer-transparent, so it never
 * interferes with the layout.
 */
export function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-canvas" />

      <div
        className="animate-drift absolute -top-[22rem] -start-[14rem] size-[46rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--glow-a), transparent 68%)' }}
      />
      <div
        className="animate-drift-slow absolute -top-[10rem] -end-[18rem] size-[42rem] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, var(--glow-b), transparent 68%)' }}
      />
      <div
        className="animate-drift absolute top-[58%] start-[38%] size-[38rem] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, var(--glow-c), transparent 70%)' }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% 0%, transparent 30%, color-mix(in oklab, var(--canvas) 78%, transparent) 100%)',
        }}
      />
    </div>
  )
}
