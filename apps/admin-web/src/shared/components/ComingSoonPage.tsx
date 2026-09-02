import React from "react";
import { Clock, ArrowLeft } from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
import { useNavigate } from "@tanstack/react-router";

export const ComingSoonPage: React.FC<{ moduleName?: string }> = ({ moduleName = "Module Under Development" }) => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <button
        onClick={() => navigate({ to: "/pos" })}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to POS Dashboard
      </button>

      <PageHeader
        title={moduleName}
        description="This feature is being enhanced for enterprise deployment"
        icon={<Clock size={18} />}
        badge="Coming Soon"
      />

      <div className="py-20 text-center border border-dashed border-border rounded-md bg-card space-y-3 max-w-2xl mx-auto my-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
          <Clock size={24} />
        </div>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Module Under Active Development</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          This ERP capability is currently undergoing final verification and compliance testing. It will be enabled in the upcoming platform release.
        </p>
        <div className="pt-2">
          <Button onClick={() => navigate({ to: "/pos" })} size="sm" className="text-xs font-semibold">
            Return to POS Workspace
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default ComingSoonPage;
