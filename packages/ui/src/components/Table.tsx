import React, { type TableHTMLAttributes } from "react";
import { cn } from "../utils/cn";

export const Table: React.FC<TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
      <table className={cn("w-full text-left text-xs text-foreground font-sans", className)} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead className={cn("bg-muted/60 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground border-b border-border", className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody className={cn("divide-y divide-border/60 bg-card", className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => (
  <tr className={cn("hover:bg-muted/40 transition-colors", className)} {...props}>
    {children}
  </tr>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={cn("px-3 py-2 align-middle font-medium text-xs text-foreground", className)} {...props}>
    {children}
  </td>
);
