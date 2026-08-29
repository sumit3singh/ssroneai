export const seedProducts = () => {
    // Disabled: PostgreSQL database is the only source of truth
};

export const seedTables = () => {
    // Disabled: PostgreSQL database is the only source of truth
};

export const clearSeedData = () => {
    ['ssrone_products', 'ssrone_tables', 'ssrone_orders', 'ssrone_invoices'].forEach((k) => localStorage.removeItem(k));
};

