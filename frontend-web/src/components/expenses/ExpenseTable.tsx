"use client";

import { useState, useMemo } from "react";
import { Search, Pencil, Trash2, TrendingDown, Activity, CheckCircle2, Clock, Plus } from "lucide-react";
import { Expense } from "@/types";
import { formatRupiah, formatDateTime } from "@/utils/format";

interface Props {
  data: Expense[];
  isLoading: boolean;
  startDate: string;
  endDate: string;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  onCreate?: () => void;
}

export default function ExpenseTable({ data, isLoading, startDate, endDate, onEdit, onDelete, onCreate }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return data.filter(e => e.item_name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data, searchQuery]);

  const { totalAmount, averageAmount } = useMemo(() => {
    const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diffDays = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
    const safeDays = diffDays > 0 ? diffDays : 1;
    return { totalAmount: total, averageAmount: total / safeDays };
  }, [filtered, startDate, endDate]);

  const hasActions = !!onEdit || !!onDelete;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-50">
            <TrendingDown size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Pengeluaran</p>
            <p className="text-xl font-black text-gray-800 mt-0.5">{formatRupiah(totalAmount)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-50">
            <Activity size={24} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Rata-rata Harian</p>
            <p className="text-xl font-black text-gray-800 mt-0.5">{formatRupiah(Math.round(averageAmount))}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-800">Riwayat Pengeluaran</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Daftar catatan operasional pada periode ini.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama item..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium"
              />
            </div>
            {onCreate && (
              <button
                onClick={onCreate}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap h-10.5"
              >
                <Plus size={16} /> Pembelian
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-125custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-center">No</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Nama Item</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Total Biaya</th>
                <th className="px-6 py-4">Catatan</th>
                <th className="px-6 py-4 text-center">Status</th>
                {hasActions && <th className="px-6 py-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={hasActions ? 7 : 6} className="px-6 py-12 text-center text-gray-400 font-medium">Memuat data pengeluaran...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={hasActions ? 7 : 6} className="px-6 py-12 text-center text-gray-400 italic font-medium">Tidak ada data untuk ditampilkan.</td></tr>
              ) : (
                filtered.map((expense, index) => (
                  <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800 text-center">{index+1}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{formatDateTime(expense.expense_date)}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{expense.item_name}</td>
                    <td className="px-6 py-4 font-bold text-gray-600">{expense.quantity} {expense.unit}</td>
                    <td className="px-6 py-4 font-black text-red-500">{formatRupiah(expense.amount)}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium max-w-37.5">{expense.note || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      {expense.is_settled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-black uppercase tracking-wider">
                          <CheckCircle2 size={12} /> Direkap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-wider">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    {hasActions && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {onEdit && (
                            <button 
                              onClick={() => onEdit(expense)} 
                              disabled={expense.is_settled}
                              className={`p-2 rounded-xl transition-all ${expense.is_settled ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                            >
                              <Pencil size={18} />
                            </button>
                          )}
                          {onDelete && (
                            <button 
                              onClick={() => onDelete(expense)} 
                              disabled={expense.is_settled}
                              className={`p-2 rounded-xl transition-all ${expense.is_settled ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}