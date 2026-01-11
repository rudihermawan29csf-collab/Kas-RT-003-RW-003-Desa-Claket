export enum LoanStatus {
  PENDING = 'Menunggu Validasi RT',
  APPROVED = 'Belum Lunas (Aktif)',
  PAYMENT_VERIFYING = 'Verifikasi Pembayaran (RT)',
  PAID = 'Lunas',
  REJECTED = 'Ditolak'
}

export type Role = 'ADMIN' | 'RT' | 'NASABAH';

export interface User {
  name: string;
  role: Role;
  avatar?: string;
}

export interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  date: string; // Tanggal Pengajuan
  
  // Lifecycle Dates
  approvalDate?: string;      // Tanggal RT Setuju
  rejectionDate?: string;     // Tanggal RT Tolak
  paymentAdminDate?: string;  // Tanggal Admin Terima Uang
  paidDate?: string;          // Tanggal RT Validasi Lunas

  status: LoanStatus;
}

// Cash Flow Types
export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionCategory = 'MANUAL' | 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'INITIAL_BALANCE';

export interface CashTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  relatedLoanId?: string; // To prevent duplicates and link back
}

export const INTEREST_RATE = 0.20; // 20%

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateInterest = (amount: number) => amount * INTEREST_RATE;
export const calculateTotal = (amount: number) => amount + calculateInterest(amount);

// Mock Initial Data for Loans
export const INITIAL_LOANS: Loan[] = [
  { id: '1', borrowerName: 'Budi Santoso', amount: 1000000, date: '2023-10-01', approvalDate: '2023-10-02', status: LoanStatus.APPROVED },
  { id: '2', borrowerName: 'Siti Aminah', amount: 500000, date: '2023-10-05', approvalDate: '2023-10-06', paymentAdminDate: '2023-10-20', status: LoanStatus.PAYMENT_VERIFYING },
  { id: '3', borrowerName: 'Joko Widodo', amount: 2000000, date: '2023-10-10', status: LoanStatus.PENDING },
  { id: '4', borrowerName: 'Rina Wati', amount: 750000, date: '2023-09-15', approvalDate: '2023-09-16', paymentAdminDate: '2023-09-30', paidDate: '2023-10-01', status: LoanStatus.PAID },
  { id: '5', borrowerName: 'Ahmad Dahlan', amount: 1500000, date: '2023-10-12', status: LoanStatus.PENDING },
];

// Mock Initial Data for Cash Flow
export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [
  { id: '1', date: '2023-09-01', description: 'Saldo Awal Kas RT', amount: 10000000, type: 'INCOME', category: 'INITIAL_BALANCE' },
  { id: '2', date: '2023-09-05', description: 'Iuran Kebersihan Warga', amount: 350000, type: 'INCOME', category: 'MANUAL' },
  { id: '3', date: '2023-09-10', description: 'Pembelian Lampu Jalan (3 pcs)', amount: 150000, type: 'EXPENSE', category: 'MANUAL' },
  // Historical Loan Transactions (Matching INITIAL_LOANS)
  { id: 'L1', date: '2023-10-02', description: 'Pencairan Pinjaman: Budi Santoso', amount: 1000000, type: 'EXPENSE', category: 'LOAN_DISBURSEMENT', relatedLoanId: '1' },
  { id: 'L2', date: '2023-10-06', description: 'Pencairan Pinjaman: Siti Aminah', amount: 500000, type: 'EXPENSE', category: 'LOAN_DISBURSEMENT', relatedLoanId: '2' },
  { id: 'L4_OUT', date: '2023-09-16', description: 'Pencairan Pinjaman: Rina Wati', amount: 750000, type: 'EXPENSE', category: 'LOAN_DISBURSEMENT', relatedLoanId: '4' },
  { id: 'L4_IN', date: '2023-09-30', description: 'Pelunasan Pinjaman: Rina Wati', amount: 900000, type: 'INCOME', category: 'LOAN_REPAYMENT', relatedLoanId: '4' },
];