import React from 'react';
import { LayoutDashboard, Users, FileCheck, CheckCircle2, PlusCircle, Wallet, LogOut, Info } from 'lucide-react';
import { Role, User } from '../types';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-macos-active text-white shadow-md' 
        : 'text-gray-600 hover:bg-black/5'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span>{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
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
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="w-full max-w-6xl h-[85vh] bg-macos-window backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 flex overflow-hidden flex-col md:flex-row animate-in fade-in zoom-in duration-500">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-macos-sidebar backdrop-blur-xl border-r border-gray-200/50 flex flex-col p-4">
          {/* Traffic Lights */}
          <div className="flex gap-2 mb-8 px-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
          </div>

          {/* App Title in Sidebar */}
          <div className="mb-6 px-2">
            <h1 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">RT 003 / RW 003</h1>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Desa Claket</h2>
          </div>

          {/* Navigation */}
          <div className="space-y-1 flex-1 overflow-y-auto">
            {/* Common Menu */}
            {user.role !== 'NASABAH' && (
              <>
                <div className="text-xs font-semibold text-gray-400 px-3 py-2 mt-2">MENU UTAMA</div>
                <SidebarItem 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  active={currentView === 'dashboard'} 
                  onClick={() => setCurrentView('dashboard')} 
                />
                <SidebarItem 
                  icon={Wallet} 
                  label="Data Pinjaman" 
                  active={currentView === 'loans'} 
                  onClick={() => setCurrentView('loans')} 
                />
              </>
            )}

            {/* ADMIN Specific */}
            {user.role === 'ADMIN' && (
              <>
                <SidebarItem 
                  icon={PlusCircle} 
                  label="Input Pinjaman" 
                  active={currentView === 'request'} 
                  onClick={() => setCurrentView('request')} 
                />
                <div className="text-xs font-semibold text-gray-400 px-3 py-2 mt-4">ADMINISTRASI</div>
                <SidebarItem 
                  icon={CheckCircle2} 
                  label="Terima Pembayaran" 
                  active={currentView === 'payment'} 
                  onClick={() => setCurrentView('payment')} 
                />
              </>
            )}

            {/* RT Specific */}
            {user.role === 'RT' && (
              <>
                <div className="text-xs font-semibold text-gray-400 px-3 py-2 mt-4">VALIDASI</div>
                <SidebarItem 
                  icon={FileCheck} 
                  label="Validasi (RT)" 
                  active={currentView === 'rt-validation'} 
                  onClick={() => setCurrentView('rt-validation')}
                  count={pendingCount + verifyingCount}
                />
              </>
            )}

            {/* NASABAH Specific */}
            {user.role === 'NASABAH' && (
              <>
                <div className="text-xs font-semibold text-gray-400 px-3 py-2 mt-2">PRIBADI</div>
                <SidebarItem 
                  icon={Info} 
                  label="Info Pinjaman Saya" 
                  active={currentView === 'nasabah-view'} 
                  onClick={() => setCurrentView('nasabah-view')} 
                />
              </>
            )}
          </div>

          {/* User Profile / Footer */}
          <div className="mt-auto pt-4 border-t border-gray-200/50">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm
                ${user.role === 'ADMIN' ? 'bg-gradient-to-tr from-blue-400 to-purple-500' : 
                  user.role === 'RT' ? 'bg-gradient-to-tr from-orange-400 to-red-500' : 'bg-gradient-to-tr from-green-400 to-teal-500'}`}>
                {user.role === 'ADMIN' ? 'AD' : user.role === 'RT' ? 'RT' : 'NB'}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium text-gray-700 truncate">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Keluar
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white/60 overflow-hidden relative">
          {/* Header Bar */}
          <div className="h-12 border-b border-gray-200/50 flex items-center justify-between px-6 bg-white/40 backdrop-blur-sm sticky top-0 z-10">
            <span className="text-sm font-medium text-gray-600">
               {currentView === 'dashboard' && 'Overview Statistik'}
               {currentView === 'loans' && 'Data Seluruh Pinjaman'}
               {currentView === 'request' && 'Input Pinjaman Baru'}
               {currentView === 'rt-validation' && 'Pusat Validasi Ketua RT'}
               {currentView === 'payment' && 'Penerimaan Pembayaran (Admin)'}
               {currentView === 'nasabah-view' && 'Informasi Tagihan Anda'}
            </span>
            <div className="flex items-center gap-4">
               <span className="text-xs text-gray-400">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto p-6 scroll-smooth">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};