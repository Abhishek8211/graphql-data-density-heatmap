import { useEffect, useId, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

function Heatmap({ densityMatrix, onCellHover }) {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const gradientId = `density-gradient-${useId().replace(/:/g, "")}`;
  const [containerWidth, setContainerWidth] = useState(900);

  const densityDomain = useMemo(() => {
    const densityValues = (densityMatrix?.cells ?? [])
      .filter((cell) => !cell.isMissing)
      .map((cell) => cell.density);

    const minDensity = d3.min(densityValues) ?? 0;
    const maxDensity = d3.max(densityValues) ?? 1;

    if (minDensity === maxDensity) {
      return [0, 1];
    }

    return [minDensity, maxDensity];
  }, [densityMatrix]);

  useEffect(() => {
    if (!wrapperRef.current) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect?.width;
      if (nextWidth) {
        setContainerWidth(Math.max(320, nextWidth));
      }
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const nodeTypes = densityMatrix?.nodeTypes ?? [];
    const attributes = densityMatrix?.attributes ?? [];
    const cells = densityMatrix?.cells ?? [];

    if (!nodeTypes.length || !attributes.length) {
      svg
        .attr("width", containerWidth)
        .attr("height", 220)
        .attr("viewBox", `0 0 ${containerWidth} 220`);

      svg
        .append("text")
        .attr("x", containerWidth / 2)
        .attr("y", 110)
        .attr("text-anchor", "middle")
        .attr("fill", "#6b7280")
        .attr("font-size", 14)
        .text("Select at least one node type to render the heatmap.");

      return;
    }

    const margin = { top: 120, right: 28, bottom: 26, left: 156 };
    const legendSpace = 68;
    const cellHeight = 46;

    const availableWidth = Math.max(
      420,
      Math.floor(containerWidth - margin.left - margin.right),
    );
    const cellWidth = Math.max(
      62,
      Math.floor(availableWidth / attributes.length),
    );
    const chartWidth = cellWidth * attributes.length;
    const chartHeight = cellHeight * nodeTypes.length;

    const width = margin.left + chartWidth + margin.right;
    const height = margin.top + chartHeight + margin.bottom + legendSpace;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const cellMap = new Map(
      cells.map((cell) => [`${cell.nodeType}::${cell.attribute}`, cell]),
    );

    const renderedCells = [];
    nodeTypes.forEach((nodeType, rowIndex) => {
      attributes.forEach((attribute, colIndex) => {
        const key = `${nodeType}::${attribute}`;
        const cell = cellMap.get(key) ?? {
          nodeType,
          attribute,
          density: 0,
          nonNullCount: 0,
          totalCount: 0,
          isMissing: true,
        };

        renderedCells.push({
          ...cell,
          x: colIndex * cellWidth,
          y: rowIndex * cellHeight,
          width: cellWidth,
          height: cellHeight,
        });
      });
    });

    const densityValues = renderedCells
      .filter((cell) => !cell.isMissing)
      .map((cell) => cell.density);

    const minDensity = d3.min(densityValues) ?? 0;
    const maxDensity = d3.max(densityValues) ?? 1;

    const normalizedMin = minDensity === maxDensity ? 0 : minDensity;
    const normalizedMax = minDensity === maxDensity ? 1 : maxDensity;

    const colorScale = d3
      .scaleLinear()
      .domain([normalizedMin, normalizedMax])
      .range(["#ffffff", "#c81d25"])
      .interpolate(d3.interpolateLab)
      .clamp(true);

    chartGroup
      .selectAll("rect.heat-cell")
      .data(renderedCells)
      .join("rect")
      .attr("class", "heat-cell")
      .attr("x", (cell) => cell.x + 1)
      .attr("y", (cell) => cell.y + 1)
      .attr("width", (cell) => cell.width - 2)
      .attr("height", (cell) => cell.height - 2)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", (cell) =>
        cell.isMissing ? "#f5f5f4" : colorScale(cell.density),
      )
      .attr("stroke", "#d6d3d1")
      .attr("stroke-width", 1)
      .on("mousemove", (event, cell) => {
        if (!onCellHover || !wrapperRef.current) {
          return;
        }

        const bounds = wrapperRef.current.getBoundingClientRect();
        onCellHover({
          x: event.clientX - bounds.left + 12,
          y: event.clientY - bounds.top + 12,
          cell,
        });
      })
      .on("mouseleave", () => {
        onCellHover?.(null);
      });

    chartGroup
      .selectAll("text.cell-label")
      .data(renderedCells)
      .join("text")
      .attr("class", "cell-label")
      .attr("x", (cell) => cell.x + cell.width / 2)
      .attr("y", (cell) => cell.y + cell.height / 2 + 4)
      .attr("text-anchor", "middle")
      .attr("fill", (cell) => {
        if (cell.isMissing) {
          return "#78716c";
        }
        return cell.density >= 0.58 ? "#ffffff" : "#881337";
      })
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .text((cell) =>
        cell.isMissing ? "n/a" : `${Math.round(cell.density * 100)}%`,
      );

    chartGroup
      .selectAll("text.row-label")
      .data(nodeTypes)
      .join("text")
      .attr("class", "row-label")
      .attr("x", -14)
      .attr("y", (_, rowIndex) => rowIndex * cellHeight + cellHeight / 2 + 4)
      .attr("text-anchor", "end")
      .attr("fill", "#1f2937")
      .attr("font-size", 13)
      .attr("font-weight", 700)
      .text((nodeType) => nodeType);

    chartGroup
      .selectAll("text.column-label")
      .data(attributes)
      .join("text")
      .attr("class", "column-label")
      .attr(
        "transform",
        (_, colIndex) =>
          `translate(${colIndex * cellWidth + cellWidth / 2}, -12) rotate(-38)`,
      )
      .attr("text-anchor", "end")
      .attr("fill", "#334155")
      .attr("font-size", 11)
      .attr("font-weight", 700)
      .text((attribute) => attribute);

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#c81d25");

    const legendWidth = 260;
    const legendX = margin.left;
    const legendY = margin.top + chartHeight + 28;

    svg
      .append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", 12)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", `url(#${gradientId})`)
      .attr("stroke", "#d6d3d1");

    svg
      .append("text")
      .attr("x", legendX)
      .attr("y", legendY - 8)
      .attr("fill", "#64748b")
      .attr("font-size", 12)
      .text("Low density");

    svg
      .append("text")
      .attr("x", legendX + legendWidth)
      .attr("y", legendY - 8)
      .attr("text-anchor", "end")
      .attr("fill", "#64748b")
      .attr("font-size", 12)
      .text("High density");

    svg
      .append("text")
      .attr("x", legendX)
      .attr("y", legendY + 30)
      .attr("fill", "#7c2d12")
      .attr("font-size", 12)
      .text(`${Math.round(normalizedMin * 100)}%`);

    svg
      .append("text")
      .attr("x", legendX + legendWidth)
      .attr("y", legendY + 30)
      .attr("text-anchor", "end")
      .attr("fill", "#7c2d12")
      .attr("font-size", 12)
      .text(`${Math.round(normalizedMax * 100)}%`);
  }, [containerWidth, densityMatrix, gradientId, onCellHover]);

  const exportAsPng = () => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
      source = source.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }

    const svgBlob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const width = Number(svgElement.getAttribute("width")) || 1280;
      const height = Number(svgElement.getAttribute("height")) || 720;

      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.scale(scale, scale);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "graphql-density-heatmap.png";
      link.click();

      URL.revokeObjectURL(url);
    };

    image.src = url;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Dynamic color domain:{" "}
          <span className="font-mono text-xs font-semibold text-rose-800">
            {Math.round(densityDomain[0] * 100)}% to{" "}
            {Math.round(densityDomain[1] * 100)}%
          </span>
        </p>
        <button
          type="button"
          onClick={exportAsPng}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Export Heatmap as PNG
        </button>
      </div>

      <div
        ref={wrapperRef}
        className="overflow-x-auto rounded-2xl border border-stone-200 bg-white/80 p-3"
      >
        <svg
          ref={svgRef}
          className="h-auto min-w-full"
          role="img"
          aria-label="Data density heatmap"
        />
      </div>
    </div>
  );
}

export default Heatmap;
