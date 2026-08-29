import React, { type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "secondary" | "indigo" | "purple";
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "secondary",
  pulse = false,
  children,
  ...props
}) => {
  const variants = {
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    info: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    indigo: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    purple: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    secondary: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-semibold transition-all font-mono uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
};
