import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Database, FileJson, FlaskConical, ImageDown } from "lucide-react";
import DashboardLayout from "./components/DashboardLayout";
import ExportToolbar from "./components/ExportToolbar";
import Header from "./components/Header";
import HeatmapChart from "./components/HeatmapChart";
import HeatmapLegend from "./components/HeatmapLegend";
import HoverInfoPanel from "./components/HoverInfoPanel";
import QualityScoreGauge from "./components/QualityScoreGauge";
import SidebarFilters from "./components/SidebarFilters";
import SummaryCards from "./components/SummaryCards";
import {
  datasetLibrary,
  datasetMap,
  getComparisonDatasetId,
} from "./data/datasets";
import {
  buildDatasetReport,
  calculateDatasetInsights,
  calculateDensityMatrix,
  emptyDensityMatrix,
} from "./utils/density";

const defaultDatasetId = datasetLibrary[0]?.id ?? "";
const githubUrl = "https://github.com/Abhishek8211/MovieHub.git";

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("graphql-density-dashboard-theme") ?? "light";
    } catch {
      return "light";
    }
  });
  const [mode, setMode] = useState("sample");
  const [selectedDatasetId, setSelectedDatasetId] = useState(defaultDatasetId);
  const [endpointUrl, setEndpointUrl] = useState(
    "https://api.example.com/graphql",
  );
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [attributeQuery, setAttributeQuery] = useState("");
  const [isDatasetLoaded, setIsDatasetLoaded] = useState(false);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const primaryHeatmapRef = useRef(null);
  const deferredAttributeQuery = useDeferredValue(attributeQuery);
  const activeDataset =
    datasetMap[selectedDatasetId] ?? datasetLibrary[0] ?? null;
  const comparisonDatasetId = useMemo(
    () => getComparisonDatasetId(selectedDatasetId),
    [selectedDatasetId],
  );
  const comparisonDataset = datasetMap[comparisonDatasetId] ?? null;
  const availableNodeTypes = useMemo(
    () => Object.keys(activeDataset?.data ?? {}),
    [activeDataset],
  );
  const [selectedNodeTypes, setSelectedNodeTypes] =
    useState(availableNodeTypes);

  useEffect(() => {
    document.body.dataset.theme = theme;

    try {
      localStorage.setItem("graphql-density-dashboard-theme", theme);
    } catch {
      // Ignore localStorage persistence issues in restricted environments.
    }
  }, [theme]);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setStatusMessage("");
    }, 3200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [statusMessage]);

  const activeDensityMatrix = useMemo(() => {
    if (!isDatasetLoaded || !activeDataset?.data) {
      return emptyDensityMatrix();
    }

    return calculateDensityMatrix(
      activeDataset.data,
      selectedNodeTypes,
      deferredAttributeQuery,
    );
  }, [
    activeDataset,
    deferredAttributeQuery,
    isDatasetLoaded,
    selectedNodeTypes,
  ]);

  const comparisonDensityMatrix = useMemo(() => {
    if (!isDatasetLoaded || !compareEnabled || !comparisonDataset?.data) {
      return emptyDensityMatrix();
    }

    return calculateDensityMatrix(
      comparisonDataset.data,
      selectedNodeTypes,
      deferredAttributeQuery,
    );
  }, [
    comparisonDataset,
    compareEnabled,
    deferredAttributeQuery,
    isDatasetLoaded,
    selectedNodeTypes,
  ]);

  const insights = useMemo(
    () => calculateDatasetInsights(activeDataset?.data, activeDensityMatrix),
    [activeDataset, activeDensityMatrix],
  );
  const comparisonInsights = useMemo(
    () =>
      compareEnabled
        ? calculateDatasetInsights(
            comparisonDataset?.data,
            comparisonDensityMatrix,
          )
        : null,
    [compareEnabled, comparisonDataset, comparisonDensityMatrix],
  );

  function publishStatus(message) {
    setStatusMessage(message);
  }

  function handleDatasetChange(nextDatasetId) {
    const nextNodeTypes = Object.keys(datasetMap[nextDatasetId]?.data ?? {});

    setSelectedDatasetId(nextDatasetId);
    setSelectedNodeTypes(nextNodeTypes);
    setHoverInfo(null);
    publishStatus("Dataset selection updated.");
  }

  function handleToggleNodeType(nodeType) {
    setHoverInfo(null);
    setSelectedNodeTypes((currentSelection) => {
      if (currentSelection.includes(nodeType)) {
        return currentSelection.filter((item) => item !== nodeType);
      }

      return [...currentSelection, nodeType];
    });
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setHoverInfo(null);
    publishStatus(
      nextMode === "sample"
        ? "Sample dataset mode enabled."
        : "Live endpoint preview mode enabled.",
    );
  }

  function handleLoadDataset() {
    if (mode === "live" && !endpointUrl.trim()) {
      publishStatus(
        "Enter a GraphQL endpoint URL before loading live preview mode.",
      );
      return;
    }

    setIsDatasetLoaded(true);
    setHoverInfo(null);
    setIsSidebarOpen(false);
    publishStatus(
      mode === "sample"
        ? `${activeDataset?.label ?? "Dataset"} loaded.`
        : `Live endpoint preview ready for ${endpointUrl.trim()}.`,
    );
  }

  function handleResetFilters() {
    setSelectedNodeTypes(availableNodeTypes);
    setAttributeQuery("");
    setCompareEnabled(false);
    setHoverInfo(null);
    publishStatus("Filters reset to the dataset defaults.");
  }

  function downloadJsonFile(filename, contents) {
    const blob = new Blob([contents], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  function handleDownloadReport() {
    if (!isDatasetLoaded) {
      publishStatus("Load a dataset before downloading a report.");
      return;
    }

    const report = buildDatasetReport({
      datasetId: activeDataset.id,
      datasetLabel: activeDataset.label,
      compareDatasetLabel: compareEnabled ? comparisonDataset?.label : null,
      densityMatrix: activeDensityMatrix,
      insights,
      filters: {
        selectedNodeTypes,
        attributeQuery: deferredAttributeQuery,
        compareEnabled,
      },
      endpointUrl,
      mode,
    });

    downloadJsonFile(
      `${activeDataset.id}-density-report.json`,
      JSON.stringify(report, null, 2),
    );
    publishStatus("Dataset report downloaded as JSON.");
  }

  async function handleExportPng() {
    if (!isDatasetLoaded || !primaryHeatmapRef.current) {
      publishStatus("Load a dataset before exporting the heatmap.");
      return;
    }

    try {
      await primaryHeatmapRef.current.exportAsPng(
        `${activeDataset.id}-heatmap.png`,
      );
      publishStatus("Heatmap PNG exported.");
    } catch {
      publishStatus("Unable to export the heatmap PNG.");
    }
  }

  async function handleCopyScreenshot() {
    if (!isDatasetLoaded || !primaryHeatmapRef.current) {
      publishStatus("Load a dataset before copying the heatmap.");
      return;
    }

    try {
      await primaryHeatmapRef.current.copyAsPng();
      publishStatus("Heatmap copied to the clipboard.");
    } catch (error) {
      publishStatus(error.message || "Unable to copy the heatmap image.");
    }
  }

  function handleQuickLoadSample() {
    setMode("sample");
    setSelectedDatasetId(defaultDatasetId);
    setSelectedNodeTypes(Object.keys(datasetMap[defaultDatasetId]?.data ?? {}));
    setCompareEnabled(false);
    setIsDatasetLoaded(true);
    publishStatus("Sample dataset loaded.");
  }

  const exportMenuActions = [
    {
      label: "Export Heatmap PNG",
      icon: ImageDown,
      onClick: () => {
        void handleExportPng();
      },
    },
    {
      label: "Download Dataset Report JSON",
      icon: FileJson,
      onClick: handleDownloadReport,
    },
    {
      label: "Copy Screenshot",
      icon: ImageDown,
      onClick: () => {
        void handleCopyScreenshot();
      },
    },
  ];

  const summarySection = (
    <SummaryCards
      insights={insights}
      comparisonInsights={comparisonInsights}
      isLoaded={isDatasetLoaded}
    />
  );

  const sidebarSection = (
    <SidebarFilters
      endpointUrl={endpointUrl}
      mode={mode}
      dataset={activeDataset}
      compareEnabled={compareEnabled}
      selectedNodeTypes={selectedNodeTypes}
      nodeTypes={availableNodeTypes}
      attributeQuery={attributeQuery}
      onEndpointUrlChange={setEndpointUrl}
      onModeChange={handleModeChange}
      onToggleCompare={setCompareEnabled}
      onToggleNodeType={handleToggleNodeType}
      onAttributeQueryChange={setAttributeQuery}
      onLoadDataset={handleLoadDataset}
      onResetFilters={handleResetFilters}
      onSelectAllNodes={() => setSelectedNodeTypes(availableNodeTypes)}
      onClearAllNodes={() => setSelectedNodeTypes([])}
    />
  );

  const headerSection = (
    <Header
      datasetOptions={datasetLibrary}
      selectedDatasetId={selectedDatasetId}
      onDatasetChange={handleDatasetChange}
      theme={theme}
      onToggleTheme={() =>
        setTheme((currentTheme) =>
          currentTheme === "light" ? "dark" : "light",
        )
      }
      onOpenFilters={() => setIsSidebarOpen(true)}
      exportActions={exportMenuActions}
      githubUrl={githubUrl}
    />
  );

  const workspaceSection = (
    <section className="space-y-5 pb-1">
      <article className="glass-panel rounded-[30px] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
              Section A
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Main Visualization Workspace
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
              Review heatmap density across entity attributes, compare cohorts,
              and export the visible research snapshot.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium text-[var(--text-secondary)]">
            <span className="rounded-full border border-white/35 bg-white/55 px-3 py-1.5">
              {mode === "sample" ? "Sample Dataset" : "Live GraphQL Endpoint"}
            </span>
            <span className="rounded-full border border-white/35 bg-white/55 px-3 py-1.5">
              {selectedNodeTypes.length} node types visible
            </span>
            <span className="rounded-full border border-white/35 bg-white/55 px-3 py-1.5">
              {activeDensityMatrix.attributes.length} attributes in view
            </span>
          </div>
        </div>

        <div className="mt-6">
          <ExportToolbar
            onExportPng={() => {
              void handleExportPng();
            }}
            onDownloadReport={handleDownloadReport}
            onCopyScreenshot={() => {
              void handleCopyScreenshot();
            }}
            statusMessage={statusMessage}
          />
        </div>

        {!isDatasetLoaded ? (
          <div className="mt-6 grid gap-6 rounded-[30px] border border-dashed border-[var(--muted-border)] bg-white/45 p-6 md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Empty state
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                No dataset loaded
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Load the bundled clinical sample to inspect completeness across
                Patient, Observation, Medication, and Encounter fields, then
                switch into comparison mode when you need cohort-to-cohort
                review.
              </p>
              <button
                type="button"
                onClick={handleQuickLoadSample}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <FlaskConical className="h-4 w-4" />
                Load Sample Dataset
              </button>
            </div>

            <div className="relative mx-auto h-52 w-full max-w-[240px] overflow-hidden rounded-[28px] border border-white/40 bg-white/55 shadow-inner">
              <div className="absolute left-6 top-6 h-24 w-24 rounded-full bg-violet-500/18 blur-2xl" />
              <div className="absolute bottom-6 right-6 h-24 w-24 rounded-full bg-cyan-500/18 blur-2xl" />
              <div className="relative flex h-full flex-col items-center justify-center gap-4 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/75 text-violet-700 shadow-lg">
                  <Database className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Research snapshot pending
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                    Use the sample cohort or enter an endpoint to begin
                    analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`mt-6 grid gap-5 ${compareEnabled ? "2xl:grid-cols-2" : ""}`}
            >
              <article className="rounded-[28px] border border-[var(--muted-border)] bg-white/65 p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                      {compareEnabled ? "Heatmap A" : "Density heatmap"}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                      {activeDataset.label}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {activeDataset.description}
                    </p>
                  </div>

                  <span className="rounded-full border border-white/35 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    {mode === "sample" ? "Local snapshot" : "Endpoint preview"}
                  </span>
                </div>

                <HeatmapChart
                  ref={primaryHeatmapRef}
                  densityMatrix={activeDensityMatrix}
                  onCellHover={setHoverInfo}
                  title={activeDataset.shortLabel}
                  compact={compareEnabled}
                />
              </article>

              {compareEnabled && comparisonDataset ? (
                <article className="rounded-[28px] border border-[var(--muted-border)] bg-white/65 p-4 sm:p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                        Heatmap B
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                        {comparisonDataset.label}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {comparisonDataset.description}
                      </p>
                    </div>

                    <span className="rounded-full border border-white/35 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                      Comparison cohort
                    </span>
                  </div>

                  <HeatmapChart
                    densityMatrix={comparisonDensityMatrix}
                    onCellHover={setHoverInfo}
                    title={comparisonDataset.shortLabel}
                    compact
                  />
                </article>
              ) : null}
            </div>

            <div className="mt-5">
              <HeatmapLegend />
            </div>
          </>
        )}
      </article>

      <QualityScoreGauge
        score={insights.qualityScore}
        insights={insights}
        comparisonScore={comparisonInsights?.qualityScore}
      />
    </section>
  );

  return (
    <>
      <DashboardLayout
        header={headerSection}
        summary={summarySection}
        sidebar={sidebarSection}
        main={workspaceSection}
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />
      <HoverInfoPanel hoverInfo={hoverInfo} />
    </>
  );
}

export default App;
