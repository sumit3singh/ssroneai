import React, { type ReactNode } from "react";
import { cn } from "../utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div
        className={cn(
          "w-full max-w-lg rounded-lg bg-card text-foreground p-5 shadow-xs border border-border space-y-3",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          {title && <h3 className="text-sm font-bold text-foreground">{title}</h3>}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
