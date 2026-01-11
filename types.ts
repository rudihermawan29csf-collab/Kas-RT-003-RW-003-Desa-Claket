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

// Mock Initial Data
export const INITIAL_LOANS: Loan[] = [
  { id: '1', borrowerName: 'Budi Santoso', amount: 1000000, date: '2023-10-01', approvalDate: '2023-10-02', status: LoanStatus.APPROVED },
  { id: '2', borrowerName: 'Siti Aminah', amount: 500000, date: '2023-10-05', approvalDate: '2023-10-06', paymentAdminDate: '2023-10-20', status: LoanStatus.PAYMENT_VERIFYING },
  { id: '3', borrowerName: 'Joko Widodo', amount: 2000000, date: '2023-10-10', status: LoanStatus.PENDING },
  { id: '4', borrowerName: 'Rina Wati', amount: 750000, date: '2023-09-15', approvalDate: '2023-09-16', paymentAdminDate: '2023-09-30', paidDate: '2023-10-01', status: LoanStatus.PAID },
  { id: '5', borrowerName: 'Ahmad Dahlan', amount: 1500000, date: '2023-10-12', status: LoanStatus.PENDING },
];