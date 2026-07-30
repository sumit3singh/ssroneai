export type NavCategoryType = "DASHBOARD" | "MASTER" | "TRANSACTION" | "REPORT" | "SETTINGS" | string;

export interface NavItem {
    id: string;
    label: string;
    path: string;
    iconName?: string;
    badge?: string | number;
    permissions?: string[];
    isFavorite?: boolean;
}

export interface NavGroup {
    id: string;
    title: NavCategoryType;
    iconName?: string;
    items: NavItem[];
}

export interface ModuleNavConfig {
    moduleId: string;
    moduleName: string;
    moduleIcon: string;
    groups: NavGroup[];
    permissions?: string[];
}
