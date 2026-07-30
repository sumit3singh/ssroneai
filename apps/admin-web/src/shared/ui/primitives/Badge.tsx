/**
 * The Baithak – Badge Primitive
 */
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-success/10 text-emerald-700",
        warning: "bg-warning/10 text-yellow-700",
        danger: "bg-danger/10 text-red-700",
        info: "bg-info/10 text-blue-700",
        ai: "border",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, style, ...props }: BadgeProps) {
  const aiStyle =
    variant === "ai"
      ? {
          background: "hsl(var(--ai-primary)/0.1)",
          color: "hsl(var(--ai-primary))",
          borderColor: "hsl(var(--ai-primary)/0.2)",
          ...style,
        }
      : style;

  return (
    <div className={cn(badgeVariants({ variant, className }))} style={aiStyle} {...props} />
  );
}
