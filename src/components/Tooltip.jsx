function Tooltip({ tooltip }) {
  if (!tooltip?.cell) {
    return null;
  }

  const { cell, x, y } = tooltip;

  return (
    <div
      className="pointer-events-none absolute z-20 w-64 rounded-xl border border-rose-200 bg-white/95 p-3 shadow-xl"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <p className="text-xs uppercase tracking-wide text-rose-700">Node</p>
      <p className="text-sm font-semibold text-slate-900">{cell.nodeType}</p>

      <p className="mt-2 text-xs uppercase tracking-wide text-rose-700">
        Attribute
      </p>
      <p className="text-sm font-semibold text-slate-900">{cell.attribute}</p>

      <p className="mt-2 text-xs uppercase tracking-wide text-rose-700">
        Density
      </p>
      <p className="text-sm font-semibold text-slate-900">
        {(cell.density * 100).toFixed(1)}%
      </p>
    </div>
  );
}

export default Tooltip;
