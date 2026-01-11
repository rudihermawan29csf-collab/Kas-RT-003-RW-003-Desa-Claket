import React from 'react';
import { LayoutDashboard, Users, FileCheck, CheckCircle2, PlusCircle, Wallet, LogOut, Info, BookOpen, Menu, History } from 'lucide-react';
import { Role, User } from '../types';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out flex-shrink-0 ${
      active 
        ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon size={16} strokeWidth={active ? 2.5 : 2} />
    <span className="hidden sm:inline">{label}</span>
    {count !== undefined && count > 0 && (
      <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-white ${active ? 'bg-red-500 text-white' : 'bg-red-500 text-white'}`}>
        {count}
      </span>
    )}
  </button>
);

interface MacOSWindowProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  pendingCount: number;
  verifyingCount: number;
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const MacOSWindow: React.FC<MacOSWindowProps> = ({ 
  currentView, 
  setCurrentView, 
  pendingCount, 
  verifyingCount,
  children, 
  user,
  onLogout
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 overflow-hidden">
      {/* Main Container */}
      <div className="w-full max-w-7xl h-[92vh] bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/40 flex flex-col overflow-hidden relative ring-1 ring-gray-900/5">
        
        {/* --- TOP NAVBAR (MINIMALIST) --- */}
        <header className="h-20 px-6 flex items-center justify-between border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-50">
          
          {/* LEFT: Branding */}
          <div className="flex items-center gap-4">
             {/* Decorative Traffic Lights (Smaller & Minimal) */}
             <div className="flex gap-1.5 opacity-60 group hover:opacity-100 transition-opacity">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] border border-[#E0443E]/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] border border-[#D89E24]/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] border border-[#1AAB29]/50"></div>
             </div>
             
             <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

             <div className="flex flex-col">
                <h1 className="text-sm font-bold text-gray-800 tracking-tight leading-none">Desa Claket</h1>
                <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mt-0.5">RT 003 / RW 003</span>
             </div>
          </div>

          {/* CENTER: Navigation Items */}
          <nav className="flex-1 flex items-center justify-center gap-1 px-4 overflow-x-auto no-scrollbar mask-gradient">
             {/* Common Menu */}
             {user.role !== 'NASABAH' && (
              <>
                <NavItem 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  active={currentView === 'dashboard'} 
                  onClick={() => setCurrentView('dashboard')} 
                />
                <NavItem 
                  icon={Wallet} 
                  label="Data Pinjaman" 
                  active={currentView === 'loans'} 
                  onClick={() => setCurrentView('loans')} 
                />
                <NavItem 
                  icon={BookOpen} 
                  label="Laporan Kas" 
                  active={currentView === 'cash-flow'} 
                  onClick={() => setCurrentView('cash-flow')} 
                />
              </>
            )}

            {/* ADMIN Specific */}
            {user.role === 'ADMIN' && (
              <>
                <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                <NavItem 
                  icon={PlusCircle} 
                  label="Input Baru" 
                  active={currentView === 'request'} 
                  onClick={() => setCurrentView('request')} 
                />
                <NavItem 
                  icon={CheckCircle2} 
                  label="Pembayaran" 
                  active={currentView === 'payment'} 
                  onClick={() => setCurrentView('payment')} 
                />
              </>
            )}

            {/* RT Specific */}
            {user.role === 'RT' && (
              <>
                 <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                 <NavItem 
                  icon={FileCheck} 
                  label="Pusat Validasi" 
                  active={currentView === 'rt-validation'} 
                  onClick={() => setCurrentView('rt-validation')}
                  count={pendingCount + verifyingCount}
                />
              </>
            )}

            {/* NASABAH Specific */}
            {user.role === 'NASABAH' && (
              <>
                <NavItem 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  active={currentView === 'nasabah-dashboard'} 
                  onClick={() => setCurrentView('nasabah-dashboard')} 
                />
                <NavItem 
                  icon={History} 
                  label="Riwayat" 
                  active={currentView === 'nasabah-history'} 
                  onClick={() => setCurrentView('nasabah-history')} 
                />
              </>
            )}
          </nav>

          {/* RIGHT: User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
             <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-gray-700">{user.name}</div>
                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{user.role}</div>
             </div>
             <button 
                onClick={onLogout}
                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Keluar"
             >
                <LogOut size={16} />
             </button>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 overflow-auto bg-[#F9FAFB] relative p-6 sm:p-8">
           {/* Date Header inside content */}
           <div className="flex justify-between items-end mb-6 opacity-60">
               <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                  {currentView === 'dashboard' && 'Ringkasan Eksekutif'}
                  {currentView === 'loans' && 'Data Peminjam'}
                  {currentView === 'request' && 'Formulir Pengajuan'}
                  {currentView === 'rt-validation' && 'Tugas Validasi'}
                  {currentView === 'payment' && 'Administrasi Keuangan'}
                  {currentView === 'nasabah-dashboard' && 'Transparansi Kas RT'}
                  {currentView === 'nasabah-history' && 'Riwayat Pinjaman'}
                  {currentView === 'cash-flow' && 'Laporan Kas'}
               </h2>
               <span className="text-xs font-medium text-gray-500 uppercase tracking-widest hidden sm:block">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
               </span>
           </div>

           {/* Content Children */}
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
           </div>
        </main>

      </div>
    </div>
  );
};