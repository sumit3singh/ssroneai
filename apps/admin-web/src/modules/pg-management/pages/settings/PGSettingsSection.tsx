import React from "react";
import { Settings, Shield, Bell, CreditCard } from "lucide-react";
import { Button } from "@ssrone/ui";
import { Input } from "@ssrone/ui";

export const PGSettingsSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-violet-500" />
          PG Management Module Settings
        </h3>
        <p className="text-xs text-slate-500 mt-1">Configure default security deposit terms, notice periods, and automated SMS rent reminders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Default Notice Period (Days)</label>
          <Input defaultValue="30" className="text-xs" />

          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Grace Period Before Late Fee (Days)</label>
          <Input defaultValue="5" className="text-xs" />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Per Day Late Fee Amount (₹)</label>
          <Input defaultValue="100" className="text-xs" />

          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs mt-2">
            Save PG Rules
          </Button>
        </div>
      </div>
    </div>
  );
};
