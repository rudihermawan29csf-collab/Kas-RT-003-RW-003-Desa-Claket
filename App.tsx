import React, { useState } from 'react';
import { INITIAL_LOANS, Loan, LoanStatus, User } from './types';
import { MacOSWindow } from './components/MacOSWindow';
import { Dashboard } from './pages/Dashboard';
import { LoanList } from './pages/LoanList';
import { RtValidation } from './pages/RtValidation';
import { AdminPayment } from './pages/AdminPayment';
import { LoginScreen } from './components/LoginScreen';
import { NasabahView } from './pages/NasabahView';
import { Save, Calendar } from 'lucide-react';

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
  const [currentView, setCurrentView] = useState('dashboard');

  const handleCreateLoan = (name: string, amount: number, date: string) => {
    const newLoan: Loan = {
      id: (Date.now()).toString(), // Simple ID gen
      borrowerName: name,
      amount: amount,
      date: date,
      status: LoanStatus.PENDING
    };
    setLoans([newLoan, ...loans]);
    setCurrentView('loans'); 
  };

  const handleDeleteLoan = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data pinjaman ini?")) {
      setLoans(loans.filter(l => l.id !== id));
    }
  };

  const handleEditLoan = (id: string, updatedData: Partial<Loan>) => {
     setLoans(loans.map(loan => 
        loan.id === id ? { ...loan, ...updatedData } : loan
     ));
  };

  // Generic status updater that can also set specific date fields based on the action
  const handleUpdateStatus = (id: string, newStatus: LoanStatus, date?: string) => {
    setLoans(loans.map(loan => {
      if (loan.id !== id) return loan;

      const updatedLoan = { ...loan, status: newStatus };
      
      // Update specific lifecycle dates based on status transition
      if (newStatus === LoanStatus.APPROVED && date) {
        updatedLoan.approvalDate = date;
      } else if (newStatus === LoanStatus.REJECTED && date) {
        updatedLoan.rejectionDate = date;
      } else if (newStatus === LoanStatus.PAYMENT_VERIFYING && date) {
        updatedLoan.paymentAdminDate = date;
      } else if (newStatus === LoanStatus.PAID && date) {
        updatedLoan.paidDate = date;
      }

      return updatedLoan;
    }));
  };

  const pendingCount = loans.filter(l => l.status === LoanStatus.PENDING).length;
  const verifyingCount = loans.filter(l => l.status === LoanStatus.PAYMENT_VERIFYING).length;

  if (!user) {
    return <LoginScreen onLogin={(loggedInUser) => {
      setUser(loggedInUser);
      // Set default view based on role
      if (loggedInUser.role === 'NASABAH') {
        setCurrentView('nasabah-view');
      } else {
        setCurrentView('dashboard');
      }
    }} />;
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
      {currentView === 'dashboard' && <Dashboard loans={loans} />}
      
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

      {currentView === 'nasabah-view' && user.role === 'NASABAH' && (
        <NasabahView loans={loans} userName={user.name} />
      )}
    </MacOSWindow>
  );
}