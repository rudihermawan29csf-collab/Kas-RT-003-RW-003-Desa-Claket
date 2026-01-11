import React, { useState } from 'react';
import { Loan, LoanStatus, formatCurrency, calculateTotal } from '../types';
import { Calendar, Filter } from 'lucide-react';

interface AdminPaymentProps {
  loans: Loan[];
  onUpdateStatus: (id: string, newStatus: LoanStatus, date: string) => void;
}

export const AdminPayment: React.FC<AdminPaymentProps> = ({ loans, onUpdateStatus }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const years = Array.from(new Set(loans.map(l => l.date.substring(0, 4)))).sort().reverse();

  const activeLoans = loans.filter(loan => {
      const isActive = loan.status === LoanStatus.APPROVED;
      const matchesYear = filterYear === 'ALL' ? true : loan.date.startsWith(filterYear);
      return isActive && matchesYear;
  });

  const handleConfirmPayment = (id: string) => {
     // Langsung update status tanpa window.confirm karena UI input tanggal sudah cukup sebagai konfirmasi
     onUpdateStatus(id, LoanStatus.PAYMENT_VERIFYING, selectedDate);
     setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Penerimaan Pembayaran</h2>
            <p className="text-sm text-gray-500">Admin memasukkan tanggal terima uang, menunggu verifikasi RT.</p>
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama Peminjam</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tanggal Pinjam</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Total Tagihan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Aksi (Terima Uang)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeLoans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada pinjaman aktif yang perlu ditagih pada tahun ini.
                  </td>
                </tr>
              ) : (
                activeLoans.map(loan => (
                  <tr key={loan.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{loan.borrowerName}</div>
                      <div className="text-xs text-gray-400">ID: #{loan.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{loan.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-gray-900">{formatCurrency(calculateTotal(loan.amount))}</div>
                      <div className="text-xs text-red-500">Termasuk Bunga 20%</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {processingId === loan.id ? (
                        <div className="flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
                           <input 
                             type="date" 
                             value={selectedDate} 
                             onChange={(e) => setSelectedDate(e.target.value)}
                             className="text-xs border border-blue-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-200"
                           />
                           <button 
                             onClick={() => handleConfirmPayment(loan.id)}
                             className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 shadow-sm"
                           >
                             Terima
                           </button>
                           <button 
                             onClick={() => setProcessingId(null)}
                             className="px-2 py-1 text-gray-500 text-xs hover:bg-gray-200 rounded"
                           >
                             Batal
                           </button>
                        </div>
                      ) : (
                        <button 
                            onClick={() => {
                                setProcessingId(loan.id);
                                setSelectedDate(new Date().toISOString().split('T')[0]);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95"
                        >
                            <span className="font-bold text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 border border-blue-200">Rp</span>
                            Terima Pembayaran
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};