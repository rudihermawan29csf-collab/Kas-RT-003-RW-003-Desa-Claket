import React, { useState, useEffect } from 'react';
import { INITIAL_LOANS, INITIAL_CASH_TRANSACTIONS, Loan, LoanStatus, User, CashTransaction, calculateTotal } from './types';
import { MacOSWindow } from './components/MacOSWindow';
import { Dashboard } from './pages/Dashboard';
import { LoanList } from './pages/LoanList';
import { RtValidation } from './pages/RtValidation';
import { AdminPayment } from './pages/AdminPayment';
import { LoginScreen } from './components/LoginScreen';
import { NasabahView } from './pages/NasabahView';
import { CashFlow } from './pages/CashFlow';
import { Save, Calendar, RefreshCcw } from 'lucide-react';

// --- CONFIGURATION ---
// APP SCRIPT URL CONNECTED
const API_URL = "https://script.google.com/macros/s/AKfycbyirkbuhmVvS7Kbpq5q6H-uRDf_A9rE-ibTx8CXZ1cJjPDIGOI3GpeGz1DwMU7paDlztw/exec";

// Sub-component for Loan Request with Auto-Formatting
const LoanRequest: React.FC<{ onSubmit: (name: string, amount: number, date: string) => void }> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState(''); // Display string (e.g., "1.000.000")
  const [amountNum, setAmountNum] = useState(0);  // Actual number
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digit characters
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setAmountStr('');
      setAmountNum(0);
      return;
    }
    const numValue = parseInt(rawValue, 10);
    setAmountNum(numValue);
    // Format with dots
    setAmountStr(numValue.toLocaleString('id-ID'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && amountNum > 0 && date) {
      onSubmit(name, amountNum, date);
      setName('');
      setAmountStr('');
      setAmountNum(0);
      setDate(new Date().toISOString().split('T')[0]);
      alert('Pengajuan berhasil ditambahkan ke sistem! Menunggu validasi RT.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-in slide-in-from-bottom-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Input Pinjaman Baru</h2>
        <p className="text-gray-500 mb-8">Admin memasukkan data pengajuan warga.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Nasabah</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pengajuan</label>
             <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pinjaman (IDR)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
              <input 
                type="text" 
                required
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-lg"
                placeholder="0"
                value={amountStr}
                onChange={handleAmountChange}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">* Bunga 20% akan ditambahkan pada total pengembalian.</p>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Simpan Data
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(INITIAL_CASH_TRANSACTIONS);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // --- API HANDLER ---
  const sendToApi = (action: string, payload: any) => {
    if (!API_URL) return;
    
    // We use 'no-cors' mode for simple posting to Google Scripts
    // This allows data to be sent without complex CORS setup on the server side for POST requests
    fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
    }).catch(err => console.error("API Error", err));
  };

  const fetchData = async () => {
      if (!API_URL) return;
      setLoading(true);
      try {
          const res = await fetch(API_URL);
          const data = await res.json();
          // Only update if we get valid arrays back, otherwise keep initial/local state or handle empty
          if (data.loans && Array.isArray(data.loans)) {
             setLoans(data.loans);
          }
          if (data.cashTransactions && Array.isArray(data.cashTransactions)) {
             setCashTransactions(data.cashTransactions);
          }
      } catch (e) {
          console.error("Failed to fetch data from Google Sheets", e);
          // Optional: alert("Gagal mengambil data terbaru dari server.");
      } finally {
          setLoading(false);
      }
  };

  // Initial Load
  useEffect(() => {
      if(API_URL) fetchData();
  }, []);


  // LOAN HANDLERS
  const handleCreateLoan = (name: string, amount: number, date: string) => {
    const newLoan: Loan = {
      id: (Date.now()).toString(), 
      borrowerName: name,
      amount: amount,
      date: date,
      status: LoanStatus.PENDING
    };
    setLoans([newLoan, ...loans]);
    sendToApi('CREATE_LOAN', newLoan);
    setCurrentView('loans'); 
  };

  const handleDeleteLoan = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data pinjaman ini?")) {
      setLoans(loans.filter(l => l.id !== id));
      sendToApi('DELETE_LOAN', id);
    }
  };

  const handleEditLoan = (id: string, updatedData: Partial<Loan>) => {
     setLoans(loans.map(loan => 
        loan.id === id ? { ...loan, ...updatedData } : loan
     ));
     sendToApi('UPDATE_LOAN', { id, ...updatedData });
  };

  const handleUpdateStatus = (id: string, newStatus: LoanStatus, date?: string) => {
    // 1. Update Loan Status
    let updatedLoanData: Loan | null = null;
    let updatePayload: any = { id, status: newStatus };

    setLoans(prevLoans => prevLoans.map(loan => {
      if (loan.id !== id) return loan;

      const updatedLoan = { ...loan, status: newStatus };
      
      if (newStatus === LoanStatus.APPROVED && date) {
        updatedLoan.approvalDate = date;
        updatePayload.approvalDate = date;
      } else if (newStatus === LoanStatus.REJECTED && date) {
        updatedLoan.rejectionDate = date;
        updatePayload.rejectionDate = date;
      } else if (newStatus === LoanStatus.PAYMENT_VERIFYING && date) {
        updatedLoan.paymentAdminDate = date;
        updatePayload.paymentAdminDate = date;
      } else if (newStatus === LoanStatus.PAID && date) {
        updatedLoan.paidDate = date;
        updatePayload.paidDate = date;
      }

      updatedLoanData = updatedLoan; // Capture for cash flow logic
      return updatedLoan;
    }));

    sendToApi('UPDATE_LOAN', updatePayload);

    // 2. Automate Cash Flow (Linkage)
    if (updatedLoanData && date) {
        const loan = updatedLoanData as Loan;
        
        // CASE A: Loan Approved (Pencairan) -> Expense
        if (newStatus === LoanStatus.APPROVED) {
            const exists = cashTransactions.some(t => t.relatedLoanId === loan.id && t.category === 'LOAN_DISBURSEMENT');
            if (!exists) {
                const newTx: CashTransaction = {
                    id: `sys-out-${Date.now()}`,
                    date: date,
                    description: `Pencairan Pinjaman: ${loan.borrowerName}`,
                    amount: loan.amount,
                    type: 'EXPENSE',
                    category: 'LOAN_DISBURSEMENT',
                    relatedLoanId: loan.id
                };
                setCashTransactions(prev => [newTx, ...prev]);
                sendToApi('CREATE_TRANSACTION', newTx);
            }
        }

        // CASE B: Payment Received by Admin (Pelunasan) -> Income
        if (newStatus === LoanStatus.PAYMENT_VERIFYING) {
            const exists = cashTransactions.some(t => t.relatedLoanId === loan.id && t.category === 'LOAN_REPAYMENT');
            if (!exists) {
                const totalRepayment = calculateTotal(loan.amount);
                const newTx: CashTransaction = {
                    id: `sys-in-${Date.now()}`,
                    date: date,
                    description: `Pelunasan Pinjaman: ${loan.borrowerName}`,
                    amount: totalRepayment,
                    type: 'INCOME',
                    category: 'LOAN_REPAYMENT',
                    relatedLoanId: loan.id
                };
                setCashTransactions(prev => [newTx, ...prev]);
                sendToApi('CREATE_TRANSACTION', newTx);
            }
        }
    }
  };

  // CASH FLOW HANDLERS
  const handleAddCashTransaction = (data: Omit<CashTransaction, 'id'>) => {
     const newTransaction: CashTransaction = {
       id: `cash-${Date.now()}`,
       category: 'MANUAL', // Default, but can be overridden by ...data
       ...data 
     };
     setCashTransactions([newTransaction, ...cashTransactions]);
     sendToApi('CREATE_TRANSACTION', newTransaction);
  };

  const handleDeleteCashTransaction = (id: string) => {
     setCashTransactions(cashTransactions.filter(t => t.id !== id));
     sendToApi('DELETE_TRANSACTION', id);
  };

  const handleEditCashTransaction = (id: string, updatedData: Partial<CashTransaction>) => {
    setCashTransactions(prev => prev.map(t => 
       t.id === id ? { ...t, ...updatedData } : t
    ));
    sendToApi('UPDATE_TRANSACTION', { id, ...updatedData });
  };


  const pendingCount = loans.filter(l => l.status === LoanStatus.PENDING).length;
  const verifyingCount = loans.filter(l => l.status === LoanStatus.PAYMENT_VERIFYING).length;

  if (!user) {
    return <LoginScreen 
        onLogin={(loggedInUser) => {
            setUser(loggedInUser);
            if (loggedInUser.role === 'NASABAH') {
                setCurrentView('nasabah-dashboard');
            } else {
                setCurrentView('dashboard');
            }
        }} 
        loans={loans} 
        cashTransactions={cashTransactions}
    />;
  }

  return (
    <MacOSWindow 
      currentView={currentView} 
      setCurrentView={setCurrentView}
      pendingCount={pendingCount}
      verifyingCount={verifyingCount}
      user={user}
      onLogout={() => setUser(null)}
    >
      {loading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-50">
              <div className="w-1/3 h-full bg-blue-600 animate-slide"></div>
          </div>
      )}
      
      {currentView === 'dashboard' && <Dashboard loans={loans} cashTransactions={cashTransactions} />}
      
      {currentView === 'loans' && (
        <LoanList 
          loans={loans} 
          userRole={user.role} 
          onDelete={handleDeleteLoan} 
          onEdit={handleEditLoan}
        />
      )}
      
      {currentView === 'request' && user.role === 'ADMIN' && (
        <LoanRequest onSubmit={handleCreateLoan} />
      )}
      
      {currentView === 'rt-validation' && user.role === 'RT' && (
        <RtValidation loans={loans} onUpdateStatus={handleUpdateStatus} />
      )}
      
      {currentView === 'payment' && user.role === 'ADMIN' && (
        <AdminPayment loans={loans} onUpdateStatus={handleUpdateStatus} />
      )}

      {/* NASABAH VIEWS */}
      
      {/* 1. Dashboard Tab: Now uses the Global Dashboard (Same as Admin) */}
      {currentView === 'nasabah-dashboard' && user.role === 'NASABAH' && (
         <Dashboard loans={loans} cashTransactions={cashTransactions} />
      )}

      {/* 2. History Tab: Uses Personal Loan History */}
      {currentView === 'nasabah-history' && user.role === 'NASABAH' && (
        <NasabahView 
          loans={loans} 
          userName={user.name} 
          viewMode='history'
        />
      )}

      {currentView === 'cash-flow' && (
        <CashFlow 
          transactions={cashTransactions} 
          userRole={user.role}
          onAddTransaction={handleAddCashTransaction}
          onDeleteTransaction={handleDeleteCashTransaction}
          onEditTransaction={handleEditCashTransaction}
        />
      )}
    </MacOSWindow>
  );
}