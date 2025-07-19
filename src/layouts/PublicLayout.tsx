
import { ReactNode } from 'react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { Outlet } from 'react-router-dom';

interface PublicLayoutProps {
  children?: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>{children || <Outlet />}</main>
      <PublicFooter />
    </div>
  );
};
