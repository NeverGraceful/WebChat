import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthCard } from './AuthCard';

interface childrenProps {
    children: ReactNode
}

export function AuthentLayout({ children }: childrenProps) {
  return (
    <AuthCard>
      <AuthCard.body>
        {children}
        <Outlet />
      </AuthCard.body>
      <AuthCard.below>
        hi
      </AuthCard.below>
    </AuthCard>
  );
}
