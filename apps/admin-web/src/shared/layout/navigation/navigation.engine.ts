import { moduleNavigationRegistry } from "@ssr-one-ai/navigation";
import { ModuleNavConfig, NavItem } from "@ssr-one-ai/navigation";

export const navigationEngine = {
  getModuleConfig: (moduleId: string): ModuleNavConfig | null => {
    return moduleNavigationRegistry[moduleId] || null;
  },

  getAllModules: (): ModuleNavConfig[] => {
    return Object.values(moduleNavigationRegistry);
  },

  searchNavigation: (query: string): NavItem[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: NavItem[] = [];

    Object.values(moduleNavigationRegistry).forEach((mod) => {
      mod.groups.forEach((group) => {
        group.items.forEach((item) => {
          if (
            item.label.toLowerCase().includes(q) ||
            item.path.toLowerCase().includes(q) ||
            mod.moduleName.toLowerCase().includes(q)
          ) {
            results.push(item);
          }
        });
      });
    });

    return results;
  },
};
