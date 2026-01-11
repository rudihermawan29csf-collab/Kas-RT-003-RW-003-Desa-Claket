import React, { useState } from 'react';
import { Loan, LoanStatus, formatCurrency, calculateTotal } from '../types';
import { Check, X, Clock, FileCheck, Banknote, Calendar, Filter } from 'lucide-react';

interface RtValidationProps {
  loans: Loan[];
  onUpdateStatus: (id: string, newStatus: LoanStatus, date: string) => void;
}

export const RtValidation: React.FC<RtValidationProps> = ({ loans, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<'LOANS' | 'PAYMENTS'>('LOANS');
  const [actionDate, setActionDate] = useState(new Date().toISOString().split('T')[0]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>('ALL');
  
  // Extract years
  const years = Array.from(new Set(loans.map(l => l.date.substring(0, 4)))).sort().reverse();

  const pendingLoans = loans.filter(l => {
      const matchYear = filterYear === 'ALL' ? true : l.date.startsWith(filterYear);
      return l.status === LoanStatus.PENDING && matchYear;
  });
  
  const verifyingPayments = loans.filter(l => {
      const matchYear = filterYear === 'ALL' ? true : l.date.startsWith(filterYear);
      return l.status === LoanStatus.PAYMENT_VERIFYING && matchYear;
  });

  const handleAction = (id: string, status: LoanStatus) => {
    onUpdateStatus(id, status, actionDate);
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Validasi Ketua RT</h2>
          <p className="text-sm text-gray-500">Kelola persetujuan pinjaman dan verifikasi akhir pelunasan.</p>
        </div>

        {/* Year Filter */}
        <div className="relative">
             <select 
               className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
               value={filterYear}
               onChange={(e) => setFilterYear(e.target.value)}
             >
               <option value="ALL">Semua Tahun</option>
               {years.map(y => <option key={y} value={y}>{y}</option>)}
             </select>
             <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
         </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl w-fit border border-gray-200">
        <button
          onClick={() => setActiveTab('LOANS')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            activeTab === 'LOANS' 
              ? 'bg-white text-gray-800 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-200/50'
          }`}
        >
          <FileCheck size={16} />
          Validasi Hutang
          {pendingLoans.length > 0 && (
            <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingLoans.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            activeTab === 'PAYMENTS' 
              ? 'bg-white text-gray-800 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-200/50'
          }`}
        >
          <Banknote size={16} />
          Verifikasi Pelunasan
          {verifyingPayments.length > 0 && (
            <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{verifyingPayments.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'LOANS' && (
        <div className="grid gap-4 animate-in slide-in-from-bottom-2 duration-300">
          {pendingLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="p-3 bg-gray-50 rounded-full mb-3">
                <Check className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500 font-medium">Semua pengajuan hutang telah diproses.</p>
            </div>
          ) : (
            pendingLoans.map(loan => (
              <div key={loan.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 flex-1 w-full">
                  <div className="p-3 bg-orange-50 rounded-full text-orange-500 mt-1">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{loan.borrowerName}</h3>
                    <div className="text-sm text-gray-500 mb-2">Diajukan pada: {loan.date}</div>
                    <div className="flex gap-6 mt-2">
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Pinjaman</span>
                        <div className="font-medium text-gray-700">{formatCurrency(loan.amount)}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Total Pengembalian</span>
                        <div className="font-bold text-gray-900">{formatCurrency(calculateTotal(loan.amount))}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-auto">
                    {processingId === loan.id ? (
                        <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-2 animate-in fade-in zoom-in-95">
                            <label className="text-xs text-gray-500">Tanggal Keputusan:</label>
                            <input 
                              type="date" 
                              value={actionDate}
                              onChange={(e) => setActionDate(e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-400"
                            />
                            <div className="flex gap-2 mt-1">
                                <button 
                                  onClick={() => handleAction(loan.id, LoanStatus.REJECTED)}
                                  className="flex-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200"
                                >
                                  Tolak
                                </button>
                                <button 
                                  onClick={() => handleAction(loan.id, LoanStatus.APPROVED)}
                                  className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700"
                                >
                                  Setujui
                                </button>
                            </div>
                            <button onClick={() => setProcessingId(null)} className="text-xs text-gray-400 text-center hover:underline">Batal</button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setProcessingId(loan.id);
                                    setActionDate(new Date().toISOString().split('T')[0]);
                                }}
                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium transition-all active:scale-95"
                            >
                                <Check size={16} /> Proses
                            </button>
                        </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'PAYMENTS' && (
        <div className="grid gap-4 animate-in slide-in-from-bottom-2 duration-300">
           {verifyingPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="p-3 bg-gray-50 rounded-full mb-3">
                <Check className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500 font-medium">Tidak ada pembayaran menunggu verifikasi.</p>
            </div>
          ) : (
            verifyingPayments.map(loan => (
              <div key={loan.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 flex-1 w-full">
                  <div className="p-3 bg-purple-50 rounded-full text-purple-500 mt-1">
                    <Banknote size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{loan.borrowerName}</h3>
                    <div className="flex items-center gap-2 mb-2">
                         <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Sudah Diverifikasi Admin</span>
                    </div>
                    {loan.paymentAdminDate && (
                        <div className="text-xs text-gray-500 mb-1">Tgl Terima Uang: {loan.paymentAdminDate}</div>
                    )}
                    <div className="flex gap-6 mt-2">
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Total Lunas</span>
                        <div className="font-bold text-gray-900 text-lg">{formatCurrency(calculateTotal(loan.amount))}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-auto">
                    {processingId === loan.id ? (
                        <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-2 animate-in fade-in zoom-in-95">
                            <label className="text-xs text-gray-500">Tanggal Validasi Lunas:</label>
                            <input 
                              type="date" 
                              value={actionDate}
                              onChange={(e) => setActionDate(e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-green-400"
                            />
                            <button 
                              onClick={() => handleAction(loan.id, LoanStatus.PAID)}
                              className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 w-full"
                            >
                              Konfirmasi Lunas
                            </button>
                            <button onClick={() => setProcessingId(null)} className="text-xs text-gray-400 text-center hover:underline">Batal</button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                setProcessingId(loan.id);
                                setActionDate(loan.paymentAdminDate || new Date().toISOString().split('T')[0]);
                            }}
                            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm font-medium transition-all active:scale-95"
                        >
                            <Check size={16} /> Validasi Lunas
                        </button>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};