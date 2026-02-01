import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col font-sans bg-slate-50 relative">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0"></div>
      
      <header className="bg-white/80 backdrop-blur-md border-b border-red-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Custom Branding: YOUNG VISION */}
          <div className="flex items-center justify-start gap-2 select-none origin-left">
            <div className="w-10 h-10 bg-[#c02126] rounded-lg flex items-center justify-center text-white font-oswald text-2xl shadow-lg shadow-red-200">
              G
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-oswald text-slate-900 text-xl font-bold tracking-tight uppercase">
                Young
              </span>
              <span className="font-oswald text-[#c02126] text-xl font-bold tracking-tight uppercase">
                Vision
              </span>
            </div>
          </div>

        </div>
      </header>
      
      <main className="flex-grow z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-100 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">
            Powered by Generali Central Life Insurance - Aapka Lifetime Partner
          </p>
          <p className="text-slate-300 text-xs">
            &copy; {new Date().getFullYear()} Generali. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};