import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getTenantSlug, setTenantSlug, getBranchCode, setBranchCode, fetchPublicBranches, type BranchInfo } from "@ssrone/api-client";
import { useCartStore } from "@/stores/cartStore";

export interface TenantBranchContext {
  tenantSlug: string;
  branchCode: string;
  tableNumber: string | null;
  isTableMode: boolean;
  branches: BranchInfo[];
  switchBranch: (newBranchCode: string) => void;
}

export const useTenantBranchContext = (): TenantBranchContext => {
  const params = useParams<{ tenantSlug?: string; branchCode?: string; tableNumber?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const [branches, setBranches] = useState<BranchInfo[]>([]);

  // 1. Resolve strictly from URL path parameters, search query parameters, or stored session context
  const resolvedTenantSlug =
    params.tenantSlug || searchParams.get("tenant") || getTenantSlug() || "baithak-cafe";

  const resolvedBranchCode =
    params.branchCode || searchParams.get("branch") || getBranchCode() || "BAITHAK-CUH";

  const resolvedTableNumber =
    params.tableNumber || searchParams.get("table") || null;

  // Fetch branches for the resolved tenant and sync active branch code
  useEffect(() => {
    fetchPublicBranches(resolvedTenantSlug).then((list) => {
      if (list && list.length > 0) {
        setBranches(list);
        const validCodes = list.map((b) => b.code);
        const currentCode = params.branchCode || searchParams.get("branch") || getBranchCode();
        if (!currentCode || !validCodes.includes(currentCode)) {
          const defaultCode = list[0].code;
          setBranchCode(defaultCode);
        }
      }
    });
  }, [resolvedTenantSlug, params.branchCode, searchParams]);

  const switchBranch = useCallback((newBranchCode: string) => {
    setBranchCode(newBranchCode);
    const slug = resolvedTenantSlug || "baithak-cafe";
    if (resolvedTableNumber) {
      navigate(`/t/${slug}/b/${newBranchCode}/table/${resolvedTableNumber}`);
    } else {
      navigate(`/t/${slug}/b/${newBranchCode}`);
    }
  }, [resolvedTenantSlug, resolvedTableNumber, navigate]);

  useEffect(() => {
    if (resolvedTenantSlug) {
      setTenantSlug(resolvedTenantSlug);
    }
    if (resolvedBranchCode) {
      setBranchCode(resolvedBranchCode);
    }
    if (resolvedTableNumber) {
      setTableNumber(resolvedTableNumber);
    }
  }, [resolvedTenantSlug, resolvedBranchCode, resolvedTableNumber, setTableNumber]);

  return {
    tenantSlug: resolvedTenantSlug,
    branchCode: resolvedBranchCode,
    tableNumber: resolvedTableNumber,
    isTableMode: !!resolvedTableNumber,
    branches,
    switchBranch,
  };
};

export default useTenantBranchContext;
