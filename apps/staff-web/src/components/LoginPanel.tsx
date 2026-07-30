import { useState } from 'react';
import { loginEmployee, loginUser, getAuth, setAuth } from '@/stores/auth';
import { seedEmployees } from '@/utils/seedEmployees';
import { api, setAccessToken } from '@/shared/api-client';

type Props = { onLogin: () => void };

export default function LoginPanel({ onLogin }: Props) {
    const [mode, setMode] = useState<'employee' | 'user'>('employee');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: any) => {
        e?.preventDefault();
        setError(null);
        try {
            seedEmployees();
            if (mode === 'employee') {
                loginEmployee(identifier.trim());
                onLogin();
                return;
            }

            // user login via backend
            const payload = { tenant_slug: 'baithak-demo', email: identifier.trim(), password };
            const res = await api.post('/auth/login', payload);
            // res should contain access_token and user
            if (res?.access_token) {
                setAccessToken(res.access_token);
            }
            // persist basic auth state for UI
            setAuth({ role: 'user', name: res?.user?.first_name ? `${res.user.first_name} ${res.user.last_name || ''}`.trim() : res?.user?.email || identifier });
            onLogin();
        } catch (err: any) {
            setError(err?.response?.data?.detail || err?.message || String(err));
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border">
                <h2 className="text-lg font-bold mb-3">Sign in</h2>
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setMode('employee')} className={`px-3 py-1 rounded ${mode === 'employee' ? 'bg-primary text-white' : ''}`}>Employee</button>
                    <button onClick={() => setMode('user')} className={`px-3 py-1 rounded ${mode === 'user' ? 'bg-primary text-white' : ''}`}>User</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-xs font-bold">{mode === 'employee' ? 'Employee Code / Email / Phone' : 'Username'}</label>
                        <input className="w-full p-2 mt-1 rounded border" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
                    </div>
                    {mode === 'user' && (
                        <div>
                            <label className="text-xs font-bold">Password</label>
                            <input type="password" className="w-full p-2 mt-1 rounded border" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    )}
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Sign In</button>
                    </div>
                </form>
                <p className="text-[11px] text-slate-500 mt-3">Tip: seed employees are created automatically. Use <strong>EMP001</strong> or <strong>EMP002</strong>. User: <strong>admin/admin</strong></p>
            </div>
        </div>
    );
}
