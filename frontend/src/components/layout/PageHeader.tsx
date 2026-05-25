import { ReactNode } from 'react';
import { Navbar } from './Navbar';

export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-between items-center w-full pb-4" style={{ paddingTop: '1rem' }}>
      <div className="flex-1">
        {children}
      </div>
      <div className="shrink-0 pl-4">
        <Navbar />
      </div>
    </div>
  );
}
