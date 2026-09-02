import React, { ReactNode } from "react";

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`p-4 sm:p-5 space-y-4 max-w-7xl mx-auto w-full ${className}`}>
      {children}
    </div>
  );
};
