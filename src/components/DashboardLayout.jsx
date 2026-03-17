import { X } from "lucide-react";

function DashboardLayout({
  header,
  summary,
  sidebar,
  main,
  isSidebarOpen,
  onCloseSidebar,
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden xl:h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[var(--glow-primary)] blur-3xl" />
        <div className="absolute right-[-4rem] top-12 h-80 w-80 rounded-full bg-[var(--glow-secondary)] blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-[var(--glow-tertiary)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1680px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 xl:h-screen xl:overflow-hidden">
        <div className="sticky top-4 z-40 shrink-0">{header}</div>
        <div className="shrink-0">{summary}</div>

        <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="md:hidden">{sidebar}</div>

          <aside className="hidden min-h-0 overflow-y-auto pr-1 dashboard-scrollbar xl:block">
            {sidebar}
          </aside>

          <main className="min-h-0 overflow-visible pb-6 xl:overflow-y-auto xl:pb-0 xl:pr-1 dashboard-scrollbar">
            {main}
          </main>
        </div>
      </div>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 hidden bg-slate-950/30 backdrop-blur-sm md:block xl:hidden">
          <div className="absolute inset-y-0 left-0 w-full max-w-sm border-r border-white/20 bg-[var(--panel-bg-strong)] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  Filters
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  Dataset controls
                </h2>
              </div>

              <button
                type="button"
                onClick={onCloseSidebar}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--muted-border)] bg-white/50 text-[var(--text-primary)] transition hover:scale-[1.02] hover:bg-white/70"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[calc(100%-4rem)] overflow-y-auto dashboard-scrollbar pr-1">
              {sidebar}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DashboardLayout;
