import { Tenant, AuditLog, ClusterNode } from '../types';

/**
 * Single Source of Truth (SSOT) Policy:
 * All tenant, license, and company records are fetched live from the PostgreSQL database via API.
 * Static mock data fallbacks have been removed in accordance with SSOT rules.
 */
export const INITIAL_TENANTS: Tenant[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const CLUSTER_NODES: ClusterNode[] = [];
