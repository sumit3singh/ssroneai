import { moduleNavigationRegistry } from "./navigation.registry";
import type { NavItem } from "./types";

export const breadcrumbEngine = {
    getBreadcrumbs: (path: string): NavItem[] => {
        const result: NavItem[] = [];

        Object.values(moduleNavigationRegistry).forEach((module) => {
            module.groups.forEach((group) => {
                group.items.forEach((item) => {
                    if (item.path === path) {
                        result.push({
                            ...item,
                            label: module.moduleName,
                        });
                    }
                });
            });
        });

        return result;
    },
};
