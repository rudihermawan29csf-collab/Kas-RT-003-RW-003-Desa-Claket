import React, { useState } from 'react';
import { Loan, LoanStatus, formatCurrency, calculateInterest, calculateTotal, Role } from '../types';
import { Search, Filter, Trash2, Edit, X, Save, Calendar, Wallet, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface LoanListProps {
  loans: Loan[];
  userRole: Role;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Loan>) => void;
}

export const LoanList: React.FC<LoanListProps> = ({ loans, userRole, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');
  
  // Edit State
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Extract unique years from dates
  const years = Array.from(new Set(loans.map(l => l.date.substring(0, 4)))).sort().reverse();

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' ? true : loan.status === filterStatus;
    const matchesYear = filterYear === 'ALL' ? true : loan.date.startsWith(filterYear);
    return matchesSearch && matchesStatus && matchesYear;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLoan) {
      onEdit(editingLoan.id, {
        borrowerName: editingLoan.borrowerName,
        amount: editingLoan.amount,
        date: editingLoan.date
      });
      setEditingLoan(null);
    }
  };

  // --- STATS CALCULATIONS (Based on ALL loans, not just filtered, or as needed) ---
  const totalPrincipal = loans.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalPotentialInterest = loans.reduce((acc, curr) => acc + (curr.amount * 0.20), 0);
  
  const totalPaidInterest = loans
    .filter(l => l.status === LoanStatus.PAID)
    .reduce((acc, curr) => acc + (curr.amount * 0.20), 0);

  // Outstanding: Active loans (Approved or Payment Verifying) -> Full Amount (Principal + Interest)
  const totalOutstanding = loans
    .filter(l => l.status === LoanStatus.APPROVED || l.status === LoanStatus.PAYMENT_VERIFYING)
    .reduce((acc, curr) => acc + calculateTotal(curr.amount), 0);


  return (
    <div className="space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Wallet size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Total Pinjaman</span>
             </div>
             <div className="text-lg font-bold text-gray-800">{formatCurrency(totalPrincipal)}</div>
             <div className="text-[10px] text-gray-500">Pokok tersalurkan</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-purple-600">
                <TrendingUp size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Potensi Bunga</span>
             </div>
             <div className="text-lg font-bold text-gray-800">{formatCurrency(totalPotentialInterest)}</div>
             <div className="text-[10px] text-gray-500">Est. Pendapatan (20%)</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Bunga Masuk</span>
             </div>
             <div className="text-lg font-bold text-gray-800">{formatCurrency(totalPaidInterest)}</div>
             <div className="text-[10px] text-gray-500">Dari pinjaman lunas</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm bg-gradient-to-br from-red-50 to-white">
             <div className="flex items-center gap-2 mb-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Belum Bayar</span>
             </div>
             <div className="text-lg font-bold text-red-600">{formatCurrency(totalOutstanding)}</div>
             <div className="text-[10px] text-red-400">Total tagihan aktif</div>
          </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <h2 className="text-xl font-bold text-gray-800">Daftar Peminjam</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama warga..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
             {/* Year Filter */}
             <div className="relative flex-1 sm:flex-initial">
                 <select 
                   className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                   value={filterYear}
                   onChange={(e) => setFilterYear(e.target.value)}
                 >
                   <option value="ALL">Semua Tahun</option>
                   {years.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
                 <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
             </div>

             {/* Status Filter */}
             <div className="relative flex-1 sm:flex-initial">
                 <select 
                   className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value)}
                 >
                   <option value="ALL">Semua Status</option>
                   <option value={LoanStatus.APPROVED}>Belum Lunas</option>
                   <option value={LoanStatus.PAID}>Lunas</option>
                   <option value={LoanStatus.PENDING}>Menunggu</option>
                 </select>
                 <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
             </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama & Tanggal</th>
                <th className="px-6 py-4">Pinjaman</th>
                <th className="px-6 py-4">Total (+20%)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Keterangan</th>
                {userRole === 'ADMIN' && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'ADMIN' ? 7 : 6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Tidak ada data pinjaman ditemukan.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan, index) => {
                  const interest = calculateInterest(loan.amount);
                  const total = calculateTotal(loan.amount);
                  return (
                    <tr key={loan.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{loan.borrowerName}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={10} /> {loan.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{formatCurrency(loan.amount)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800 font-mono">{formatCurrency(total)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${loan.status === LoanStatus.APPROVED ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            loan.status === LoanStatus.PAID ? 'bg-green-50 text-green-700 border-green-200' :
                            loan.status === LoanStatus.PENDING ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                            loan.status === LoanStatus.PAYMENT_VERIFYING ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                         {loan.status === LoanStatus.PAID && loan.paidDate && (
                           <div>Lunas: {loan.paidDate}</div>
                         )}
                         {loan.status === LoanStatus.APPROVED && loan.approvalDate && (
                           <div>ACC: {loan.approvalDate}</div>
                         )}
                         {loan.status === LoanStatus.PENDING && '-'}
                      </td>
                      {userRole === 'ADMIN' && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                             <button 
                                onClick={() => setEditingLoan(loan)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                title="Edit"
                             >
                               <Edit size={16} />
                             </button>
                             <button 
                                onClick={() => onDelete(loan.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                title="Hapus"
                             >
                               <Trash2 size={16} />
                             </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal Overlay */}
      {editingLoan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingLoan(null)} />
           <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95">
              <button 
                onClick={() => setEditingLoan(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-gray-800 mb-6">Edit Data Pinjaman</h3>
              
              <form onSubmit={handleSaveEdit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Nasabah</label>
                    <input 
                      type="text" 
                      value={editingLoan.borrowerName}
                      onChange={(e) => setEditingLoan({...editingLoan, borrowerName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                    <input 
                      type="date" 
                      value={editingLoan.date}
                      onChange={(e) => setEditingLoan({...editingLoan, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pinjaman (Rp)</label>
                    <input 
                      type="number" 
                      value={editingLoan.amount}
                      onChange={(e) => setEditingLoan({...editingLoan, amount: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setEditingLoan(null)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <Save size={16} /> Simpan
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};