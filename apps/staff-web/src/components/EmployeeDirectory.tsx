import { useEffect, useMemo, useState } from 'react';
import { seedEmployees } from '@/utils/seedEmployees';
import { getAuth } from '@/stores/auth';
import { api, getAccessToken } from '@/shared/api-client';

export default function EmployeeDirectory({ onClose }: { onClose: () => void }) {
    const [employees, setEmployees] = useState<any[]>([]);
    const [q, setQ] = useState('');

    useEffect(() => {
        seedEmployees();
        const fetch = async () => {
            // if user authenticated with backend, prefer backend employees
            if (getAccessToken()) {
                try {
                    const res = await api.get('/hr/employees');
                    setEmployees(res || []);
                    return;
                } catch (e) {
                    // fallback to local seed
                    // console.error(e);
                }
            }

            const raw = localStorage.getItem('baithak_employees');
            setEmployees(raw ? JSON.parse(raw) : []);
        };
        void fetch();
    }, []);

    const filtered = useMemo(() => {
        return employees.filter(e => (e.first_name + ' ' + e.last_name + ' ' + (e.employee_code || '') + ' ' + (e.phone || '') + ' ' + (e.email || '')).toLowerCase().includes(q.toLowerCase()));
    }, [employees, q]);

    const auth = getAuth();

    return (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-start justify-center p-4 pt-20">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl p-4 border">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold">Employee Directory</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs">Signed in as: <strong>{auth.name}</strong></span>
                        <button onClick={onClose} className="px-2 py-1 bg-muted rounded">Close</button>
                    </div>
                </div>
                <div className="mb-3">
                    <input placeholder="Search employees..." className="w-full p-2 rounded border" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                    {filtered.map(emp => (
                        <div key={emp.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold">{emp.first_name} {emp.last_name}</p>
                                    <p className="text-xs text-slate-500">Code: {emp.employee_code} • {emp.employment_type}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">₹{emp.basic_salary}</p>
                                    <p className="text-xs text-slate-400">Joined: {emp.joining_date}</p>
                                </div>
                            </div>
                            <div className="mt-2 text-[12px] text-slate-600">
                                <p>Email: {emp.email || '-'}</p>
                                <p>Phone: {emp.phone || '-'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
