import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer shadow-2xs active:scale-[0.99]";

    const variants = {
      primary: "bg-primary hover:opacity-90 text-primary-foreground border border-primary/20 focus:ring-ring",
      secondary: "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
      outline: "border border-border bg-background text-foreground hover:bg-muted",
      ghost: "hover:bg-muted text-muted-foreground hover:text-foreground shadow-none border-none",
      danger: "bg-destructive hover:opacity-90 text-destructive-foreground border border-destructive/20",
      glass: "bg-card border border-border text-foreground hover:bg-muted",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-xs font-semibold gap-2",
      lg: "h-10 px-5 text-sm font-semibold gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
