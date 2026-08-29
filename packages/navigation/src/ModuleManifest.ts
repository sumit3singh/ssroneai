/**
 * ssrone ERP - Dynamic Module Manifest & Plugin Registry Engine
 * Supports runtime module registration and automated dependency validation.
 */

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  permission: string;
  category: string;
  dependsOn?: string[];
  routes: {
    dashboard: string;
    master?: string;
    transaction?: string;
    report?: string;
    settings?: string;
  };
  features: string[];
}

export class ModuleRegistryEngine {
  private registeredModules: Map<string, ModuleManifest> = new Map();

  public registerModule(manifest: ModuleManifest): boolean {
    if (this.registeredModules.has(manifest.id)) {
      console.warn(`[ModuleRegistry] Module ${manifest.id} is already registered. Updating manifest.`);
    }

    // Verify dependencies
    if (manifest.dependsOn && manifest.dependsOn.length > 0) {
      const missing = manifest.dependsOn.filter((dep) => !this.registeredModules.has(dep));
      if (missing.length > 0) {
        console.info(`[ModuleRegistry] Module ${manifest.id} declared dependencies not yet registered: ${missing.join(", ")}.`);
      }
    }

    this.registeredModules.set(manifest.id, manifest);
    return true;
  }

  public getModule(id: string): ModuleManifest | undefined {
    return this.registeredModules.get(id);
  }

  public getAllManifests(): ModuleManifest[] {
    return Array.from(this.registeredModules.values());
  }
}

export const moduleRegistry = new ModuleRegistryEngine();
