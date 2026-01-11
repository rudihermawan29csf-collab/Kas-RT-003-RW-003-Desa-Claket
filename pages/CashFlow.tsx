import React, { useState } from 'react';
import { CashTransaction, TransactionType, formatCurrency, Role } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, Plus, Trash2, Save, Link2, Folder, Edit, X, Coins, Banknote, FileText } from 'lucide-react';

interface CashFlowProps {
  transactions: CashTransaction[];
  userRole: Role;
  onAddTransaction: (data: Omit<CashTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (id: string, data: Partial<CashTransaction>) => void;
}

export const CashFlow: React.FC<CashFlowProps> = ({ transactions, userRole, onAddTransaction, onDeleteTransaction, onEditTransaction }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');
  
  // Detail Modal State
  const [detailView, setDetailView] = useState<'INCOME' | 'EXPENSE' | null>(null);

  // Input Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [amountNum, setAmountNum] = useState(0);
  const [type, setType] = useState<TransactionType>('INCOME');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<CashTransaction | null>(null);

  // Stats Calculation
  const initialBalanceTransaction = transactions.find(t => t.category === 'INITIAL_BALANCE');
  
  const initialBalance = transactions
    .filter(t => t.category === 'INITIAL_BALANCE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // INCOME excluding Initial Balance
  const incomeTransactions = transactions.filter(t => t.type === 'INCOME' && t.category !== 'INITIAL_BALANCE');
  const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
  const totalExpense = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  
  const currentBalance = initialBalance + totalIncome - totalExpense;

  // Filter Logic
  const years = Array.from(new Set(transactions.map(t => t.date.substring(0, 4)))).sort().reverse();
  
  const sortedTransactions = [...transactions]
    .filter(t => {
        const matchesType = filterType === 'ALL' ? true : t.type === filterType;
        const matchesYear = filterYear === 'ALL' ? true : t.date.startsWith(filterYear);
        return matchesType && matchesYear;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Input Handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setAmountStr('');
      setAmountNum(0);
      return;
    }
    const numValue = parseInt(rawValue, 10);
    setAmountNum(numValue);
    setAmountStr(numValue.toLocaleString('id-ID'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description && amountNum > 0 && date) {
      onAddTransaction({
        date,
        description,
        amount: amountNum,
        type,
        category: 'MANUAL'
      });
      // Reset
      setDescription('');
      setAmountStr('');
      setAmountNum(0);
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  // HANDLE EDIT SUBMIT
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
        // SPECIAL CASE: Handling "Modal Awal" (Initial Balance)
        // If it was a 'new' placeholder id, we ADD, otherwise we EDIT
        if (editingItem.id === 'new-initial-balance') {
             onAddTransaction({
                date: editingItem.date,
                description: 'Saldo Awal Kas RT', // Force description
                amount: editingItem.amount,
                type: 'INCOME',
                category: 'INITIAL_BALANCE'
             });
        } else {
             // Normal Edit
             onEditTransaction(editingItem.id, {
                description: editingItem.description,
                amount: editingItem.amount,
                date: editingItem.date
            });
        }
        setEditingItem(null);
    }
  };

  const handleEditInitialBalance = () => {
    if (initialBalanceTransaction) {
        setEditingItem(initialBalanceTransaction);
    } else {
        // Create a placeholder object for editing (which will be Added on save)
        setEditingItem({
            id: 'new-initial-balance',
            date: new Date().toISOString().split('T')[0],
            description: 'Saldo Awal Kas RT',
            amount: 0,
            type: 'INCOME',
            category: 'INITIAL_BALANCE'
        });
    }
  };

  // Helper for styling rows (Full background colors)
  const getRowStyle = (item: CashTransaction) => {
      const isIncome = item.type === 'INCOME';
      const isLoan = item.category.includes('LOAN');
      const isInitial = item.category === 'INITIAL_BALANCE';

      if (isInitial) return {
          rowClass: 'bg-purple-50 border-purple-200',
          iconClass: 'bg-white text-purple-600 shadow-sm',
          icon: <Wallet size={18} />,
          label: 'Modal Awal',
          textClass: 'text-purple-900',
          amountClass: 'text-purple-700'
      };

      if (!isIncome) {
        // EXPENSE
        if (isLoan) {
            return {
                rowClass: 'bg-orange-50 border-orange-200',
                iconClass: 'bg-white text-orange-600 shadow-sm',
                icon: <ArrowDownCircle size={18} />,
                label: 'Pencairan Pinjaman',
                textClass: 'text-orange-900',
                amountClass: 'text-orange-700'
            };
        } else {
            return {
                rowClass: 'bg-red-50 border-red-200',
                iconClass: 'bg-white text-red-600 shadow-sm',
                icon: <ArrowDownCircle size={18} />,
                label: 'Pengeluaran Kas',
                textClass: 'text-red-900',
                amountClass: 'text-red-700'
            };
        }
      }

      // INCOME LOGIC
      if (isLoan) return {
          rowClass: 'bg-blue-50 border-blue-200',
          iconClass: 'bg-white text-blue-600 shadow-sm',
          icon: <Link2 size={18} />,
          label: 'Sumber: Cicilan/Pelunasan',
          textClass: 'text-blue-900',
          amountClass: 'text-blue-700'
      };

      return {
          rowClass: 'bg-green-50 border-green-200',
          iconClass: 'bg-white text-green-600 shadow-sm',
          icon: <Coins size={18} />,
          label: 'Sumber: Kas/Iuran',
          textClass: 'text-green-900',
          amountClass: 'text-green-700'
      };
  };

  // MODAL LOGIC VARIABLES
  const detailTransactions = detailView === 'INCOME' ? incomeTransactions : expenseTransactions;
  const loanRelatedTotal = detailTransactions
    .filter(t => t.category.includes('LOAN'))
    .reduce((acc, t) => acc + t.amount, 0);
  const cashRelatedTotal = detailTransactions
    .filter(t => !t.category.includes('LOAN'))
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Saldo Awal (Editable) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative group transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                   <Wallet size={20} />
                </div>
                <span className="text-xs font-medium text-gray-400">Modal Awal</span>
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(initialBalance)}</div>
                <div className="text-xs text-gray-500 mt-1">Saldo Awal Kas</div>
            </div>
            
            {/* Edit Button for Admin - ALWAYS VISIBLE if ADMIN */}
            {userRole === 'ADMIN' && (
               <button 
                 onClick={handleEditInitialBalance}
                 className="absolute top-3 right-3 px-3 py-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded-full shadow-md transition-all flex items-center gap-1 text-[10px] font-bold z-10"
                 title="Atur Modal Awal"
               >
                  <Edit size={12} /> {initialBalanceTransaction ? 'EDIT' : 'ATUR'}
               </button>
            )}
        </div>

        {/* Card 2: Saldo Akhir */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 text-white shadow-lg flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/10 rounded-lg">
              <Wallet size={20} className="text-emerald-400"/>
            </div>
            <span className="text-xs font-medium text-gray-400">Saldo Akhir</span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{formatCurrency(currentBalance)}</div>
            <div className="text-xs text-gray-400 mt-1">Total Kas Tersedia</div>
          </div>
        </div>

        {/* Card 3: Total Income (CLICKABLE) */}
        <div 
            onClick={() => setDetailView('INCOME')}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
              <ArrowUpCircle size={20} />
            </div>
            <span className="text-[10px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Klik Rincian</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800 group-hover:text-green-700 transition-colors">{formatCurrency(totalIncome)}</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
               (Diluar Saldo Awal)
            </div>
          </div>
        </div>

        {/* Card 4: Total Expense (CLICKABLE) */}
        <div 
            onClick={() => setDetailView('EXPENSE')}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-red-50 rounded-lg text-red-600 group-hover:scale-110 transition-transform">
              <ArrowDownCircle size={20} />
            </div>
            <span className="text-[10px] font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Klik Rincian</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800 group-hover:text-red-700 transition-colors">{formatCurrency(totalExpense)}</div>
            <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
               Termasuk Pencairan Hutang
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Input Form (Admin Only) */}
        {userRole === 'ADMIN' && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                Input Kas Baru (Manual)
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Transaction Type Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setType('INCOME')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                      type === 'INCOME' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ArrowUpCircle size={14} /> Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                      type === 'EXPENSE' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ArrowDownCircle size={14} /> Pengeluaran
                  </button>
                </div>

                <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</label>
                   <input 
                     type="date" 
                     required
                     value={date}
                     onChange={(e) => setDate(e.target.value)}
                     className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>

                <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Keterangan</label>
                   <textarea 
                     required
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     placeholder="Contoh: Iuran Warga..."
                     rows={3}
                     className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                   />
                </div>

                <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Jumlah (Rp)</label>
                   <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">Rp</span>
                      <input 
                        type="text"
                        required
                        value={amountStr}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                   </div>
                </div>

                <button 
                  type="submit"
                  className={`w-full py-2.5 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 ${
                    type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Save size={16} /> Simpan Transaksi
                </button>
              </form>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Transaction List */}
        <div className={`${userRole === 'ADMIN' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             
             {/* Toolbar */}
             <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <h3 className="font-bold text-gray-800">Riwayat Transaksi</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                    <select 
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none"
                    >
                       <option value="ALL">Semua Tahun</option>
                       {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select 
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none"
                    >
                       <option value="ALL">Semua Tipe</option>
                       <option value="INCOME">Pemasukan</option>
                       <option value="EXPENSE">Pengeluaran</option>
                    </select>
                </div>
             </div>

             {/* List */}
             <div className="divide-y divide-gray-100">
                {sortedTransactions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">Belum ada data transaksi.</div>
                ) : (
                  sortedTransactions.map(item => {
                    const style = getRowStyle(item);
                    return (
                        <div key={item.id} className={`p-4 hover:shadow-md transition-all flex items-center justify-between group ${style.rowClass} mb-2 mx-2 rounded-lg`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full mt-1 flex-shrink-0 ${style.iconClass}`}>
                                {style.icon}
                            </div>
                            <div>
                                <div className={`font-bold ${style.textClass}`}>{item.description}</div>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 flex items-center gap-1 bg-white/50 px-1.5 py-0.5 rounded">
                                        <Calendar size={10} /> {item.date}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border bg-white/50 flex items-center gap-1 ${style.rowClass.replace('bg-', 'border-').replace('text-', 'border-')}`}>
                                        {style.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className={`font-mono font-bold text-right text-lg ${style.amountClass}`}>
                                {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                            </div>
                            
                            {userRole === 'ADMIN' && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                        onClick={() => setEditingItem(item)}
                                        className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-white rounded-lg shadow-sm"
                                        title="Edit Transaksi"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    {/* Hide delete for INITIAL_BALANCE to ensure the card always works */}
                                    {item.category !== 'INITIAL_BALANCE' && (
                                        <button 
                                        onClick={() => {
                                            const msg = item.category.includes('LOAN') 
                                                ? 'Peringatan: Transaksi ini terhubung dengan Data Pinjaman. Menghapus ini tidak mengubah data pinjaman (bisa tidak sinkron). Lanjutkan?'
                                                : 'Hapus transaksi ini?';
                                            
                                            if(window.confirm(msg)) onDeleteTransaction(item.id);
                                        }}
                                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-white rounded-lg shadow-sm"
                                        title="Hapus Transaksi"
                                        >
                                        <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        </div>
                    );
                  })
                )}
             </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL (New Feature in CashFlow) */}
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

                                // UNIFIED ROW STYLING Logic (Same as Dashboard Modal)
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

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
           <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95">
              <button 
                onClick={() => setEditingItem(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Edit size={18} className="text-blue-600" />
                {editingItem.category === 'INITIAL_BALANCE' ? 'Atur Modal Awal' : 'Edit Transaksi'}
              </h3>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                 {/* Show category warning if system transaction */}
                 {editingItem.category !== 'MANUAL' && editingItem.category !== 'INITIAL_BALANCE' && (
                     <div className="p-3 bg-yellow-50 text-yellow-700 text-xs rounded-lg border border-yellow-200">
                         Perhatian: Ini adalah transaksi sistem otomatis. Mengubah nilai ini mungkin menyebabkan ketidaksesuaian dengan Data Pinjaman.
                     </div>
                 )}
                 {editingItem.category === 'INITIAL_BALANCE' && (
                     <div className="p-3 bg-purple-50 text-purple-700 text-xs rounded-lg border border-purple-200">
                         Mengatur Modal Awal Kas.
                     </div>
                 )}

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                    <input 
                      type="text" 
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled={editingItem.category === 'INITIAL_BALANCE'} // Lock description for initial balance
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input 
                      type="date" 
                      value={editingItem.date}
                      onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                    <input 
                      type="number" 
                      value={editingItem.amount}
                      onChange={(e) => setEditingItem({...editingItem, amount: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setEditingItem(null)}
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