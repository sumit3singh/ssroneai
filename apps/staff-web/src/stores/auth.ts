type AuthState = {
    role: 'employee' | 'user' | null;
    employeeId?: string | null;
    name?: string | null;
};

const AUTH_KEY = 'baithak_auth';

export const getAuth = (): AuthState => {
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        return raw ? JSON.parse(raw) : { role: null };
    } catch {
        return { role: null };
    }
};

export const setAuth = (s: AuthState) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(s));
};

export const logout = () => {
    localStorage.removeItem(AUTH_KEY);
};

export const loginUser = (username: string, password: string) => {
    // Simple mock user auth: username 'admin' password 'admin'
    if (username === 'admin' && password === 'admin') {
        const state: AuthState = { role: 'user', name: 'Admin' };
        setAuth(state);
        return state;
    }
    throw new Error('Invalid credentials');
};

export const loginEmployee = (employee_code: string) => {
    const raw = localStorage.getItem('baithak_employees');
    if (!raw) throw new Error('No employees seeded');
    const employees = JSON.parse(raw) as any[];
    const emp = employees.find((e) => e.employee_code === employee_code || e.email === employee_code || e.phone === employee_code);
    if (!emp) throw new Error('Employee not found');
    const state: AuthState = { role: 'employee', employeeId: String(emp.id), name: `${emp.first_name} ${emp.last_name}` };
    setAuth(state);
    return state;
};
