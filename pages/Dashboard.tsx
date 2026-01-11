import React from 'react';
import { Loan, LoanStatus, calculateTotal, calculateInterest } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Users, AlertCircle, Banknote } from 'lucide-react';

interface DashboardProps {
  loans: Loan[];
}

export const Dashboard: React.FC<DashboardProps> = ({ loans }) => {
  const activeLoans = loans.filter(l => l.status === LoanStatus.APPROVED);
  const pendingLoans = loans.filter(l => l.status === LoanStatus.PENDING);
  const paidLoans = loans.filter(l => l.status === LoanStatus.PAID);

  const totalLoaned = loans
    .filter(l => l.status === LoanStatus.APPROVED || l.status === LoanStatus.PAID)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalInterestPotential = loans
    .filter(l => l.status === LoanStatus.APPROVED || l.status === LoanStatus.PAID)
    .reduce((acc, curr) => acc + calculateInterest(curr.amount), 0);

  const formatIDR = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
    return val.toString();
  };

  const statusData = [
    { name: 'Aktif', value: activeLoans.length, color: '#007AFF' },
    { name: 'Lunas', value: paidLoans.length, color: '#34C759' },
    { name: 'Pending', value: pendingLoans.length, color: '#FF9F0A' },
  ];

  const recentActivity = loans
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <div className="bg-white/80 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Banknote size={20} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+20% Bunga</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalLoaned)}</div>
            <div className="text-xs text-gray-500">Total Pinjaman Disalurkan</div>
          </div>
        </div>

        <div className="bg-white/80 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalInterestPotential)}</div>
            <div className="text-xs text-gray-500">Potensi Pendapatan Bunga</div>
          </div>
        </div>

        <div className="bg-white/80 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{activeLoans.length}</div>
            <div className="text-xs text-gray-500">Pinjaman Aktif (Belum Lunas)</div>
          </div>
        </div>

        <div className="bg-white/80 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <AlertCircle size={20} />
            </div>
            {pendingLoans.length > 0 && <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{pendingLoans.length}</div>
            <div className="text-xs text-gray-500">Menunggu Validasi RT</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white/80 p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-6">Status Pinjaman Warga</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} width={80}/>
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="value" barSize={32} radius={[0, 4, 4, 0]}>
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
           <h3 className="text-sm font-semibold text-gray-700 mb-4">Aktivitas Terbaru</h3>
           <div className="space-y-4">
             {recentActivity.map((loan) => (
               <div key={loan.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                 <div>
                   <div className="text-sm font-medium text-gray-800">{loan.borrowerName}</div>
                   <div className="text-xs text-gray-500">{loan.date}</div>
                 </div>
                 <div className={`px-2 py-1 rounded text-xs font-medium 
                    ${loan.status === LoanStatus.APPROVED ? 'bg-blue-50 text-blue-600' : 
                      loan.status === LoanStatus.PAID ? 'bg-green-50 text-green-600' :
                      loan.status === LoanStatus.PENDING ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                    }`}>
                   {loan.status}
                 </div>
               </div>
             ))}
             {recentActivity.length === 0 && <div className="text-xs text-gray-400 text-center py-4">Belum ada data</div>}
           </div>
        </div>
      </div>
    </div>
  );
};