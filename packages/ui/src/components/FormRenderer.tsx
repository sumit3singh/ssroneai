import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { Loader2, AlertCircle, Save } from "lucide-react";
import { useAuthStore } from "@ssrone/auth";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "date" | "checkbox" | "email";
  is_required?: boolean;
  is_readonly?: boolean;
  is_hidden?: boolean;
  default_value?: any;
  options?: FormFieldOption[];
  tab?: string;
  section?: string;
  width?: "full" | "half" | "third";
  depends_on?: string;
  depends_value?: any;
  placeholder?: string;
}

export interface FormDefinition {
  id: string;
  title: string;
  description?: string;
  tabs: string[];
  fields: FormField[];
}

interface FormRendererProps {
  formName?: string;
  formKey?: string;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  onSuccess?: () => void;
  initialData?: Record<string, any>;
  isSubmitting?: boolean;
}

export function FormRenderer({
  formName,
  formKey,
  onSubmit,
  onSuccess,
  initialData,
  isSubmitting = false,
}: FormRendererProps) {
  const targetFormKey = formKey || formName || "guest_registration";
  const { tenant_slug } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>("");

  const { data: formDef, isLoading, error } = useQuery<FormDefinition>({
    queryKey: ["formMetadata", targetFormKey, tenant_slug],
    queryFn: async () => {
      const res = await fetch(`/api/v1/metadata/forms/${targetFormKey}`, {
        headers: {
          "X-Tenant-Slug": tenant_slug || "default",
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to load form definition for ${targetFormKey}`);
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Record<string, any>>();

  useEffect(() => {
    if (formDef) {
      const defaults: Record<string, any> = {};
      formDef.fields.forEach((f: FormField) => {
        if (f.default_value !== undefined) {
          defaults[f.name] = f.default_value;
        }
      });
      reset(initialData || defaults);
      if (formDef.tabs.length > 0) {
        setActiveTab(formDef.tabs[0]);
      }
    }
  }, [formDef, initialData, reset]);

  const watchedValues = watch();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading form configuration...</p>
      </div>
    );
  }

  if (error || !formDef) {
    return (
      <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">
          {error instanceof Error ? error.message : "Failed to load form definition."}
        </p>
      </div>
    );
  }

  const fieldsInActiveTab = formDef.fields.filter((f: FormField) => f.tab === activeTab && !f.is_hidden);

  const sectionsInActiveTab = Array.from(
    new Set(fieldsInActiveTab.map((f: FormField) => f.section || "default"))
  );

  const isFieldVisible = (f: FormField) => {
    if (!f.depends_on) return true;
    const triggerValue = watchedValues[f.depends_on];
    if (f.depends_value) {
      return String(triggerValue) === String(f.depends_value);
    }
    return !!triggerValue;
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    if (onSubmit) {
      await onSubmit(data);
    }
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">{formDef.title}</h2>
        {formDef.description && (
          <p className="text-sm text-muted-foreground mt-1">{formDef.description}</p>
        )}
      </div>

      {formDef.tabs.length > 1 && (
        <div className="flex gap-2 border-b border-border pb-px overflow-x-auto">
          {formDef.tabs.map((tab: string) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {sectionsInActiveTab.map((section: string) => {
          const sectionFields = fieldsInActiveTab.filter((f: FormField) => (f.section || "default") === section);
          const visibleFields = sectionFields.filter(isFieldVisible);

          if (visibleFields.length === 0) return null;

          return (
            <div key={section} className="space-y-4">
              {section !== "default" && (
                <div className="border-b border-border/60 pb-2">
                  <h3 className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                    {section.replace(/_/g, " ")}
                  </h3>
                </div>
              )}

              <div className="grid grid-cols-6 gap-4">
                {visibleFields.map((field: FormField) => {
                  const widthClass =
                    field.width === "half"
                      ? "col-span-6 sm:col-span-3"
                      : field.width === "third"
                        ? "col-span-6 sm:col-span-2"
                        : "col-span-6";

                  const isRequired = field.is_required;

                  return (
                    <div key={field.name} className={`${widthClass} space-y-1.5`}>
                      <label className="text-xs font-semibold text-foreground/90 flex items-center gap-1">
                        {field.label}
                        {isRequired && <span className="text-red-500 font-bold">*</span>}
                      </label>

                      {field.type === "textarea" ? (
                        <textarea
                          {...register(field.name, { required: isRequired })}
                          placeholder={field.placeholder}
                          disabled={field.is_readonly}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      ) : field.type === "select" ? (
                        <select
                          {...register(field.name, { required: isRequired })}
                          disabled={field.is_readonly}
                          className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select option...</option>
                          {field.options?.map((opt: FormFieldOption) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "checkbox" ? (
                        <div className="flex items-center space-x-2 pt-2">
                          <input
                            type="checkbox"
                            {...register(field.name)}
                            disabled={field.is_readonly}
                            id={`chk-${field.name}`}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`chk-${field.name}`} className="text-sm font-medium text-foreground cursor-pointer">
                            Enable
                          </label>
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          {...register(field.name, { required: isRequired })}
                          placeholder={field.placeholder}
                          disabled={field.is_readonly}
                          className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      )}

                      {errors[field.name] && (
                        <p className="text-[11px] font-medium text-red-500">This field is required</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </form>
  );
}
