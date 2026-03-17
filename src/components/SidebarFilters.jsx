import {
  ActivitySquare,
  Database,
  Filter,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Wifi,
} from "lucide-react";

function SidebarFilters({
  endpointUrl,
  mode,
  dataset,
  compareEnabled,
  selectedNodeTypes,
  nodeTypes,
  attributeQuery,
  onEndpointUrlChange,
  onModeChange,
  onToggleCompare,
  onToggleNodeType,
  onAttributeQueryChange,
  onLoadDataset,
  onResetFilters,
  onSelectAllNodes,
  onClearAllNodes,
}) {
  const modeButtonBase =
    "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition";

  return (
    <section className="glass-panel rounded-[30px] px-5 py-5 xl:sticky xl:top-0">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-700">
          <SlidersHorizontal className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Sidebar Filters
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
            Dataset controls
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded-[24px] border border-[var(--muted-border)] bg-white/55 p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-700">
              {mode === "sample" ? <Database className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Dataset mode
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Switch between the bundled sample cohort and a live endpoint preview.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-900/5 p-1">
            <button
              type="button"
              className={`${modeButtonBase} ${
                mode === "sample"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-white/60"
              }`}
              onClick={() => onModeChange("sample")}
            >
              Sample Dataset
            </button>
            <button
              type="button"
              className={`${modeButtonBase} ${
                mode === "live"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-white/60"
              }`}
              onClick={() => onModeChange("live")}
            >
              Live Endpoint
            </button>
          </div>

          <label className="mt-4 block text-sm font-medium text-[var(--text-primary)]">
            GraphQL Endpoint Input
            <input
              type="url"
              value={endpointUrl}
              onChange={(event) => onEndpointUrlChange(event.target.value)}
              placeholder="https://api.example.com/graphql"
              className="mt-2 w-full rounded-2xl border border-[var(--muted-border)] bg-white/80 px-4 py-3 font-mono text-sm text-[var(--text-primary)] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
            />
          </label>

          <div className="mt-3 rounded-2xl border border-violet-500/10 bg-violet-500/6 px-3 py-3 text-xs leading-5 text-[var(--text-secondary)]">
            {mode === "sample"
              ? `${dataset.label} is selected for local exploration.`
              : "Live mode uses the selected cohort as a preview snapshot until entity queries are mapped to the endpoint."}
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--muted-border)] bg-white/55 p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700">
              <ActivitySquare className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Dataset comparison mode
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Compare the active cohort against a secondary research snapshot.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleCompare(!compareEnabled)}
            className={`mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              compareEnabled
                ? "border-violet-500/25 bg-violet-500/10 text-violet-800"
                : "border-[var(--muted-border)] bg-white/70 text-[var(--text-secondary)] hover:bg-white"
            }`}
          >
            <span>Compare Datasets</span>
            <span
              className={`inline-flex h-6 w-11 items-center rounded-full p-1 transition ${
                compareEnabled ? "bg-violet-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full bg-white transition ${
                  compareEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
          </button>
        </section>

        <section className="rounded-[24px] border border-[var(--muted-border)] bg-white/55 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                <Filter className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Node type filters
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {selectedNodeTypes.length} of {nodeTypes.length} entities visible.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSelectAllNodes}
                className="rounded-xl border border-[var(--muted-border)] bg-white/75 px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition hover:bg-white"
              >
                All
              </button>
              <button
                type="button"
                onClick={onClearAllNodes}
                className="rounded-xl border border-[var(--muted-border)] bg-white/75 px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition hover:bg-white"
              >
                None
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {nodeTypes.map((nodeType) => {
              const selected = selectedNodeTypes.includes(nodeType);

              return (
                <label
                  key={nodeType}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    selected
                      ? "border-violet-500/20 bg-violet-500/8 text-violet-900"
                      : "border-[var(--muted-border)] bg-white/70 text-[var(--text-secondary)] hover:bg-white"
                  }`}
                >
                  <span>{nodeType}</span>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleNodeType(nodeType)}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--muted-border)] bg-white/55 p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
              <Search className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Attribute search
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Filter heatmap columns by attribute name.
              </p>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={attributeQuery}
              onChange={(event) => onAttributeQueryChange(event.target.value)}
              placeholder="Search attributes"
              className="w-full rounded-2xl border border-[var(--muted-border)] bg-white/80 py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
            />
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <button
            type="button"
            onClick={onLoadDataset}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <Database className="h-4 w-4" />
            Load Dataset
          </button>

          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--muted-border)] bg-white/70 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:bg-white"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset Filters
          </button>
        </div>
      </div>
    </section>
  );
}

export default SidebarFilters;