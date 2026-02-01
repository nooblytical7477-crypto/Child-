import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          {/* Custom Branding: JUST TEXT - HERE NOW */}
          <div className="flex items-center justify-start gap-3 select-none scale-90 sm:scale-100 origin-left">
            <span className="font-oswald text-[#c02126] text-6xl sm:text-7xl font-bold tracking-tighter leading-none transform scale-y-125 origin-bottom">
              HERE
            </span>
            <span className="font-oswald text-[#c02126] text-6xl sm:text-7xl font-bold tracking-tighter leading-none transform scale-y-125 origin-bottom">
              NOW
            </span>
          </div>

        </div>
      </header>
      
      <main className="flex-grow bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Generali. All rights reserved.
        </div>
      </footer>
    </div>
  );
};