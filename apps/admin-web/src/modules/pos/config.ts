export interface POSConfig {
  moduleName: string;
  version: string;
  defaultTaxRate: number;
  currencySymbol: string;
  currencyCode: string;
  allowNegativeStock: boolean;
  enableThermalPrinting: boolean;
  autoOpenCashDrawer: boolean;
}

export const posConfig: POSConfig = {
  moduleName: "Point of Sale",
  version: "2.0.0-ENTERPRISE",
  defaultTaxRate: 0.05, // 5% GST
  currencySymbol: "₹",
  currencyCode: "INR",
  allowNegativeStock: false,
  enableThermalPrinting: true,
  autoOpenCashDrawer: true
};
