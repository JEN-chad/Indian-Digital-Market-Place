import React from "react";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actionSlot?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, actionSlot }: PageHeaderProps) {
  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-black/10 pb-5 mb-8">
      <div className="space-y-1.5">
        {/* Optional Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-brand-dark/40">
            <button 
              onClick={() => navigateTo("/")}
              className="hover:text-brand-green transition-colors flex items-center gap-0.5 cursor-pointer focus:outline-none"
            >
              <Home className="w-3 h-3" />
              <span>FMI</span>
            </button>
            
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="w-2.5 h-2.5 opacity-50 shrink-0" />
                {item.path ? (
                  <button 
                    onClick={() => navigateTo(item.path!)}
                    className="hover:text-brand-green transition-colors cursor-pointer focus:outline-none"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-brand-dark/80">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-serif italic font-black text-brand-dark tracking-tight leading-none uppercase">
          {title}
        </h1>
      </div>

      {/* Action slot on the right */}
      {actionSlot && (
        <div className="shrink-0 flex items-center">
          {actionSlot}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
