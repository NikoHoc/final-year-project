"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, TrendingDown, Filter } from "lucide-react";
import { useExpense } from "@/hooks/useExpense";
import { Expense } from "@/types";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useSession } from "@/contexts/SessionContext";
import { formatRupiah, formatDateFull, getTodayStr, getFirstDayOfMonthStr, formatDateTime } from "@/utils/format";

export default function ExpensesPage() {
  const { expenses, isLoading, fetchExpenses, deleteExpense } = useExpense();
  const { user, isLoadingSession } = useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null); 
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [startDate, setStartDate] = useState(getFirstDayOfMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [activeShortcut, setActiveShortcut] = useState<"bulan_ini" | "semua" | "custom">("bulan_ini");
  
  const endOfToday = `${getTodayStr()}T23:59:59.999Z`;

  useEffect(() => {
    if (!isLoadingSession && user?.depot_id) {
      fetchExpenses(user.depot_id, getFirstDayOfMonthStr(), endOfToday);
    }
  }, [isLoadingSession, user, fetchExpenses, endOfToday]);

  const handleApplyFilter = () => {
    if (!user?.depot_id) return;
    setActiveShortcut("custom");
    const adjustedEndDate = endDate ? `${endDate}T23:59:59.999Z` : "";
    fetchExpenses(user.depot_id, startDate, adjustedEndDate);
  };
  
  const handleFilterShortcut = (type: "bulan_ini" | "semua") => {
    if (!user?.depot_id) return;
    setActiveShortcut(type);

    if (type === "bulan_ini") {
      setStartDate(getFirstDayOfMonthStr());
      setEndDate(getTodayStr());
      fetchExpenses(user.depot_id, getFirstDayOfMonthStr(), endOfToday);
    } else if (type === "semua") {
      setStartDate("");
      setEndDate("");
      fetchExpenses(user.depot_id); 
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (expenseToDelete) {
      try {
        await deleteExpense(expenseToDelete.id);
        setExpenseToDelete(null);
        if (user?.depot_id) fetchExpenses(user.depot_id);
      } catch {
      }
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const query = searchQuery.toLowerCase();
    return (
      expense.item_name.toLowerCase().includes(query) ||
      (expense.note && expense.note.toLowerCase().includes(query))
    );
  });

  if (isLoadingSession) {
    return <div className="p-8 text-center animate-pulse text-gray-400">Memuat Sesi Kasir...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Pengeluaran Operasional</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Catat dan pantau pengeluaran stok serta operasional depot.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button
              onClick={() => handleFilterShortcut("bulan_ini")}
              className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeShortcut === "bulan_ini" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handleFilterShortcut("semua")}
              className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeShortcut === "semua" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Semua
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
            />
            <span className="text-gray-400 font-bold">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
            />
            <button
              onClick={handleApplyFilter}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors shadow-sm flex justify-between items-center gap-2 font-semibold"
              title="Terapkan Filter"
            >
              <Filter size={18} />Tampilkan
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
            <h2 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
              <TrendingDown size={20} className="text-red-500" /> Daftar Pengeluaran
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-semibold">
              {activeShortcut === "semua" 
                ? "Menampilkan semua riwayat settlement yang tercatat." 
                : `Menampilkan data periode: ${startDate ? formatDateFull(startDate) : '-'} s/d ${endDate ? formatDateFull(endDate) : '-'}`
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari item atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium placeholder:font-normal"
              />
            </div>

            <button
              onClick={() => {
                setSelectedExpense(null);
                setIsFormOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 w-full sm:w-auto shrink-0"
            >
              <Plus size={20} />
              Pengeluaran
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">No</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Tanggal</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Nama Item</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Jumlah</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Nominal</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Catatan</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Memuat data...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Belum ada catatan pengeluaran.</td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Tidak ada pengeluaran yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense, index) => (
                  <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatDateTime(expense.expense_date)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{expense.item_name}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block uppercase font-bold">
                        {expense.quantity} {expense.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">{formatRupiah(expense.amount)}</td>
                    <td className="px-6 py-4 text-sm italic">{expense.note || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black uppercase px-2 py-1 rounded-md 
                        ${expense.is_settled === true ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {expense.is_settled === true ? 'SUDAH DIREKAP' : 'BELUM DIREKAP'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => setExpenseToDelete(expense)}
                          className="p-2 text-red-600  hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        depotId={user?.depot_id || 0}
        initialData={selectedExpense}
        onSuccess={() => {
          if (user?.depot_id) fetchExpenses(user.depot_id);
        }}
      />

      <ConfirmModal
        isOpen={expenseToDelete !== null}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Catatan?"
        message={`Apakah Anda yakin ingin menghapus catatan pembelian "${expenseToDelete?.item_name}"? Tindakan ini tidak dapat dibatalkan.`}
        type="danger"
      />
    </div>
  );
}