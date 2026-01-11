import React, { useState } from 'react';
import { Loan, LoanStatus, CashTransaction, formatCurrency } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, AlertCircle, Banknote, Wallet, ArrowUpCircle, ArrowDownCircle, X, Link2, FileText, Coins } from 'lucide-react';

interface DashboardProps {
  loans: Loan[];
  cashTransactions: CashTransaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ loans, cashTransactions }) => {
  const [detailView, setDetailView] = useState<'INCOME' | 'EXPENSE' | null>(null);

  // --- CASH FLOW CALCULATIONS ---
  const initialBalance = cashTransactions
    .filter(t => t.category === 'INITIAL_BALANCE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const incomeTransactions = cashTransactions.filter(t => t.type === 'INCOME' && t.category !== 'INITIAL_BALANCE');
  const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const expenseTransactions = cashTransactions.filter(t => t.type === 'EXPENSE');
  const totalExpense = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const finalBalance = initialBalance + totalIncome - totalExpense;


  // --- LOAN SPECIFIC STATS (For Charts) ---
  const activeLoans = loans.filter(l => l.status === LoanStatus.APPROVED);
  const pendingLoans = loans.filter(l => l.status === LoanStatus.PENDING);
  const paidLoans = loans.filter(l => l.status === LoanStatus.PAID);

  // Calculate Nominals per Status
  const activeAmount = activeLoans.reduce((acc, l) => acc + l.amount, 0);
  const paidAmount = paidLoans.reduce((acc, l) => acc + l.amount, 0);
  const pendingAmount = pendingLoans.reduce((acc, l) => acc + l.amount, 0);

  const statusData = [
    { name: 'Aktif', count: activeLoans.length, amount: activeAmount, color: '#007AFF' },
    { name: 'Lunas', count: paidLoans.length, amount: paidAmount, color: '#34C759' },
    { name: 'Pending', count: pendingLoans.length, amount: pendingAmount, color: '#FF9F0A' },
  ];

  const recentActivity = loans
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // --- MODAL CALCS ---
  const detailTransactions = detailView === 'INCOME' ? incomeTransactions : expenseTransactions;
  
  const loanRelatedTotal = detailTransactions
    .filter(t => t.category.includes('LOAN'))
    .reduce((acc, t) => acc + t.amount, 0);

  const cashRelatedTotal = detailTransactions
    .filter(t => !t.category.includes('LOAN'))
    .reduce((acc, t) => acc + t.amount, 0);

  // Custom Tooltip for Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-bold text-gray-800">{label}</p>
          <p className="text-xs text-gray-500 mb-1">Jumlah: <span className="font-semibold text-gray-800">{data.count} Orang</span></p>
          <p className="text-xs text-blue-600 font-mono font-bold">{formatCurrency(data.amount)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Awal */}
        <div className="bg-white/80 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Wallet size={20} />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Modal</span>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-700">{formatCurrency(initialBalance)}</div>
            <div className="text-xs text-gray-500">Saldo Awal Kas</div>
          </div>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div 
            onClick={() => setDetailView('INCOME')}
            className="bg-white/80 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:bg-white hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-green-100 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
              <ArrowUpCircle size={20} />
            </div>
            <span className="text-[10px] font-medium bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Klik untuk Rincian</span>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <div className="text-xs text-gray-500">Total Pemasukan</div>
            <div className="text-[10px] text-green-600 mt-1">
               (Termasuk Bunga Pinjaman)
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div 
            onClick={() => setDetailView('EXPENSE')}
            className="bg-white/80 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:bg-white hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-red-100 rounded-lg text-red-600 group-hover:scale-110 transition-transform">
              <ArrowDownCircle size={20} />
            </div>
             <span className="text-[10px] font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Klik untuk Rincian</span>
          </div>
          <div>
            <div className="text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
            <div className="text-xs text-gray-500">Total Pengeluaran</div>
            <div className="text-[10px] text-red-600 mt-1">
               (Termasuk Pencairan Pinjaman)
            </div>
          </div>
        </div>

        {/* Card 4: Saldo Akhir */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-xl text-white shadow-lg flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/20 rounded-lg text-white">
              <Banknote size={20} />
            </div>
            {pendingLoans.length > 0 && <span className="text-[10px] bg-red-500 px-2 py-0.5 rounded-full text-white animate-pulse">{pendingLoans.length} Pending</span>}
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{formatCurrency(finalBalance)}</div>
            <div className="text-xs text-blue-100">Saldo Akhir Saat Ini</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white/80 p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-6">Status Pinjaman (Jumlah & Nominal)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} width={80}/>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" barSize={32} radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 p-6 rounded-xl border border-gray-200 shadow-sm">
           <h3 className="text-sm font-semibold text-gray-700 mb-4">Aktivitas Pinjaman Terbaru</h3>
           <div className="space-y-4">
             {recentActivity.map((loan) => (
               <div key={loan.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                 <div>
                   <div className="text-sm font-medium text-gray-800">{loan.borrowerName}</div>
                   <div className="text-xs text-gray-500">{loan.date}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs font-bold text-gray-700">{formatCurrency(loan.amount)}</div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-medium inline-block mt-1
                        ${loan.status === LoanStatus.APPROVED ? 'bg-blue-50 text-blue-600' : 
                        loan.status === LoanStatus.PAID ? 'bg-green-50 text-green-600' :
                        loan.status === LoanStatus.PENDING ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                        }`}>
                    {loan.status}
                    </div>
                 </div>
               </div>
             ))}
             {recentActivity.length === 0 && <div className="text-xs text-gray-400 text-center py-4">Belum ada data</div>}
           </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailView(null)} />
             <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl relative z-10 animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {detailView === 'INCOME' ? 
                            <><ArrowUpCircle className="text-green-600" /> Rincian Pemasukan</> : 
                            <><ArrowDownCircle className="text-red-600" /> Rincian Pengeluaran</>
                        }
                    </h3>
                    <button onClick={() => setDetailView(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sumber / Kategori</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {detailTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
                                const isLoan = t.category.includes('LOAN');
                                const isInitial = t.category === 'INITIAL_BALANCE';
                                const isIncome = t.type === 'INCOME';

                                // UNIFIED ROW STYLING Logic
                                let rowClass = 'bg-white';
                                let textClass = 'text-gray-800';
                                let amountClass = isIncome ? 'text-green-700' : 'text-red-700';
                                let icon = <FileText size={12}/>;
                                let label = 'Transaksi';

                                if (isInitial) {
                                    rowClass = 'bg-purple-50 hover:bg-purple-100';
                                    textClass = 'text-purple-900';
                                    amountClass = 'text-purple-700';
                                    icon = <Wallet size={12}/>;
                                    label = 'Modal Awal';
                                } else if (isIncome) {
                                    if (isLoan) {
                                        rowClass = 'bg-blue-50 hover:bg-blue-100';
                                        textClass = 'text-blue-900';
                                        amountClass = 'text-blue-700';
                                        icon = <Link2 size={12}/>;
                                        label = 'Sistem Pinjaman';
                                    } else {
                                        rowClass = 'bg-green-50 hover:bg-green-100';
                                        textClass = 'text-green-900';
                                        amountClass = 'text-green-700';
                                        icon = <Coins size={12}/>;
                                        label = 'Kas Manual';
                                    }
                                } else {
                                    // Expense
                                    if (isLoan) {
                                        rowClass = 'bg-orange-50 hover:bg-orange-100';
                                        textClass = 'text-orange-900';
                                        amountClass = 'text-orange-700';
                                        icon = <Link2 size={12}/>;
                                        label = 'Sistem Pinjaman';
                                    } else {
                                        rowClass = 'bg-red-50 hover:bg-red-100';
                                        textClass = 'text-red-900';
                                        amountClass = 'text-red-700';
                                        icon = <FileText size={12}/>;
                                        label = 'Kas Operasional';
                                    }
                                }
                                
                                return (
                                    <tr key={t.id} className={`${rowClass} transition-colors`}>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-white/60 border-white/50 ${amountClass}`}>
                                                {icon} {label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{t.date}</td>
                                        <td className={`px-4 py-3 text-sm font-medium ${textClass}`}>{t.description}</td>
                                        <td className={`px-4 py-3 text-sm font-bold text-right font-mono ${amountClass}`}>
                                            {formatCurrency(t.amount)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {detailTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">Tidak ada data rincian.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer with Breakdown */}
                <div className="pt-4 border-t border-gray-200 mt-2 bg-gray-50/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div className="flex justify-between items-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                             <span className="text-blue-700 flex items-center gap-2 font-medium">
                                <Link2 size={14}/> Dari Sistem Pinjaman
                             </span>
                             <span className="font-bold text-blue-800">{formatCurrency(loanRelatedTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                             <span className="text-gray-700 flex items-center gap-2 font-medium">
                                <FileText size={14}/> Dari Kas Manual
                             </span>
                             <span className="font-bold text-gray-800">{formatCurrency(cashRelatedTotal)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-4 pt-2 border-t border-gray-200">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Keseluruhan</span>
                        <span className={`text-2xl font-bold ${detailView === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(detailView === 'INCOME' ? totalIncome : totalExpense)}
                        </span>
                    </div>
                </div>
             </div>
          </div>
      )}
    </div>
  );
};