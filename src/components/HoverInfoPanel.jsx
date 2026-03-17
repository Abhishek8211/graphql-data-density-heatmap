import { formatPercent } from "../utils/density";

function getStatusTone(density) {
  if (density >= 0.8) {
    return "bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20";
  }

  if (density >= 0.6) {
    return "bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/20";
  }

  return "bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/20";
}

function HoverInfoPanel({ hoverInfo }) {
  if (!hoverInfo?.cell) {
    return null;
  }

  const panelWidth = 288;
  const left = Math.min(
    hoverInfo.clientX + 18,
    window.innerWidth - panelWidth - 20,
  );
  const top = Math.min(hoverInfo.clientY + 18, window.innerHeight - 248);
  const missingValues = hoverInfo.cell.missingCount ?? 0;
  const presentValues = hoverInfo.cell.nonNullCount ?? 0;

  return (
    <div
      className="pointer-events-none fixed z-[70] w-72 rounded-[24px] border border-white/35 bg-[var(--panel-bg-strong)] p-4 shadow-2xl backdrop-blur-2xl animate-fade-in"
      style={{ left, top }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)]">
            Hover Data Panel
          </p>
          <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
            {hoverInfo.sourceTitle}
          </h3>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusTone(hoverInfo.cell.density)}`}
        >
          {hoverInfo.cell.isMissing
            ? "No values"
            : formatPercent(hoverInfo.cell.density)}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-[var(--text-secondary)]">
        <div className="rounded-2xl bg-white/65 p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Node Type
          </dt>
          <dd className="mt-1 font-semibold text-[var(--text-primary)]">
            {hoverInfo.cell.nodeType}
          </dd>
        </div>

        <div className="rounded-2xl bg-white/65 p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Attribute
          </dt>
          <dd className="mt-1 font-semibold text-[var(--text-primary)]">
            {hoverInfo.cell.attribute}
          </dd>
        </div>

        <div className="rounded-2xl bg-white/65 p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Completeness
          </dt>
          <dd className="mt-1 font-semibold text-[var(--text-primary)]">
            {hoverInfo.cell.isMissing
              ? "n/a"
              : formatPercent(hoverInfo.cell.density, 1)}
          </dd>
        </div>

        <div className="rounded-2xl bg-white/65 p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Total Records
          </dt>
          <dd className="mt-1 font-semibold text-[var(--text-primary)]">
            {hoverInfo.cell.totalCount}
          </dd>
        </div>

        <div className="rounded-2xl bg-white/65 p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Missing Values
          </dt>
          <dd className="mt-1 font-semibold text-[var(--text-primary)]">
            {missingValues}
          </dd>
        </div>

        <div className="rounded-2xl bg-white/65 p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Present Values
          </dt>
          <dd className="mt-1 font-semibold text-[var(--text-primary)]">
            {presentValues}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default HoverInfoPanel;
