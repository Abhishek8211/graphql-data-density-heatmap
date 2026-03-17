import { ClipboardCopy, FileJson, ImageDown } from "lucide-react";

function ExportToolbar({
  onExportPng,
  onDownloadReport,
  onCopyScreenshot,
  statusMessage,
}) {
  const buttonClassName =
    "inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--muted-border)] bg-white/75 px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:bg-white";

  return (
    <div className="flex flex-col gap-4 rounded-[26px] border border-[var(--muted-border)] bg-white/55 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
          Export toolbar
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Export the visible heatmap, download a JSON report, or copy the chart
          snapshot.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:items-end">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportPng}
            className={buttonClassName}
          >
            <ImageDown className="h-4 w-4" />
            Export Heatmap PNG
          </button>

          <button
            type="button"
            onClick={onDownloadReport}
            className={buttonClassName}
          >
            <FileJson className="h-4 w-4" />
            Download Dataset Report JSON
          </button>

          <button
            type="button"
            onClick={onCopyScreenshot}
            className={buttonClassName}
          >
            <ClipboardCopy className="h-4 w-4" />
            Copy Screenshot
          </button>
        </div>

        <p className="min-h-5 text-sm text-[var(--text-secondary)]">
          {statusMessage || "Ready for export actions."}
        </p>
      </div>
    </div>
  );
}

export default ExportToolbar;
