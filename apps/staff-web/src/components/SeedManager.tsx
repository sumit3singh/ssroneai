import { useEffect, useState } from 'react';
import { seedProducts, seedTables, clearSeedData } from '@/utils/seedData';

export default function SeedManager({ onClose }: { onClose: () => void }) {
    const [counts, setCounts] = useState({ products: 0, tables: 0, orders: 0, invoices: 0 });

    const refresh = () => {
        const products = JSON.parse(localStorage.getItem('ssrone_products') || '[]');
        const tables = JSON.parse(localStorage.getItem('ssrone_tables') || '[]');
        const orders = JSON.parse(localStorage.getItem('ssrone_orders') || '[]');
        const invs = JSON.parse(localStorage.getItem('ssrone_invoices') || '[]');
        setCounts({ products: products.length, tables: tables.length, orders: orders.length, invoices: invs.length });
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleSeed = () => {
        seedProducts();
        seedTables();
        refresh();
    };

    const handleClear = () => {
        clearSeedData();
        refresh();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-4 border">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold">Seed Data Manager</h3>
                    <button onClick={onClose} className="px-2 py-1 rounded bg-muted">Close</button>
                </div>

                <div className="space-y-2 mb-3">
                    <div className="flex justify-between"><span>Products</span><strong>{counts.products}</strong></div>
                    <div className="flex justify-between"><span>Tables</span><strong>{counts.tables}</strong></div>
                    <div className="flex justify-between"><span>Orders</span><strong>{counts.orders}</strong></div>
                    <div className="flex justify-between"><span>Invoices</span><strong>{counts.invoices}</strong></div>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleSeed} className="px-4 py-2 bg-primary text-white rounded">Seed Demo Data</button>
                    <button onClick={handleClear} className="px-4 py-2 bg-destructive text-white rounded">Clear Data</button>
                </div>
            </div>
        </div>
    );
}
