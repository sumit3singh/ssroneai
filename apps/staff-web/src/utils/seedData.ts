export const seedProducts = () => {
    // Disabled: PostgreSQL database is the only source of truth
};

export const seedTables = () => {
    // Disabled: PostgreSQL database is the only source of truth
};

export const clearSeedData = () => {
    ['baithak_products', 'baithak_tables', 'baithak_orders', 'baithak_invoices'].forEach((k) => localStorage.removeItem(k));
};

