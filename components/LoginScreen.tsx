import React, { useState } from 'react';
import { User, Role, INITIAL_LOANS } from '../types';
import { ArrowRight, UserCircle2, ShieldCheck, Users, ChevronDown, KeyRound, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [role, setRole] = useState<Role>('ADMIN');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Get unique list of existing borrowers/citizens for the dropdown
  const nasabahList = Array.from(new Set(INITIAL_LOANS.map(l => l.borrowerName)));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let finalName = name;
    
    if (role === 'ADMIN') {
      if (password !== 'admin123') {
        setError('Password Salah');
        return;
      }
      finalName = 'Administrator';
    } 
    else if (role === 'RT') {
      if (password !== 'rt123') {
        setError('Password Salah');
        return;
      }
      finalName = 'Ketua RT 003';
    } 
    else if (role === 'NASABAH') {
      if (!name) {
        setError('Silakan pilih nama Anda dari daftar');
        return;
      }
      // Direct login for Nasabah (Password check removed as requested)
      finalName = name;
    }

    onLogin({
      name: finalName,
      role: role
    });
  };

  const getAvatar = () => {
     switch(role) {
       case 'ADMIN': return <ShieldCheck size={48} className="text-white drop-shadow-md" />;
       case 'RT': return <Users size={48} className="text-white drop-shadow-md" />;
       default: return <UserCircle2 size={48} className="text-white drop-shadow-md" />;
     }
  };

  const getRoleLabel = () => {
    switch(role) {
      case 'ADMIN': return 'Administrator';
      case 'RT': return 'Ketua RT 003';
      case 'NASABAH': return 'Warga Desa';
    }
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setError('');
    setPassword('');
    setName(''); // Reset name when switching roles
    setIsTyping(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center font-sans">
      {/* Subtle overlay to ensure text readability without hiding the beautiful background */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md animate-in fade-in zoom-in duration-700 p-4">
        
        {/* Profile Picture Circle with gradient border effect */}
        <div className="mb-8 relative group">
           <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-violet-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
           <div className="relative w-32 h-32 rounded-full bg-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center ring-4 ring-white/20">
              {getAvatar()}
           </div>
        </div>

        {/* Text Area */}
        <div className="text-center mb-8 flex flex-col items-center gap-3">
           <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-xl">
             {role === 'NASABAH' && name ? name : getRoleLabel()}
           </h1>
           
           {/* Role Switcher Pill */}
           <div className="relative inline-block mt-2">
              <select 
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as Role)}
                  className="appearance-none bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-1.5 pl-4 pr-8 rounded-full cursor-pointer transition-all border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-lg backdrop-blur-md"
              >
                 <option value="ADMIN" className="text-gray-900">Administrator</option>
                 <option value="RT" className="text-gray-900">Ketua RT</option>
                 <option value="NASABAH" className="text-gray-900">Warga / Nasabah</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={14} />
           </div>
        </div>

        {/* Login Container */}
        <div className="w-80 backdrop-blur-xl bg-white/10 p-6 rounded-3xl border border-white/20 shadow-2xl transition-all duration-300">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
              
              {/* Inputs Container */}
              <div className="space-y-4">
                
                {/* NASABAH: Dropdown Selection */}
                {role === 'NASABAH' ? (
                   <div className="relative group">
                     <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" size={18} />
                     <select 
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                      }}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all shadow-inner appearance-none cursor-pointer hover:bg-black/30"
                     >
                       <option value="" className="text-gray-500">Pilih Nama Anda...</option>
                       {nasabahList.map((n) => (
                         <option key={n} value={n} className="text-gray-900">{n}</option>
                       ))}
                     </select>
                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" size={16} />
                   </div>
                ) : (
                  /* ADMIN & RT: Password Input Only (Username implied by role) */
                  <div className="relative group">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setIsTyping(e.target.value.length > 0);
                          setError('');
                        }}
                        placeholder="Masukkan Password"
                        className={`w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all shadow-inner ${error ? 'ring-2 ring-red-400/50 bg-red-500/10' : ''}`}
                        autoFocus
                      />
                  </div>
                )}

                {/* Submit Button Area */}
                <div className="relative h-10">
                   {/* For Nasabah, show a full button if name selected */}
                   {role === 'NASABAH' ? (
                      <button 
                        type="submit"
                        disabled={!name}
                        className={`w-full h-full rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2
                          ${name 
                            ? 'bg-white/90 text-black hover:bg-white shadow-lg cursor-pointer' 
                            : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
                      >
                        <CheckCircle2 size={16} />
                        Masuk Aplikasi
                      </button>
                   ) : (
                      /* For Admin/RT, use the typing arrow effect */
                      <button 
                        type="submit"
                        className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-all duration-300 ${isTyping ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
                      >
                         <ArrowRight size={20} strokeWidth={2.5} />
                      </button>
                   )}
                </div>

              </div>

              {/* Error Message Area */}
              <div className="h-5 flex items-center justify-center">
                {error && (
                  <span className="text-red-200 text-xs font-semibold bg-red-500/30 px-2 py-0.5 rounded border border-red-500/20 animate-in slide-in-from-top-1 fade-in">
                    {error}
                  </span>
                )}
              </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
           <p className="text-white/60 text-[10px] tracking-widest uppercase font-semibold drop-shadow-md">Sistem Informasi Desa Claket</p>
           <p className="text-white/40 text-[10px] mt-1">RT 003 / RW 003</p>
        </div>
      </div>
    </div>
  );
};