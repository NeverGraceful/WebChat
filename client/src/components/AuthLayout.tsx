import { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthCard } from './AuthCard';
import { Link } from './Link';

interface childrenProps {
    children: ReactNode
}

export function AuthentLayout({ children }: childrenProps) {
  const location = useLocation()
  const isLoginPage = location.pathname === "/login"
  return (
    <AuthCard>
      <AuthCard.body>
        {children}
        <Outlet />
      </AuthCard.body>
      <AuthCard.below>
        <Link to={isLoginPage ? "/signup" : "/login"}>
        {isLoginPage ? "Sign up" : "Login"}
        </Link>
      </AuthCard.below>
    </AuthCard>
  );
}
