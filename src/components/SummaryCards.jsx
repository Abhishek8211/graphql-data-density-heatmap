import {
  AlertTriangle,
  Layers3,
  Shapes,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

function formatDelta(value, suffix = "") {
  if (value === null || Number.isNaN(value)) {
    return "Awaiting comparison";
  }

  if (value === 0) {
    return `No change${suffix}`;
  }

  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

function getCardTone(type, value) {
  if (type === "sparse") {
    if (value <= 2) {
      return "good";
    }

    if (value <= 5) {
      return "medium";
    }

    return "sparse";
  }

  if (type === "percentage") {
    if (value >= 80) {
      return "good";
    }

    if (value >= 60) {
      return "medium";
    }

    return "sparse";
  }

  return "good";
}

const toneStyles = {
  good: {
    badge: "bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20",
    icon: "bg-emerald-500/12 text-emerald-700",
  },
  medium: {
    badge: "bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/20",
    icon: "bg-amber-500/12 text-amber-700",
  },
  sparse: {
    badge: "bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/20",
    icon: "bg-rose-500/12 text-rose-700",
  },
};

function SummaryCards({ insights, comparisonInsights, isLoaded }) {
  const averagePercent = Math.round(insights.averageDensity * 100);
  const averageDelta = comparisonInsights
    ? averagePercent - Math.round(comparisonInsights.averageDensity * 100)
    : null;
  const sparseDelta = comparisonInsights
    ? insights.sparseFieldsCount - comparisonInsights.sparseFieldsCount
    : null;

  const cards = [
    {
      label: "Total Node Types",
      value: isLoaded ? insights.totalNodeTypes : "--",
      trend: isLoaded ? `${insights.totalRecords} records loaded` : "Load a dataset",
      icon: Layers3,
      tone: getCardTone("count", insights.totalNodeTypes),
    },
    {
      label: "Total Attributes",
      value: isLoaded ? insights.totalAttributes : "--",
      trend: isLoaded ? `${insights.measuredCellsCount} cells measured` : "Filtered after load",
      icon: Shapes,
      tone: getCardTone("count", insights.totalAttributes),
    },
    {
      label: "Average Data Completeness",
      value: isLoaded ? `${averagePercent}%` : "--",
      trend: comparisonInsights
        ? `${formatDelta(averageDelta, " pts")} vs comparison`
        : isLoaded
          ? insights.qualityBand.label
          : "Quality score pending",
      icon: TrendingUp,
      tone: getCardTone("percentage", averagePercent),
    },
    {
      label: "Sparse Fields Count",
      value: isLoaded ? insights.sparseFieldsCount : "--",
      trend: comparisonInsights
        ? `${formatDelta(sparseDelta)} vs comparison`
        : isLoaded
          ? "Density below 40%"
          : "Sparse fields pending",
      icon: AlertTriangle,
      tone: getCardTone("sparse", insights.sparseFieldsCount),
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const tone = toneStyles[card.tone];
        const isNegativeTrend = typeof card.trend === "string" && card.trend.startsWith("-");

        return (
          <article
            key={card.label}
            className="glass-panel rounded-[28px] px-5 py-5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-up"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  {card.label}
                </p>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {card.value}
                </p>
              </div>

              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tone.icon}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${tone.badge}`}>
                {isNegativeTrend ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                {card.trend}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default SummaryCards;