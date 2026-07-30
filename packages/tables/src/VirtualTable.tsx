/**
 * Enterprise Windowed VirtualTable Component
 * Renders large datasets (10,000+ items) with high performance and 60 FPS scrolling.
 */
import React, { useState, useRef, useEffect, useMemo } from "react";

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  width?: number | string;
  render?: (item: T) => React.ReactNode;
}

export interface VirtualTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowHeight?: number;
  height?: number;
}

export function VirtualTable<T extends { id?: string | number }>({
  data,
  columns,
  rowHeight = 48,
  height = 500,
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const totalHeight = data.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
  const endIndex = Math.min(
    data.length,
    Math.ceil((scrollTop + height) / rowHeight) + 2
  );

  const visibleRows = useMemo(() => {
    return data.slice(startIndex, endIndex).map((item, idx) => ({
      item,
      originalIndex: startIndex + idx,
      top: (startIndex + idx) * rowHeight,
    }));
  }, [data, startIndex, endIndex, rowHeight]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height, overflowY: "auto", position: "relative" }}
      className="border rounded-lg bg-card text-card-foreground shadow-sm"
    >
      {/* Table Header */}
      <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur border-b flex font-medium text-xs text-muted-foreground uppercase">
        {columns.map((col, idx) => (
          <div
            key={String(col.key) + idx}
            style={{ width: col.width || `${100 / columns.length}%` }}
            className="p-3 flex items-center"
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Virtual Scroll Area */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleRows.map(({ item, originalIndex, top }) => (
          <div
            key={item.id ?? originalIndex}
            style={{
              position: "absolute",
              top,
              height: rowHeight,
              left: 0,
              right: 0,
            }}
            className="flex items-center border-b hover:bg-muted/50 transition-colors px-3 text-sm"
          >
            {columns.map((col, colIdx) => (
              <div
                key={String(col.key) + colIdx}
                style={{ width: col.width || `${100 / columns.length}%` }}
                className="truncate"
              >
                {col.render
                  ? col.render(item)
                  : String((item as Record<string, unknown>)[col.key as string] ?? "")}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
