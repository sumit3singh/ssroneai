import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";
import { useAuthStore } from "@/app/providers/auth-store";

// API base URL
const BASE_URL = (import.meta as any).env.VITE_API_URL ?? "http://localhost:8000/api/v1";

interface FormFieldValidation {
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
  regex_pattern?: string;
  regex_message?: string;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  default_value?: any;
  is_required: boolean;
  is_readonly: boolean;
  is_hidden: boolean;
  section: string;
  tab: string;
  width: string;
  help_text: string;
  options: { label: string; value: string }[];
  depends_on?: string;
  depends_value?: string;
  validation: FormFieldValidation;
}

interface FormDefinition {
  form_id: string;
  form_key: string;
  title: string;
  description: string;
  submit_label: string;
  fields: FormField[];
  tabs: string[];
  sections: string[];
}

interface FormRendererProps {
  formKey: string;
  onSuccess?: (data: any) => void;
}

const MOCK_FORM_DEFINITIONS: Record<string, FormDefinition> = {
  customer_registration: {
    form_id: "form-cust-reg",
    form_key: "customer_registration",
    title: "Onboard New CRM Customer",
    description: "Fill out this metadata-driven dynamic profile form to register the guest in the loyalty database.",
    submit_label: "Save CRM Profile",
    tabs: ["basic", "membership"],
    sections: ["personal_info", "loyalty_tier"],
    fields: [
      {
        id: "f-1",
        name: "first_name",
        label: "First Name",
        type: "text",
        placeholder: "Enter first name",
        default_value: "",
        is_required: true,
        is_readonly: false,
        is_hidden: false,
        section: "personal_info",
        tab: "basic",
        width: "half",
        help_text: "First name of the customer",
        options: [],
        validation: { min_length: 2 }
      },
      {
        id: "f-2",
        name: "last_name",
        label: "Last Name",
        type: "text",
        placeholder: "Enter last name",
        default_value: "",
        is_required: true,
        is_readonly: false,
        is_hidden: false,
        section: "personal_info",
        tab: "basic",
        width: "half",
        help_text: "Last name of the customer",
        options: [],
        validation: {}
      },
      {
        id: "f-3",
        name: "phone",
        label: "Phone Contact",
        type: "text",
        placeholder: "Enter phone number",
        default_value: "",
        is_required: true,
        is_readonly: false,
        is_hidden: false,
        section: "personal_info",
        tab: "basic",
        width: "full",
        help_text: "Contact phone number",
        options: [],
        validation: { regex_pattern: "^\\d{10}$", regex_message: "Phone number must be 10 digits" }
      },
      {
        id: "f-4",
        name: "loyalty_tier",
        label: "Loyalty Tier",
        type: "select",
        placeholder: "Select tier",
        default_value: "standard",
        is_required: true,
        is_readonly: false,
        is_hidden: false,
        section: "loyalty_tier",
        tab: "membership",
        width: "half",
        help_text: "Customer membership rank",
        options: [
          { label: "Standard", value: "standard" },
          { label: "Silver", value: "silver" },
          { label: "Gold", value: "gold" },
          { label: "VIP", value: "vip" }
        ],
        validation: {}
      },
      {
        id: "f-5",
        name: "initial_points",
        label: "Welcome Bonus Points",
        type: "number",
        placeholder: "e.g. 100",
        default_value: 100,
        is_required: false,
        is_readonly: false,
        is_hidden: false,
        section: "loyalty_tier",
        tab: "membership",
        width: "half",
        help_text: "Loyalty points credited immediately",
        options: [],
        validation: { min_value: 0 }
      }
    ]
  }
};
export function FormRenderer({ formKey, onSuccess }: FormRendererProps) {
  const [activeTab, setActiveTab] = useState<string>("basic");

  // Fetch form definition
  const { data: formDef, isLoading, error } = useQuery<FormDefinition>({
    queryKey: ["form-definition", formKey],
    queryFn: async () => {
      const isMock = isMockSession();

      if (isMock) {
        const list = mockDB.get<FormDefinition>("form_definitions");
        const localDef = list.find((x) => x.form_key === formKey);
        if (localDef) {
          const resolvedFields = localDef.fields.map((field) => {
            if (field.type === "select") {
              const lovs = mockDB.get<any>("lovs").filter((x) => x.category === field.name);
              if (lovs.length > 0) {
                return {
                  ...field,
                  options: lovs.map((l: any) => ({ label: l.label, value: l.value }))
                };
              }
            }
            return field;
          });
          return {
            ...localDef,
            fields: resolvedFields
          };
        }

        const mockDef = MOCK_FORM_DEFINITIONS[formKey];
        if (mockDef) return mockDef;
      }

      const res = await axios.get(`${BASE_URL}/forms/${formKey}`);
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Record<string, any>>();

  // Populate default values when definition loads
  useEffect(() => {
    if (formDef) {
      const defaults: Record<string, any> = {};
      formDef.fields.forEach((f) => {
        if (f.default_value !== undefined) {
          defaults[f.name] = f.default_value;
        }
      });
      reset(defaults);
      if (formDef.tabs.length > 0) {
        setActiveTab(formDef.tabs[0]);
      }
    }
  }, [formDef, reset]);

  // Watch values for conditional fields
  const watchedValues = watch();

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const cleaned: Record<string, any> = {};
      Object.keys(payload).forEach((key) => {
        if (payload[key] !== "" && payload[key] !== undefined && payload[key] !== null) {
          cleaned[key] = payload[key];
        }
      });

      const isMock = isMockSession();

      if (isMock) {
        mockDB.insert("form_submissions", {
          form_key: formKey,
          data: cleaned,
        });

        if (formKey === "customer_registration") {
          mockDB.insert("customers", {
            first_name: cleaned.first_name,
            last_name: cleaned.last_name,
            phone: cleaned.phone,
            email: `${cleaned.first_name.toLowerCase()}@example.com`,
            loyalty_tier: cleaned.loyalty_tier,
            loyalty_points: Number(cleaned.initial_points || 100),
            wallet_balance: 0,
            lifetime_spent: 0,
            total_visits: 0,
            last_visit_at: null,
            is_active: true,
          });
        }

        return { success: true, message: "Form submitted and saved locally to the Baithak database!" };
      }

      const res = await axios.post(`${BASE_URL}/forms/${formKey}/submit`, {
        payload: cleaned,
      }, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().access_token ?? ""}`
        }
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Form submitted successfully!");
      if (onSuccess) onSuccess(data);
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail;
      if (detail && detail.fields) {
        Object.keys(detail.fields).forEach((field) => {
          toast.error(`${field}: ${detail.fields[field].join(", ")}`);
        });
      } else {
        toast.error(err.response?.data?.message || "An error occurred during submission.");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading form metadata...</p>
      </div>
    );
  }

  if (error || !formDef) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-danger/5 border border-danger/20 rounded-xl p-6">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <h3 className="text-lg font-bold text-destructive">Error Loading Form</h3>
        <p className="text-sm text-muted-foreground text-center">
          {(error as any)?.response?.data?.detail || "Could not fetch form definitions from database."}
        </p>
      </div>
    );
  }

  const onSubmit = (data: Record<string, any>) => {
    submitMutation.mutate(data);
  };

  const fieldsInActiveTab = formDef.fields.filter((f) => f.tab === activeTab && !f.is_hidden);

  const sectionsInActiveTab = Array.from(
    new Set(fieldsInActiveTab.map((f) => f.section))
  );

  const isFieldVisible = (f: FormField) => {
    if (!f.depends_on) return true;
    const triggerValue = watchedValues[f.depends_on];
    if (f.depends_value) {
      return String(triggerValue) === String(f.depends_value);
    }
    return !!triggerValue;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-foreground">{formDef.title}</h2>
        {formDef.description && (
          <p className="text-sm text-muted-foreground mt-1">{formDef.description}</p>
        )}
      </div>

      {formDef.tabs.length > 1 && (
        <div className="flex gap-2 border-b border-border pb-px scrollbar-hide overflow-x-auto">
          {formDef.tabs.map((tab) => (
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
        {sectionsInActiveTab.map((section) => {
          const sectionFields = fieldsInActiveTab.filter((f) => f.section === section);
          const visibleFields = sectionFields.filter(isFieldVisible);

          if (visibleFields.length === 0) return null;

          return (
            <div key={section} className="space-y-4">
              {section !== "default" && (
                <div className="border-b border-border/60 pb-2">
                  <h3 className="text-sm font-display font-semibold text-foreground/80 tracking-wide uppercase">
                    {section.replace(/_/g, " ")}
                  </h3>
                </div>
              )}

              <div className="grid grid-cols-6 gap-4">
                {visibleFields.map((field) => {
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
                        {isRequired && <span className="text-destructive font-bold">*</span>}
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
                          {field.options?.map((opt) => (
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
                          <label htmlFor={`chk-${field.name}`} className="text-sm font-medium text-muted-foreground">
                            {field.placeholder || "Enable"}
                          </label>
                        </div>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : "text"}
                          {...register(field.name, {
                            required: isRequired,
                            valueAsNumber: field.type === "number",
                          })}
                          placeholder={field.placeholder}
                          disabled={field.is_readonly}
                          className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      )}

                      {errors[field.name] && (
                        <p className="text-xs text-destructive font-medium">
                          {field.label} is required
                        </p>
                      )}
                      {field.help_text && !errors[field.name] && (
                        <p className="text-xs text-muted-foreground/80">{field.help_text}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-border/60">
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:pointer-events-none disabled:opacity-50 font-sans cursor-pointer"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {formDef.submit_label}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
export default FormRenderer;
