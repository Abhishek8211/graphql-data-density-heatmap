import { useState } from "react";
import {
  ChevronDown,
  Download,
  Github,
  MoonStar,
  PanelsTopLeft,
  SlidersHorizontal,
  SunMedium,
} from "lucide-react";

function Header({
  datasetOptions,
  selectedDatasetId,
  onDatasetChange,
  theme,
  onToggleTheme,
  onOpenFilters,
  exportActions,
  githubUrl,
}) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  return (
    <header className="glass-panel rounded-[30px] px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onOpenFilters}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--muted-border)] bg-white/50 text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:bg-white/70 md:inline-flex xl:hidden"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-[var(--text-muted)]">
              Research dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              GraphQL Data Density Heatmap Explorer
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)] sm:text-base">
              Analyze dataset completeness across GraphQL entities.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_auto_auto_auto] sm:items-end">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
              Dataset selector
            </span>
            <div className="relative">
              <select
                value={selectedDatasetId}
                onChange={(event) => onDatasetChange(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-[var(--muted-border)] bg-white/65 px-4 py-3 pr-11 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              >
                {datasetOptions.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
          </label>

          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--muted-border)] bg-white/60 px-4 text-sm font-medium text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:bg-white/80"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <MoonStar className="h-4 w-4" />
            ) : (
              <SunMedium className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {theme === "light" ? "Dark" : "Light"}
            </span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsExportMenuOpen((currentState) => !currentState)
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--muted-border)] bg-white/60 px-4 text-sm font-medium text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:bg-white/80"
              aria-expanded={isExportMenuOpen}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {isExportMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 min-w-64 rounded-3xl border border-white/30 bg-[var(--panel-bg-strong)] p-2 shadow-2xl backdrop-blur-xl">
                {exportActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        action.onClick();
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:bg-white/70"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 text-violet-700 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--muted-border)] bg-white/60 px-4 text-sm font-medium text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:bg-white/80"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/45 px-3 py-1.5 font-medium">
          <PanelsTopLeft className="h-3.5 w-3.5" />
          Sticky analytics workspace
        </span>
        <span className="inline-flex items-center rounded-full border border-white/35 bg-white/45 px-3 py-1.5 font-medium">
          D3 heatmap, export tools, quality scoring
        </span>
      </div>
    </header>
  );
}

export default Header;
