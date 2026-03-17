function HeatmapLegend() {
  const stops = [0, 25, 50, 75, 100];

  return (
    <section className="rounded-[26px] border border-[var(--muted-border)] bg-white/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Heatmap legend
          </p>
          <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
            Attribute completeness scale
          </h3>
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          White marks sparse values, while deep purple marks dense coverage.
        </p>
      </div>

      <div className="mt-4 h-3 rounded-full bg-[linear-gradient(90deg,#ffffff_0%,#fff3bf_25%,#fb923c_50%,#ef4444_75%,#5b21b6_100%)] shadow-inner" />

      <div className="mt-3 grid grid-cols-5 text-xs font-medium text-[var(--text-muted)]">
        {stops.map((stop) => (
          <span
            key={stop}
            className="text-center first:text-left last:text-right"
          >
            {stop}%
          </span>
        ))}
      </div>
    </section>
  );
}

export default HeatmapLegend;
