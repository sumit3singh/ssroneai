import React, { type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable, glass = false, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-lg bg-card border border-border transition-all duration-150 overflow-hidden shadow-2xs",
        hoverable && "hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-5 pb-3", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn("text-base md:text-lg font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white font-display", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => (
  <p className={cn("text-xs text-slate-500 dark:text-slate-400 font-medium", className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("p-5 pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("flex items-center p-5 pt-0", className)} {...props}>
    {children}
  </div>
);
