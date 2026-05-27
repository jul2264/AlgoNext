import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface PageHeaderProps {
  children: ReactNode;
  centerContent?: ReactNode;
}

export function PageHeader({ children, centerContent }: PageHeaderProps) {
  if (centerContent) {
    return (
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between py-5 border-b border-border-default/20 gap-5 md:gap-8 lg:gap-12">
        {/* Left side / Title Area */}
        <div className="flex justify-between items-center md:justify-start md:shrink-0">
          <div className="flex-1 md:flex-initial">
            {children}
          </div>
          {/* Profile Card shown on mobile inside the top row */}
          <div className="md:hidden shrink-0">
            <Navbar />
          </div>
        </div>

        {/* Center content (e.g. progress bar) */}
        <div className="w-full md:flex-1 md:flex md:justify-center px-2 md:px-6 lg:px-8">
          <div className="w-full md:max-w-[360px]">
            {centerContent}
          </div>
        </div>

        {/* Right side / Profile Card shown on desktop */}
        <div className="hidden md:block shrink-0">
          <Navbar />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-between items-center py-5 border-b border-border-default/20">
      <div className="flex-1">
        {children}
      </div>
      <div className="shrink-0 pl-6 md:pl-8">
        <Navbar />
      </div>
    </div>
  );
}

