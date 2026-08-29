import React from "react";
import { cn } from "../utils/cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className, children, ...props }) => {
  return (
    <label
      className={cn(
        "text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};
