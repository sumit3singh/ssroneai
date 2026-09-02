import React, { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  badge,
  actions,
  className = ""
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3.5 mb-4 ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <div className="p-1.5 rounded-md bg-muted text-foreground shrink-0 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-foreground truncate">{title}</h1>
            {badge && (
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border shrink-0">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
