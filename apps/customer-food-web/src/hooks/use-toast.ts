import * as React from "react";
import { toast as sonnerToast } from "sonner";
import type { ToastActionElement, ToastProps } from "@ssrone/ui/customer";

interface ToastOptions extends Omit<ToastProps, "id"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
}

/**
 * Clean, non-intrusive toast dispatcher:
 * Suppresses routine informational floating banners to prevent user irritation,
 * while ensuring genuine errors (payment failure, network error) are clearly communicated.
 */
export const toast = (props: ToastOptions) => {
  const isDestructive = props.variant === "destructive";
  if (!isDestructive) {
    // Suppress routine floating banners on login/logout/navigation
    return null;
  }

  const titleStr = typeof props.title === "string" ? props.title : props.title ? String(props.title) : "Error";
  const descStr = typeof props.description === "string" ? props.description : props.description ? String(props.description) : undefined;

  try {
    return sonnerToast.error(titleStr, { description: descStr });
  } catch {
    return null;
  }
};

// Convenience methods
toast.success = (_title: string, _options?: { description?: string; duration?: number }) => {
  // Silent success to avoid annoying floating messages
  return null;
};

toast.error = (title: string, options?: { description?: string; duration?: number }) => {
  try {
    return sonnerToast.error(title, options);
  } catch {
    return null;
  }
};

toast.info = (_title: string, _options?: { description?: string; duration?: number }) => {
  return null;
};

toast.warning = (title: string, options?: { description?: string; duration?: number }) => {
  try {
    return sonnerToast.warning(title, options);
  } catch {
    return null;
  }
};

export const useToast = () => {
  return {
    toast,
    dismiss: () => sonnerToast.dismiss(),
    toasts: [],
  };
};

export type { ToastActionElement, ToastProps };
