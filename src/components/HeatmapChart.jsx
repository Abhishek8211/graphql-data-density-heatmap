import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";

const colorStops = [
  { value: 0, color: "#ffffff" },
  { value: 0.25, color: "#fff3bf" },
  { value: 0.5, color: "#fb923c" },
  { value: 0.75, color: "#ef4444" },
  { value: 1, color: "#5b21b6" },
];

function sanitizeSvgSource(source) {
  if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
    return source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return source;
}

function rasterizeSvg(svgElement) {
  return new Promise((resolve, reject) => {
    const serializer = new XMLSerializer();
    const source = sanitizeSvgSource(serializer.serializeToString(svgElement));
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const width = Number(svgElement.getAttribute("width")) || 1280;
      const height = Number(svgElement.getAttribute("height")) || 720;
      const canvas = document.createElement("canvas");
      const scale = 2;
      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context is not available."));
        return;
      }

      canvas.width = width * scale;
      canvas.height = height * scale;
      context.scale(scale, scale);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to rasterize SVG."));
    };

    image.src = url;
  });
}

const HeatmapChart = forwardRef(function HeatmapChart(
  { densityMatrix, onCellHover, title, compact = false },
  ref,
) {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const gradientId = `density-scale-${useId().replace(/:/g, "")}`;
  const [containerWidth, setContainerWidth] = useState(960);

  useEffect(() => {
    if (!wrapperRef.current) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect?.width;
      if (nextWidth) {
        setContainerWidth(Math.max(360, nextWidth));
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
        .attr("height", 260)
        .attr("viewBox", `0 0 ${containerWidth} 260`);

      svg
        .append("rect")
        .attr("x", 1)
        .attr("y", 1)
        .attr("width", containerWidth - 2)
        .attr("height", 258)
        .attr("rx", 26)
        .attr("fill", "rgba(255,255,255,0.75)")
        .attr("stroke", "rgba(148,163,184,0.25)");

      svg
        .append("text")
        .attr("x", containerWidth / 2)
        .attr("y", 122)
        .attr("text-anchor", "middle")
        .attr("fill", "#475569")
        .attr("font-size", 16)
        .attr("font-weight", 700)
        .text("No data available for this filter combination.");

      svg
        .append("text")
        .attr("x", containerWidth / 2)
        .attr("y", 152)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .attr("font-size", 13)
        .text(
          "Adjust the node filters or load a dataset to populate the heatmap.",
        );

      return;
    }

    const margin = {
      top: compact ? 104 : 118,
      right: 24,
      bottom: 18,
      left: compact ? 144 : 160,
    };
    const cellHeight = compact ? 42 : 48;
    const availableWidth = Math.max(
      compact ? 460 : 640,
      Math.floor(containerWidth - margin.left - margin.right),
    );
    const cellWidth = Math.max(
      compact ? 74 : 86,
      Math.floor(availableWidth / Math.max(attributes.length, 1)),
    );
    const chartWidth = cellWidth * attributes.length;
    const chartHeight = cellHeight * nodeTypes.length;
    const width = margin.left + chartWidth + margin.right;
    const height = margin.top + chartHeight + margin.bottom;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    colorStops.forEach((stop) => {
      gradient
        .append("stop")
        .attr("offset", `${stop.value * 100}%`)
        .attr("stop-color", stop.color);
    });

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const colorScale = d3
      .scaleLinear()
      .domain(colorStops.map((stop) => stop.value))
      .range(colorStops.map((stop) => stop.color))
      .interpolate(d3.interpolateLab)
      .clamp(true);

    const cellMap = new Map(
      cells.map((cell) => [`${cell.nodeType}::${cell.attribute}`, cell]),
    );
    const renderedCells = [];

    nodeTypes.forEach((nodeType, rowIndex) => {
      attributes.forEach((attribute, columnIndex) => {
        const cell = cellMap.get(`${nodeType}::${attribute}`) ?? {
          nodeType,
          attribute,
          density: 0,
          totalCount: 0,
          nonNullCount: 0,
          missingCount: 0,
          isMissing: true,
        };

        renderedCells.push({
          ...cell,
          x: columnIndex * cellWidth,
          y: rowIndex * cellHeight,
          width: cellWidth,
          height: cellHeight,
        });
      });
    });

    chartGroup
      .append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("rx", 24)
      .attr("fill", `url(#${gradientId})`)
      .attr("opacity", 0.06);

    chartGroup
      .selectAll("rect.heat-cell")
      .data(renderedCells)
      .join("rect")
      .attr("class", "heat-cell")
      .attr("x", (cell) => cell.x + 2)
      .attr("y", (cell) => cell.y + 2)
      .attr("width", (cell) => cell.width - 4)
      .attr("height", (cell) => cell.height - 4)
      .attr("rx", 10)
      .attr("fill", (cell) =>
        cell.isMissing ? "rgba(226,232,240,0.85)" : colorScale(cell.density),
      )
      .attr("stroke", "rgba(255,255,255,0.95)")
      .attr("stroke-width", 1.5)
      .on("mousemove", (event, cell) => {
        onCellHover?.({
          clientX: event.clientX,
          clientY: event.clientY,
          sourceTitle: title,
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
          return "#64748b";
        }

        return cell.density >= 0.66 ? "#ffffff" : "#581c87";
      })
      .attr("font-size", compact ? 10.5 : 11.5)
      .attr("font-weight", 700)
      .text((cell) =>
        cell.isMissing ? "n/a" : `${Math.round(cell.density * 100)}%`,
      );

    chartGroup
      .selectAll("text.row-label")
      .data(nodeTypes)
      .join("text")
      .attr("x", -14)
      .attr("y", (_, rowIndex) => rowIndex * cellHeight + cellHeight / 2 + 5)
      .attr("text-anchor", "end")
      .attr("fill", "#0f172a")
      .attr("font-size", compact ? 12 : 13)
      .attr("font-weight", 700)
      .text((nodeType) => nodeType);

    chartGroup
      .selectAll("text.column-label")
      .data(attributes)
      .join("text")
      .attr(
        "transform",
        (_, columnIndex) =>
          `translate(${columnIndex * cellWidth + cellWidth / 2}, -14) rotate(-35)`,
      )
      .attr("text-anchor", "end")
      .attr("fill", "#334155")
      .attr("font-size", compact ? 10.5 : 11)
      .attr("font-weight", 700)
      .text((attribute) => attribute);
  }, [compact, containerWidth, densityMatrix, gradientId, onCellHover, title]);

  useImperativeHandle(ref, () => ({
    async exportAsPng(filename = "graphql-density-heatmap.png") {
      if (!svgRef.current) {
        throw new Error("Heatmap is not ready for export.");
      }

      const canvas = await rasterizeSvg(svgRef.current);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = filename;
      link.click();
    },
    async copyAsPng() {
      if (!svgRef.current) {
        throw new Error("Heatmap is not ready to copy.");
      }

      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        throw new Error(
          "Clipboard image copy is not supported in this browser.",
        );
      }

      const canvas = await rasterizeSvg(svgRef.current);
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!blob) {
        throw new Error("Unable to copy the heatmap image.");
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
    },
  }));

  return (
    <div
      ref={wrapperRef}
      className="overflow-x-auto rounded-[26px] border border-[var(--muted-border)] bg-white/70 p-3 dashboard-scrollbar"
    >
      <svg
        ref={svgRef}
        className="h-auto min-w-full"
        role="img"
        aria-label={`${title} data density heatmap`}
      />
    </div>
  );
});

export default HeatmapChart;
