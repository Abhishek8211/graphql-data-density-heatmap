const isNonNull = (value) => value !== null && value !== undefined;

export function emptyDensityMatrix() {
  return {
    nodeTypes: [],
    attributes: [],
    cells: [],
    totalsByNode: {},
    totalRecords: 0,
  };
}

export function formatPercent(value, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function calculateDensityMatrix(
  dataset,
  selectedNodeTypes = null,
  attributeQuery = "",
) {
  if (!dataset || typeof dataset !== "object") {
    return emptyDensityMatrix();
  }

  const availableNodeTypes = Object.keys(dataset).filter((type) =>
    Array.isArray(dataset[type]),
  );
  const requestedNodeTypes = Array.isArray(selectedNodeTypes)
    ? selectedNodeTypes
    : availableNodeTypes;
  const nodeTypes = requestedNodeTypes.filter((type) =>
    availableNodeTypes.includes(type),
  );
  const normalizedQuery = attributeQuery.trim().toLowerCase();
  const attributeSet = new Set();
  const totalsByNode = {};

  nodeTypes.forEach((nodeType) => {
    const records = dataset[nodeType] ?? [];
    totalsByNode[nodeType] = records.length;

    records.forEach((record) => {
      Object.keys(record ?? {}).forEach((attribute) => {
        if (
          !normalizedQuery ||
          attribute.toLowerCase().includes(normalizedQuery)
        ) {
          attributeSet.add(attribute);
        }
      });
    });
  });

  const attributes = Array.from(attributeSet).sort((left, right) =>
    left.localeCompare(right),
  );
  const cells = [];

  nodeTypes.forEach((nodeType) => {
    const records = dataset[nodeType] ?? [];
    const totalCount = records.length;

    attributes.forEach((attribute) => {
      let observedCount = 0;
      let nonNullCount = 0;

      records.forEach((record) => {
        if (record && Object.prototype.hasOwnProperty.call(record, attribute)) {
          observedCount += 1;
          if (isNonNull(record[attribute])) {
            nonNullCount += 1;
          }
        }
      });

      cells.push({
        nodeType,
        attribute,
        density: totalCount === 0 ? 0 : nonNullCount / totalCount,
        totalCount,
        observedCount,
        nonNullCount,
        missingCount: Math.max(totalCount - nonNullCount, 0),
        isMissing: observedCount === 0,
      });
    });
  });

  const totalRecords = Object.values(totalsByNode).reduce(
    (sum, count) => sum + count,
    0,
  );

  return {
    nodeTypes,
    attributes,
    cells,
    totalsByNode,
    totalRecords,
  };
}

function getQualityBand(score) {
  if (score >= 80) {
    return {
      label: "High quality",
      tone: "good",
    };
  }

  if (score >= 60) {
    return {
      label: "Moderate quality",
      tone: "medium",
    };
  }

  return {
    label: "Sparse dataset",
    tone: "sparse",
  };
}

export function calculateDatasetInsights(dataset, densityMatrix) {
  if (!dataset || !densityMatrix) {
    return {
      totalNodeTypes: 0,
      totalAttributes: 0,
      averageDensity: 0,
      sparseFieldsCount: 0,
      totalRecords: 0,
      missingValueCount: 0,
      measuredCellsCount: 0,
      qualityScore: 0,
      qualityBand: getQualityBand(0),
    };
  }

  const measurableCells = densityMatrix.cells.filter((cell) => !cell.isMissing);
  const densityTotal = measurableCells.reduce(
    (sum, cell) => sum + cell.density,
    0,
  );
  const averageDensity = measurableCells.length
    ? densityTotal / measurableCells.length
    : 0;
  const qualityScore = Math.round(averageDensity * 100);

  return {
    totalNodeTypes: densityMatrix.nodeTypes.length,
    totalAttributes: densityMatrix.attributes.length,
    averageDensity,
    sparseFieldsCount: measurableCells.filter((cell) => cell.density < 0.4)
      .length,
    totalRecords: densityMatrix.totalRecords,
    missingValueCount: measurableCells.reduce(
      (sum, cell) => sum + cell.missingCount,
      0,
    ),
    measuredCellsCount: measurableCells.length,
    qualityScore,
    qualityBand: getQualityBand(qualityScore),
  };
}

export function buildDatasetReport({
  datasetId,
  datasetLabel,
  compareDatasetLabel,
  densityMatrix,
  insights,
  filters,
  endpointUrl,
  mode,
}) {
  const nodeSummaries = densityMatrix.nodeTypes.map((nodeType) => {
    const nodeCells = densityMatrix.cells.filter(
      (cell) => cell.nodeType === nodeType,
    );
    const measurableNodeCells = nodeCells.filter((cell) => !cell.isMissing);
    const densityAverage = measurableNodeCells.length
      ? measurableNodeCells.reduce((sum, cell) => sum + cell.density, 0) /
        measurableNodeCells.length
      : 0;

    return {
      nodeType,
      records: densityMatrix.totalsByNode[nodeType] ?? 0,
      averageCompleteness: densityAverage,
      sparseFields: measurableNodeCells.filter((cell) => cell.density < 0.4)
        .length,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    dataset: {
      id: datasetId,
      label: datasetLabel,
      mode,
      compareDatasetLabel,
      endpointUrl,
    },
    filters,
    summary: {
      ...insights,
      averageDensityPercent: Math.round(insights.averageDensity * 100),
    },
    nodeSummaries,
    cells: densityMatrix.cells.map((cell) => ({
      nodeType: cell.nodeType,
      attribute: cell.attribute,
      density: cell.density,
      presentValues: cell.nonNullCount,
      missingValues: cell.missingCount,
      totalRecords: cell.totalCount,
      isMissing: cell.isMissing,
    })),
  };
}
