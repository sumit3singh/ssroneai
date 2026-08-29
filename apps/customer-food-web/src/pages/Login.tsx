import { Navigate } from "react-router-dom";

/**
 * Legacy Login route component.
 * Upfront route lockdown and authentication are now handled strictly by CustomerAuthGuard.
 */
export const Login = () => <Navigate to="/" replace />;

export default Login;
