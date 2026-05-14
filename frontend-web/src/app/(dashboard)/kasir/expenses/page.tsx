"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useExpense } from "@/hooks/useExpense";
import { Expense, User } from "@/types";
import { formatRupiah, formatDate } from "@/utils/format";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ExpensesPage() {
  const { expenses, isLoading, fetchExpenses, deleteExpense } = useExpense();
  const [depotId, setDepotId] = useState<number | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const user: User = JSON.parse(userCookie);
      if (user.depot_id) {
        setDepotId(user.depot_id);
        await fetchExpenses(user.depot_id);
      }
    }
  }, [fetchExpenses]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (expenseToDelete) {
      try {
        await deleteExpense(expenseToDelete.id);
        setExpenseToDelete(null);
        if (depotId) fetchExpenses(depotId);
      } catch {
        // Error dihandle oleh hook
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengeluaran Operasional</h1>
          <p className="text-gray-500 text-sm mt-1">
            Catat dan pantau pengeluaran stok serta operasional depot.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
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
            Catat Pengeluaran
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
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
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{formatDate(expense.expense_date)}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{expense.item_name}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block uppercase font-bold">
                        {expense.quantity} {expense.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">{formatRupiah(expense.amount)}</td>
                    <td className="px-6 py-4 italic">{expense.note || "-"}</td>
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
        depotId={depotId}
        initialData={selectedExpense}
        onSuccess={loadData}
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