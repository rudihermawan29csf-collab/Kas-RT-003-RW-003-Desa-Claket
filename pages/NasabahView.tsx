import React from 'react';
import { Loan, LoanStatus, formatCurrency, calculateTotal, calculateInterest } from '../types';
import { Wallet, Calendar, CheckCircle2, Clock, XCircle, FileText, UserCheck, Banknote } from 'lucide-react';

interface NasabahViewProps {
  loans: Loan[];
  userName: string;
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

export const NasabahView: React.FC<NasabahViewProps> = ({ loans, userName }) => {
  const myLoans = loans.filter(l => l.borrowerName.toLowerCase() === userName.toLowerCase());

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Halo, {userName}</h2>
        <p className="text-blue-100">Pantau status pengajuan dan pembayaran pinjaman Anda secara real-time.</p>
      </div>

      {myLoans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Wallet className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Tidak Ada Data Pinjaman</h3>
          <p className="text-gray-500 max-w-xs mx-auto text-sm">Anda belum memiliki riwayat pinjaman yang tercatat di sistem RT 003.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {myLoans.map(loan => {
             const interest = calculateInterest(loan.amount);
             const total = calculateTotal(loan.amount);
             
             // Determine Steps Status
             const isRejected = !!loan.rejectionDate;
             const isApproved = !!loan.approvalDate;
             const isPaidAdmin = !!loan.paymentAdminDate;
             const isFullyPaid = !!loan.paidDate;

             return (
              <div key={loan.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                
                {/* Card Header Summary */}
                <div className="p-6 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded font-mono">#{loan.id}</span>
                        <span className="text-xs text-gray-500 font-medium">Pengajuan: {loan.date}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm
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
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Pokok Pinjaman</p>
                          <p className="text-2xl font-bold text-gray-800 font-mono tracking-tight">{formatCurrency(loan.amount)}</p>
                      </div>
                       <div className="sm:text-right">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Total (+Bunga 20%)</p>
                          <p className="text-2xl font-bold text-blue-600 font-mono tracking-tight">{formatCurrency(total)}</p>
                      </div>
                   </div>
                </div>

                {/* Tracking Timeline */}
                <div className="p-6 sm:p-8">
                   <h3 className="text-sm font-bold text-gray-900 mb-8 flex items-center gap-2 pb-4 border-b border-gray-100">
                     <Clock size={18} className="text-blue-600"/>
                     Riwayat Proses Pinjaman
                   </h3>
                   
                   <div className="relative pl-2">
                      {/* Step 1: Submitted (Admin) */}
                      <TimelineItem 
                        icon={FileText}
                        title="Pengajuan Terinput"
                        actor="Administrator"
                        date={loan.date}
                        status="completed"
                      />

                      {/* Step 2: Approval (RT) */}
                      <TimelineItem 
                        icon={isRejected ? XCircle : UserCheck}
                        title={isRejected ? "Ditolak oleh Ketua RT" : "Disetujui Ketua RT"}
                        actor="Ketua RT"
                        date={loan.approvalDate || loan.rejectionDate}
                        status={
                            isRejected ? 'rejected' : 
                            isApproved ? 'completed' : 
                            'current'
                        }
                      />

                      {/* Step 3: Payment (Admin) - Only show if not rejected */}
                      {!isRejected && (
                          <TimelineItem 
                            icon={Banknote}
                            title="Pembayaran Diterima"
                            actor="Administrator"
                            date={loan.paymentAdminDate}
                            status={
                                isPaidAdmin ? 'completed' : 
                                isApproved ? 'current' : 
                                'pending'
                            }
                          />
                      )}

                      {/* Step 4: Final Validation (RT) - Only show if not rejected */}
                      {!isRejected && (
                           <TimelineItem 
                            icon={CheckCircle2}
                            title="Validasi Pelunasan Selesai"
                            actor="Ketua RT"
                            date={loan.paidDate}
                            status={
                                isFullyPaid ? 'completed' : 
                                (isPaidAdmin && !isFullyPaid) ? 'current' : 
                                'pending'
                            }
                            isLast={true}
                          />
                      )}
                   </div>
                </div>

              </div>
             );
          })}
        </div>
      )}
    </div>
  );
};