"use client";

import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { useExpense } from "@/hooks/useExpense";
import { Expense } from "@/types";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useSession } from "@/contexts/SessionContext";
import { formatDateFull, getTodayStr, getFirstDayOfMonthStr } from "@/utils/format";
import ExpenseTable from "@/components/expenses/ExpenseTable";

export default function OwnerExpensesPage() {
  const { expenses, isLoading, fetchExpenses, deleteExpense } = useExpense();
  const { user, isLoadingSession } = useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null); 
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

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

  if (isLoadingSession) {
    return <div className="p-8 text-center animate-pulse text-gray-400">Memuat Sesi Owner...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Manajemen Pembelian Barang Depot</h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold">
            {activeShortcut === "semua" 
              ? "Menampilkan semua riwayat settlement yang tercatat." 
              : `Menampilkan data periode: ${startDate ? formatDateFull(startDate) : '-'} s/d ${endDate ? formatDateFull(endDate) : '-'}`
            }
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

      <ExpenseTable
        data={expenses}
        isLoading={isLoading}
        startDate={startDate}
        endDate={endDate}
        onEdit={(expense) => {
          setSelectedExpense(expense);
          setIsFormOpen(true);
        }}
        onDelete={(expense) => setExpenseToDelete(expense)}
        onCreate={() => {
          setSelectedExpense(null);
          setIsFormOpen(true);
        }}
      />

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