import React, { useState } from 'react';
import { Loan, LoanStatus, CashTransaction, formatCurrency } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, AlertCircle, Banknote, Wallet, ArrowUpCircle, ArrowDownCircle, X, Link2, FileText, Coins, PieChart, ChevronDown, ChevronRight, Briefcase } from 'lucide-react';

interface DashboardProps {
  loans: Loan[];
  cashTransactions: CashTransaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ loans, cashTransactions }) => {
  const [detailView, setDetailView] = useState<'INCOME' | 'EXPENSE' | null>(null);
  // State untuk melacak accordion mana yang terbuka. Format ID: "TAHUN-TIPE" (misal: "2023-MANUAL")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setExpandedSections(newSet);
  };

  // --- CASH FLOW CALCULATIONS ---

  // 1. Modal Awal
  const initialBalance = cashTransactions
    .filter(t => t.category === 'INITIAL_BALANCE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Pemasukan Manual (Laporan Kas selain pinjaman)
  const manualIncomeTransactions = cashTransactions.filter(t => t.type === 'INCOME' && t.category === 'MANUAL');
  const manualIncomeTotal = manualIncomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Analisa Pelunasan Pinjaman (Sistem)
  const loanRepaymentTransactions = cashTransactions.filter(t => t.category === 'LOAN_REPAYMENT');
  const totalLoanRepaymentRaw = loanRepaymentTransactions.reduce((acc, t) => acc + t.amount, 0);
  
  // Hitung Porsi Bunga & Pokok dari Transaksi Pelunasan
  // Asumsi: Nilai di transaksi adalah Total (120%). Pokok = Total / 1.2. Bunga = Sisanya.
  const totalInterestReceived = loanRepaymentTransactions.reduce((acc, t) => {
      const principalPart = t.amount / 1.2;
      return acc + (t.amount - principalPart);
  }, 0);

  const totalPrincipalReturned = totalLoanRepaymentRaw - totalInterestReceived;

  // 4. Pengeluaran
  const expenseTransactions = cashTransactions.filter(t => t.type === 'EXPENSE');
  const totalExpense = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);


  // --- FORMULA BARU SESUAI REQUEST ---
  // Total Pemasukan Display = Modal Awal + Bunga + Pemasukan Manual
  const totalPemasukanDisplay = initialBalance + totalInterestReceived + manualIncomeTotal;

  // Saldo Akhir Real (Uang Fisik) = Semua Uang Masuk (termasuk pokok kembali) - Semua Keluar
  const totalCashInReal = initialBalance + manualIncomeTotal + totalLoanRepaymentRaw;
  const finalBalance = totalCashInReal - totalExpense;


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

  // --- MODAL DATA PREPARATION ---
  // Filter list transaksi untuk tabel detail
  const rawDetailTransactions = detailView === 'INCOME' 
     ? cashTransactions.filter(t => t.type === 'INCOME' || t.category === 'INITIAL_BALANCE')
     : expenseTransactions;
  
  // Group by Year for Display
  const years = Array.from(new Set(rawDetailTransactions.map(t => t.date.substring(0, 4)))).sort().reverse();

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

  // Helper render Rows
  const renderTransactionRows = (transactions: CashTransaction[]) => {
      return (
        <div className="border-t border-gray-100 bg-white">
            <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Tanggal</th>
                        <th className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Keterangan</th>
                        <th className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase text-right">Nominal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {transactions.map(t => {
                        const isIncome = t.type === 'INCOME';
                        return (
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2 text-xs text-gray-500 font-mono">{t.date}</td>
                                <td className="px-4 py-2 text-xs font-medium text-gray-700">{t.description}</td>
                                <td className={`px-4 py-2 text-xs font-bold text-right font-mono ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(t.amount)}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
      );
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

        {/* Card 2: Total Pemasukan (FORMULA KHUSUS) */}
        <div 
            onClick={() => setDetailView('INCOME')}
            className="bg-white/80 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:bg-white hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-green-100 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
              <ArrowUpCircle size={20} />
            </div>
            <span className="text-[10px] font-medium bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Rincian</span>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalPemasukanDisplay)}</div>
            <div className="text-xs text-gray-500 font-bold">Total Pemasukan</div>
            <div className="text-[9px] text-green-600 mt-1 font-medium">
               (Modal + Bunga + Kas Lain)
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
             <span className="text-[10px] font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Rincian</span>
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
            <div className="text-xs text-blue-100">Saldo Akhir (Fisik)</div>
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

      {/* DETAIL MODAL (ACCORDION STYLE) */}
      {detailView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailView(null)} />
             <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-3xl relative z-10 animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {detailView === 'INCOME' ? 
                            <><ArrowUpCircle className="text-green-600" /> Analisa Pemasukan</> : 
                            <><ArrowDownCircle className="text-red-600" /> Analisa Pengeluaran</>
                        }
                    </h3>
                    <button onClick={() => setDetailView(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Content Area */}
                <div className="overflow-y-auto flex-1 p-6 bg-gray-50/50 space-y-6">
                    {years.map(year => {
                        // Filter transactions for this year
                        const yearTransactions = rawDetailTransactions
                            .filter(t => t.date.startsWith(year))
                            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        
                        if (yearTransactions.length === 0) return null;

                        // SPLIT DATA
                        const manualTransactions = yearTransactions.filter(t => t.category === 'MANUAL' || t.category === 'INITIAL_BALANCE');
                        const systemTransactions = yearTransactions.filter(t => t.category.includes('LOAN'));

                        const manualTotal = manualTransactions.reduce((acc, t) => acc + t.amount, 0);
                        const systemTotal = systemTransactions.reduce((acc, t) => acc + t.amount, 0);
                        const yearTotal = manualTotal + systemTotal;

                        // Accordion Keys
                        const manualKey = `${year}-MANUAL`;
                        const systemKey = `${year}-SYSTEM`;

                        return (
                            <div key={year} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                {/* YEAR HEADER */}
                                <div className="bg-gray-100/80 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                    <h4 className="font-bold text-gray-700">Tahun {year}</h4>
                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${detailView === 'INCOME' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                        Total: {formatCurrency(yearTotal)}
                                    </span>
                                </div>

                                <div className="p-2 space-y-2">
                                    {/* ACCORDION 1: MANUAL */}
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button 
                                            onClick={() => toggleSection(manualKey)}
                                            className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                {expandedSections.has(manualKey) ? <ChevronDown size={16} className="text-gray-400"/> : <ChevronRight size={16} className="text-gray-400"/>}
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-full ${detailView === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {detailView === 'INCOME' ? <Coins size={14}/> : <Briefcase size={14}/>}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {detailView === 'INCOME' ? 'Kas Manual & Modal' : 'Operasional / Manual'}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-sm font-mono font-medium text-gray-600">{formatCurrency(manualTotal)}</span>
                                        </button>
                                        
                                        {/* Rows */}
                                        {expandedSections.has(manualKey) && (
                                            manualTransactions.length > 0 ? renderTransactionRows(manualTransactions) : (
                                                <div className="p-3 text-xs text-center text-gray-400 bg-gray-50">Tidak ada transaksi</div>
                                            )
                                        )}
                                    </div>

                                    {/* ACCORDION 2: SYSTEM */}
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button 
                                            onClick={() => toggleSection(systemKey)}
                                            className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                {expandedSections.has(systemKey) ? <ChevronDown size={16} className="text-gray-400"/> : <ChevronRight size={16} className="text-gray-400"/>}
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-full ${detailView === 'INCOME' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        <Link2 size={14}/>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {detailView === 'INCOME' ? 'Sistem: Pelunasan Pinjaman' : 'Sistem: Pencairan Pinjaman'}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-sm font-mono font-medium text-gray-600">{formatCurrency(systemTotal)}</span>
                                        </button>
                                        
                                        {/* Rows */}
                                        {expandedSections.has(systemKey) && (
                                            systemTransactions.length > 0 ? renderTransactionRows(systemTransactions) : (
                                                <div className="p-3 text-xs text-center text-gray-400 bg-gray-50">Tidak ada transaksi</div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer with Breakdown */}
                {detailView === 'INCOME' && (
                  <div className="bg-white p-6 rounded-b-2xl border-t border-gray-200 shadow-md relative z-10">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                          <div className="p-2 bg-purple-100 rounded-lg border border-purple-200">
                               <div className="text-purple-700 font-bold mb-1">Modal Awal</div>
                               <div className="font-mono">{formatCurrency(initialBalance)}</div>
                          </div>
                          <div className="p-2 bg-green-100 rounded-lg border border-green-200">
                               <div className="text-green-700 font-bold mb-1">Kas Manual</div>
                               <div className="font-mono">{formatCurrency(manualIncomeTotal)}</div>
                          </div>
                          <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
                               <div className="text-blue-700 font-bold mb-1">Bunga (20%)</div>
                               <div className="font-mono">{formatCurrency(totalInterestReceived)}</div>
                          </div>
                          <div className="p-2 bg-gray-200 rounded-lg border border-gray-300 opacity-75">
                               <div className="text-gray-600 font-bold mb-1">Pokok Kembali</div>
                               <div className="font-mono">{formatCurrency(totalPrincipalReturned)}</div>
                          </div>
                      </div>

                      <div className="flex justify-between items-center bg-green-50 rounded-lg p-3 mt-4 border border-green-200 shadow-sm">
                          <span className="text-sm font-bold text-green-800 uppercase tracking-wide">Total Pemasukan (Rumus)</span>
                          <span className="text-2xl font-bold text-green-700">
                              {formatCurrency(totalPemasukanDisplay)}
                          </span>
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-[10px] text-gray-400">Total Pemasukan = Modal Awal + Kas Manual + Bunga (Tidak termasuk Pokok Kembali)</span>
                      </div>
                  </div>
                )}

                {detailView === 'EXPENSE' && (
                   <div className="bg-white p-6 rounded-b-2xl border-t border-gray-200 shadow-md relative z-10">
                      <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Pengeluaran</span>
                          <span className="text-2xl font-bold text-red-600">
                              {formatCurrency(totalExpense)}
                          </span>
                      </div>
                   </div>
                )}
             </div>
          </div>
      )}
    </div>
  );
};