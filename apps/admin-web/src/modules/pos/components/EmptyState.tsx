/**
 * ssrone ERP - POS Empty State Component
 * Standardized empty state view with actionable CTA triggers.
 */

import React, { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@ssrone/ui";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data Found",
  description = "There are no records matching your current filter criteria.",
  icon = <FolderOpen size={36} className="text-muted-foreground/60" />,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-card/20 border border-dashed border-border/70 rounded-2xl text-center space-y-4">
      <div className="p-4 bg-muted/30 rounded-2xl">{icon}</div>
      <div className="space-y-1">
        <h4 className="font-display font-semibold text-base text-foreground">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
