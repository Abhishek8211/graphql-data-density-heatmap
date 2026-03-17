# GraphQL Data Density Heatmap Explorer

A research-focused dashboard for visualizing GraphQL data completeness across entity-attribute combinations.

This project is built with React, D3, Tailwind CSS, and Vite. It supports interactive dataset filtering, side-by-side cohort comparison, quality scoring, and export workflows (PNG image, clipboard screenshot, and structured JSON report).

## Project Summary

Data quality and completeness are major blockers for analytics on healthcare, civic, and scientific GraphQL datasets. This application addresses that by translating raw records into a dense, explainable heatmap matrix where each cell represents the percentage of non-null values for one attribute in one node type.

The dashboard is designed as a research and proposal artifact and can be used to:

- Detect sparse fields and schema reliability gaps.
- Compare two dataset snapshots and monitor quality drift.
- Produce exportable evidence for reports, proposal attachments, and review meetings.

## Why This Is Relevant For A GSoC Proposal

This codebase already demonstrates a meaningful foundation for an open-source quality-observability tool:

- A complete front-end architecture with modular components.
- A deterministic data-density algorithm with explainable outputs.
- A report generation pipeline suitable for downstream automation.
- A clear roadmap path from local sample mode to full live GraphQL integration.

For a GSoC proposal, this repository shows both implementation maturity (working UI + analytics) and growth potential (live query execution, schema introspection, testing, and API-level integration).

## Current Status

Implemented and stable:

- Interactive heatmap rendering with D3.
- Dataset mode switching (Sample and Live Endpoint Preview modes).
- Dataset comparison toggle (Heatmap A vs Heatmap B).
- Node-type filtering and attribute search filtering.
- Summary metrics and dataset quality score visualization.
- Hover detail panel with per-cell diagnostics.
- Export actions:
  - Heatmap PNG download.
  - Clipboard screenshot copy.
  - JSON report download.
- Theme persistence (light/dark) with localStorage.

Important limitation (documented clearly for reviewers):

- Live Endpoint mode is currently a preview input workflow. It does not yet execute GraphQL network requests. Density calculations still operate on local datasets.

## Demo Dataset

The bundled sample data models a clinical context and includes four GraphQL-style node types:

- Patient
- Observation
- Medication
- Encounter

Each node type includes records with intentional nulls and missing fields so completeness analysis has realistic variance.

Two cohorts are available:

- Clinical Cohort A (baseline sample)
- Clinical Cohort B (mutated comparison snapshot for side-by-side analysis)

## Key Features

### 1) D3 Heatmap Matrix

- Rows: node types.
- Columns: merged attribute set after filtering.
- Cell color: completeness percentage from low to high.
- Cell labels: inline percentage or n/a for non-observed attributes.

### 2) Interactive Filtering

- Dataset selector for active cohort.
- Toggle between Sample and Live Endpoint Preview modes.
- Enable or disable comparison cohort.
- Select all / clear all node type filters.
- Attribute substring search.

### 3) Multi-Layer Quality Insights

- Total node types.
- Total attributes in current filtered matrix.
- Average data completeness.
- Sparse fields count (density < 40%).
- Aggregate quality score gauge with interpretation labels.

### 4) Explainable Hover Diagnostics

For each heatmap cell, the hover panel provides:

- Node type
- Attribute
- Completeness percentage
- Total records
- Missing values
- Present values

### 5) Export and Reporting

- Export heatmap as PNG.
- Copy heatmap image to clipboard.
- Download full JSON dataset-quality report.

The report includes metadata, filters, summary metrics, node-level summaries, and full cell-level measurements.

## Architecture Overview

### Frontend Stack

| Layer         | Technology                          | Purpose                                          |
| ------------- | ----------------------------------- | ------------------------------------------------ |
| UI            | React 19                            | State-driven dashboard and component composition |
| Visualization | D3 v7                               | SVG heatmap rendering and scales                 |
| Styling       | Tailwind CSS + custom CSS variables | Responsive glassmorphism-inspired interface      |
| Build Tool    | Vite                                | Fast dev server and production bundling          |
| Icons         | lucide-react                        | Visual affordances across controls and metrics   |
| Linting       | ESLint                              | Code quality checks                              |

### Component Responsibilities

| Component                            | Responsibility                                                |
| ------------------------------------ | ------------------------------------------------------------- |
| src/App.jsx                          | Root state, derived matrix calculations, export orchestration |
| src/components/Header.jsx            | Dataset selector, theme toggle, export dropdown               |
| src/components/SidebarFilters.jsx    | Mode selection, endpoint input, filtering controls            |
| src/components/HeatmapChart.jsx      | D3 heatmap rendering and image export/copy APIs               |
| src/components/SummaryCards.jsx      | Top-level metric cards                                        |
| src/components/QualityScoreGauge.jsx | Radial quality score and interpretation                       |
| src/components/HoverInfoPanel.jsx    | Fixed-position hover diagnostics panel                        |
| src/components/ExportToolbar.jsx     | Primary export actions and status messaging                   |
| src/utils/density.js                 | Matrix computation, insight aggregation, report generation    |
| src/data/datasets.js                 | Dataset registry and comparison snapshot generation           |

## Data-Density Computation Logic

Core processing lives in src/utils/density.js.

For each selected node type and discovered attribute:

1. Count total records for the node type.
2. Count records where attribute key exists (observedCount).
3. Count records where value is non-null and non-undefined (nonNullCount).
4. Compute:

   density = nonNullCount / totalCount

5. Mark cell as isMissing when observedCount equals 0.

Derived insights:

- averageDensity = mean density across measurable cells (non-missing cells)
- qualityScore = round(averageDensity \* 100)
- sparseFieldsCount = number of measurable cells where density < 0.4

Quality bands:

- High quality: score >= 80
- Moderate quality: score >= 60 and < 80
- Sparse dataset: score < 60

## Report JSON Format

The exported report includes:

- generatedAt timestamp
- dataset metadata (id, label, mode, endpoint URL, optional comparison label)
- active filters
- summary metrics
- nodeSummaries
- detailed cell records

Example excerpt:

```json
{
  "dataset": {
    "id": "clinical-cohort-a",
    "label": "Clinical Cohort A",
    "mode": "sample"
  },
  "summary": {
    "qualityScore": 78,
    "sparseFieldsCount": 4
  },
  "nodeSummaries": [
    {
      "nodeType": "Patient",
      "records": 5,
      "averageCompleteness": 0.86
    }
  ]
}
```

## UI/UX Characteristics

- Fully responsive layout for desktop and mobile.
- Sticky analytical workspace sections for long dashboards.
- Gradient and glow visual context to emphasize focus areas.
- Animated card and panel transitions for perceived responsiveness.
- Dark and light theme support with persistence.

## Project Structure

```text
graphql-data/
	public/
	src/
		components/
			DashboardLayout.jsx
			ExportToolbar.jsx
			GraphQLInput.jsx
			Header.jsx
			Heatmap.jsx
			HeatmapChart.jsx
			HeatmapLegend.jsx
			HoverInfoPanel.jsx
			QualityScoreGauge.jsx
			SidebarFilters.jsx
			SummaryCards.jsx
			Tooltip.jsx
		data/
			datasets.js
			sampleGraphqlData.json
		utils/
			density.js
		App.jsx
		index.css
		main.jsx
	eslint.config.js
	package.json
	postcss.config.js
	tailwind.config.js
	vite.config.js
```

Note: GraphQLInput.jsx, Heatmap.jsx, Tooltip.jsx, and App.css are currently not part of the active render path in App.jsx and can be treated as legacy/alternate components.

## Local Development

### Prerequisites

- Node.js 18+ (Node.js 20 LTS recommended)
- npm 9+

### Setup

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build Production Bundle

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Typical Workflow

1. Select a dataset from the header dropdown.
2. Choose Sample Dataset or Live Endpoint Preview mode.
3. Optionally enable Compare Datasets for side-by-side analysis.
4. Filter node types and search attributes.
5. Load dataset to render matrix and quality summaries.
6. Hover over cells to inspect completeness diagnostics.
7. Export PNG / copy screenshot / download JSON report.

## Proposal-Ready Expansion Roadmap

The following roadmap can be directly used in a GSoC timeline section.

### Phase 1: Live GraphQL Integration

- Add configurable query templates per node type.
- Execute live GraphQL requests with loading and error states.
- Normalize responses into current density matrix schema.

### Phase 2: Schema Introspection and Mapping

- Use GraphQL introspection to auto-discover node fields.
- Build UI for mapping endpoint schema fields to analysis groups.
- Persist endpoint profiles.

### Phase 3: Advanced Quality Analytics

- Add trend-over-time completeness snapshots.
- Add per-attribute historical sparkline deltas.
- Add missingness categorization (unknown vs optional vs expected).

### Phase 4: Testing and Reliability

- Unit tests for density and report logic.
- Component tests for critical user flows.
- End-to-end tests for export and filtering behavior.
- Accessibility and performance audits.

## Evaluation Metrics (Useful For GSoC Milestones)

- End-to-end live query success rate.
- Time-to-render for datasets of increasing size.
- Accuracy parity between expected and computed density metrics.
- Export fidelity (PNG and JSON correctness checks).
- Test coverage growth across utils and UI flows.

## Known Gaps and Risks

- Live endpoint execution not yet implemented.
- No automated test suite yet.
- No backend persistence for analysis sessions.
- Clipboard image copy may vary by browser support.

## Contribution Notes

Recommended validation before opening a PR:

```bash
npm run lint
npm run build
```

When adding new metrics:

- Keep formulas inside src/utils/density.js.
- Expose only derived values to UI components.
- Update report schema and README documentation together.

## License

No license file is currently included. Add a LICENSE file before public distribution if required by your target organization.

## Acknowledgment

Created as an exploratory GraphQL data-quality dashboard with an emphasis on explainable analytics and proposal-grade reporting workflows.
