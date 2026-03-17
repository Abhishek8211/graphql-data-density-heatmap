function getGaugeTone(score) {
  if (score >= 80) {
    return {
      stroke: "#10b981",
      track: "rgba(16, 185, 129, 0.18)",
      label: "High quality",
      description:
        "This dataset has strong completeness coverage across the visible entity fields.",
    };
  }

  if (score >= 60) {
    return {
      stroke: "#f59e0b",
      track: "rgba(245, 158, 11, 0.18)",
      label: "Moderate quality",
      description:
        "The dataset is analytically usable, but several fields still show moderate sparsity.",
    };
  }

  return {
    stroke: "#ef4444",
    track: "rgba(239, 68, 68, 0.18)",
    label: "Sparse dataset",
    description:
      "Coverage gaps are large enough that downstream research analyses may need field-level caveats.",
  };
}

function QualityScoreGauge({ score, insights, comparisonScore }) {
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.max(0, Math.min(score, 100));
  const dashOffset = circumference - (normalizedScore / 100) * circumference;
  const tone = getGaugeTone(normalizedScore);
  const comparisonDelta =
    typeof comparisonScore === "number"
      ? normalizedScore - Math.round(comparisonScore)
      : null;

  return (
    <section className="glass-panel rounded-[30px] px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Section C
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
            Dataset Quality Score
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            A radial score based on visible heatmap cells and the average
            completeness across selected entities and attributes.
          </p>
        </div>

        <span className="inline-flex rounded-full border border-white/35 bg-white/60 px-3 py-1.5 text-sm font-medium text-[var(--text-primary)]">
          {tone.label}
        </span>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)] xl:items-center">
        <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-full bg-white/50 shadow-inner">
          <svg viewBox="0 0 220 220" className="h-52 w-52 -rotate-90">
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={tone.track}
              strokeWidth="16"
            />
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={tone.stroke}
              strokeLinecap="round"
              strokeWidth="16"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
            <circle cx="110" cy="110" r="58" fill="rgba(255,255,255,0.86)" />
            <text
              x="110"
              y="104"
              fill="#0f172a"
              fontSize="34"
              fontWeight="700"
              textAnchor="middle"
              transform="rotate(90 110 110)"
            >
              {normalizedScore}%
            </text>
            <text
              x="110"
              y="126"
              fill="#64748b"
              fontSize="11"
              fontWeight="700"
              letterSpacing="3"
              textAnchor="middle"
              transform="rotate(90 110 110)"
            >
              QUALITY
            </text>
          </svg>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[24px] border border-[var(--muted-border)] bg-white/65 p-4 sm:col-span-2 xl:col-span-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Interpretation
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {tone.description}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--muted-border)] bg-white/65 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Total Records
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {insights.totalRecords}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--muted-border)] bg-white/65 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Sparse Fields
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {insights.sparseFieldsCount}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--muted-border)] bg-white/65 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Comparison Delta
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {comparisonDelta === null
                ? "--"
                : `${comparisonDelta > 0 ? "+" : ""}${comparisonDelta}`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QualityScoreGauge;
