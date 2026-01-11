import React from 'react';
import { Loan, LoanStatus, formatCurrency, calculateTotal, calculateInterest } from '../types';
import { Wallet, Calendar, CheckCircle2, Clock, XCircle, FileText, UserCheck, Banknote, TrendingUp, PiggyBank, AlertCircle, History } from 'lucide-react';

interface NasabahViewProps {
  loans: Loan[];
  userName: string;
  viewMode: 'dashboard' | 'history';
}

const TimelineItem = ({ 
  icon: Icon, 
  title, 
  date, 
  actor, 
  status,
  isLast = false
}: { 
  icon: React.ElementType, 
  title: string, 
  date?: string, 
  actor: string, 
  status: 'completed' | 'current' | 'pending' | 'rejected',
  isLast?: boolean
}) => {
  let colorClass = 'bg-gray-50 text-gray-300 border-gray-200';
  let lineClass = 'bg-gray-100';
  let textClass = 'text-gray-400';
  
  if (status === 'completed') {
    colorClass = 'bg-green-100 text-green-600 border-green-200';
    lineClass = 'bg-green-200';
    textClass = 'text-gray-800';
  } else if (status === 'current') {
    colorClass = 'bg-blue-100 text-blue-600 border-blue-200';
    lineClass = 'bg-gray-200'; // Line to next is grey
    textClass = 'text-blue-700 font-bold';
  } else if (status === 'rejected') {
    colorClass = 'bg-red-100 text-red-600 border-red-200';
    lineClass = 'bg-red-200';
    textClass = 'text-red-700';
  }

  return (
    <div className="relative pl-10 pb-8">
      {/* Connector Line */}
      {!isLast && (
        <div className={`absolute left-4 top-10 bottom-0 w-0.5 ${status === 'completed' ? 'bg-green-200' : 'bg-gray-100'}`} />
      )}
      
      {/* Icon Bubble */}
      <div className={`absolute left-0 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${colorClass}`}>
        <Icon size={14} />
      </div>
      
      {/* Content */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 pt-1">
        <div>
          <h4 className={`text-sm ${textClass}`}>
            {title}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">Proses oleh: <span className="font-medium">{actor}</span></p>
        </div>
        {date ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 shadow-sm shrink-0 mt-2 sm:mt-0">
                <Calendar size={12} className="text-gray-500" /> {date}
            </div>
        ) : status === 'current' ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 animate-pulse shrink-0 mt-2 sm:mt-0">
                <Clock size={12} /> Sedang Proses
            </div>
        ) : (
            <div className="text-xs text-gray-300 italic mt-1 sm:mt-0">-</div>
        )}
      </div>
    </div>
  );
};

export const NasabahView: React.FC<NasabahViewProps> = ({ loans, userName, viewMode }) => {
  // Filter loans specifically for this user
  const myLoans = loans.filter(l => l.borrowerName.toLowerCase() === userName.toLowerCase());

  // --- DASHBOARD CALCULATIONS ---
  const activeLoans = myLoans.filter(l => l.status === LoanStatus.APPROVED || l.status === LoanStatus.PAYMENT_VERIFYING);
  const paidLoans = myLoans.filter(l => l.status === LoanStatus.PAID);
  
  // Total debt currently owed (Principal + Interest)
  const totalActiveDebt = activeLoans.reduce((acc, l) => acc + calculateTotal(l.amount), 0);
  
  // Total historical borrowing (Principal only)
  const totalHistoricalPrincipal = myLoans.filter(l => l.status !== LoanStatus.REJECTED).reduce((acc, l) => acc + l.amount, 0);

  const renderLoanCard = (loan: Loan) => {
      const total = calculateTotal(loan.amount);
      const isRejected = !!loan.rejectionDate;
      const isApproved = !!loan.approvalDate;
      const isPaidAdmin = !!loan.paymentAdminDate;
      const isFullyPaid = !!loan.paidDate;

      return (
        <div key={loan.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 mb-6 last:mb-0">
            {/* Card Header Summary */}
            <div className="p-6 bg-gradient-to-b from-gray-50/50 to-white border-b border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded font-mono">#{loan.id}</span>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Calendar size={12}/> {loan.date}
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border shadow-sm uppercase tracking-wide
                    ${isFullyPaid ? 'bg-green-100 text-green-700 border-green-200' :
                        isRejected ? 'bg-red-100 text-red-700 border-red-200' :
                        isApproved ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-orange-100 text-orange-700 border-orange-200'
                    }`}>
                    {loan.status}
                </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Pokok Pinjaman</p>
                    <p className="text-xl font-bold text-gray-800 font-mono tracking-tight">{formatCurrency(loan.amount)}</p>
                </div>
                <div className="sm:text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total (+Bunga 20%)</p>
                    <p className="text-xl font-bold text-blue-600 font-mono tracking-tight">{formatCurrency(total)}</p>
                </div>
            </div>
            </div>

            {/* Tracking Timeline */}
            <div className="p-6 sm:p-8 bg-white">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">
                Status Timeline
            </h3>
            
            <div className="relative pl-2">
                <TimelineItem 
                    icon={FileText}
                    title="Pengajuan Terinput"
                    actor="Administrator"
                    date={loan.date}
                    status="completed"
                />
                <TimelineItem 
                    icon={isRejected ? XCircle : UserCheck}
                    title={isRejected ? "Ditolak oleh Ketua RT" : "Disetujui Ketua RT"}
                    actor="Ketua RT"
                    date={loan.approvalDate || loan.rejectionDate}
                    status={isRejected ? 'rejected' : isApproved ? 'completed' : 'current'}
                />
                {!isRejected && (
                    <TimelineItem 
                        icon={Banknote}
                        title="Pembayaran Diterima"
                        actor="Administrator"
                        date={loan.paymentAdminDate}
                        status={isPaidAdmin ? 'completed' : isApproved ? 'current' : 'pending'}
                    />
                )}
                {!isRejected && (
                    <TimelineItem 
                        icon={CheckCircle2}
                        title="Validasi Pelunasan Selesai"
                        actor="Ketua RT"
                        date={loan.paidDate}
                        status={isFullyPaid ? 'completed' : (isPaidAdmin && !isFullyPaid) ? 'current' : 'pending'}
                        isLast={true}
                    />
                )}
            </div>
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      
      {/* 1. PERSONAL DASHBOARD HEADER (Shown in Dashboard mode) */}
      {viewMode === 'dashboard' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Main Card: Active Status */}
                <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Halo, {userName}</h2>
                            <p className="text-blue-100 text-sm opacity-90">Berikut adalah ringkasan keuangan Anda di RT 003.</p>
                        </div>
                        
                        <div className="mt-6">
                            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Total Tagihan Aktif Anda</p>
                            <div className="text-4xl font-mono font-bold tracking-tight">
                                {formatCurrency(totalActiveDebt)}
                            </div>
                            {activeLoans.length > 0 ? (
                                <div className="mt-2 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-white/20">
                                    <AlertCircle size={12} className="text-yellow-300" />
                                    <span>{activeLoans.length} Pinjaman belum lunas</span>
                                </div>
                            ) : (
                                <div className="mt-2 inline-flex items-center gap-2 bg-green-500/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-green-400/30">
                                    <CheckCircle2 size={12} className="text-white" />
                                    <span>Tidak ada tanggungan</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <Wallet className="absolute -right-6 -bottom-6 text-white opacity-10" size={180} />
                </div>

                {/* Side Stats */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Riwayat Lunas</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{paidLoans.length} <span className="text-sm font-normal text-gray-400">Pinjaman</span></div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <PiggyBank size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Total Akumulasi</span>
                        </div>
                        <div className="text-xl font-bold text-gray-800">{formatCurrency(totalHistoricalPrincipal)}</div>
                    </div>
                </div>
            </div>
            
            {/* Quick Status of Latest Loan on Dashboard */}
            {activeLoans.length > 0 && (
                 <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Tagihan Perlu Perhatian</h3>
                    {renderLoanCard(activeLoans[0])}
                    {activeLoans.length > 1 && (
                        <p className="text-center text-xs text-gray-500 mt-2">Dan {activeLoans.length - 1} pinjaman aktif lainnya. Lihat tab Riwayat.</p>
                    )}
                 </div>
            )}
            {activeLoans.length === 0 && myLoans.length > 0 && (
                <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
                    <CheckCircle2 size={48} className="mx-auto text-green-500 mb-2"/>
                    <h3 className="text-gray-800 font-bold">Semua Bersih!</h3>
                    <p className="text-sm text-gray-500">Anda tidak memiliki tanggungan saat ini.</p>
                </div>
            )}
        </div>
      )}

      {/* 2. LOAN LIST & TIMELINE (Shown in History mode) */}
      {viewMode === 'history' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History className="text-gray-400" size={20}/>
                Riwayat Pengajuan Lengkap
            </h3>

            {myLoans.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm border-dashed">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <FileText className="text-gray-300" size={24} />
                </div>
                <p className="text-gray-500 text-sm">Belum ada riwayat pengajuan pinjaman.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                   {myLoans.map(renderLoanCard)}
                </div>
            )}
        </div>
      )}
    </div>
  );
};