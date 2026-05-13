"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import {
  Wallet,
  CheckCircle,
  Receipt,
  TrendingDown,
  Loader2,
  CircleDollarSign,
  Coins,
} from "lucide-react";
import { useSettlement } from "@/hooks/useSettlement";
import { User } from "@/types";
import { formatDate, formatRupiah } from "@/utils/format";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function SettlementPage() {
  const {
    todayData,
    isLoading,
    fetchTodaySummary,
    processSettlement,
    isProcessing,
  } = useSettlement();
  const [depotId, setDepotId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const loadData = useCallback(async () => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const user: User = JSON.parse(userCookie);
      if (user.depot_id) {
        setDepotId(user.depot_id);
        await fetchTodaySummary(user.depot_id);
      }
    }
  }, [fetchTodaySummary]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleProcessSettlement = async () => {
    if (depotId && todayData?.summary) {
      try {
        await processSettlement(depotId, todayData.summary);
        setIsConfirmOpen(false);
        loadData();
      } catch {}
    }
  };

  const { summary, transactions, expenses } = todayData || {
    summary: null,
    transactions: [],
    expenses: [],
  };

  const hasTransactions = transactions.length > 0;
  const hasExpenses = expenses.length > 0;
  const hasDataToSettle = hasTransactions || hasExpenses;

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Rekap Harian (Settlement)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Rekap transaksi dan pengeluaran operasional
          </p>
        </div>
        <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={!hasDataToSettle || isProcessing}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 w-full sm:w-auto"
        >
          <CheckCircle size={20} />
          {isProcessing ? "Memproses..." : "Proses Settlement"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-gray-200">
          <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
          <p className="text-gray-500 font-medium">
            Menghitung data hari ini...
          </p>
        </div>
      ) : !hasDataToSettle ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Semua Sudah Tercatat!
          </h2>
          <p className="text-gray-500">
            Tidak ada transaksi atau pengeluaran baru yang perlu di-settle saat
            ini.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
              <div className="flex items-center gap-2 relative z-10">
                <Coins size={24} className="text-green-600" />
                <span className="text-lg font-bold text-gray-400 uppercase">
                  Ringkasan Transaksi
                </span>
              </div>
              <div className="text-md font-black text-gray-800 mt-2 italic uppercase border-b border-gray-400 pb-2 relative z-10">
                Grand total: {formatRupiah(summary?.grand_total || 0)}
              </div>
              <div className="text-sm font-black text-blue-600 mt-2 italic relative z-10">
                Subtotal: {formatRupiah(summary?.subtotal_amount || 0)}
              </div>
              <div className="text-sm font-bold text-red-600 mt-1 italic relative z-10">
                Pajak: {formatRupiah(summary?.tax_amount || 0)}
              </div>
              <div 
                className="absolute bottom-4 right-4 w-12 h-12 bg-blue-50 rounded-full border border-blue-100 flex flex-col items-center justify-center shadow-sm z-0"
                title="Total Transaksi Hari Ini"
              >
                <span className="text-[9px] text-blue-400 font-bold leading-none mb-0.5 uppercase">TRX</span>
                <span className="text-sm font-black text-blue-600 leading-none">
                  {summary?.total_transactions || 0}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-2">
                <CircleDollarSign size={24} className="text-green-600" />
                <span className="text-lg font-bold text-gray-400 uppercase">
                  Metode Pemasukan
                </span>
              </div>
              <div className="flex justify-between items-start mt-2 border-b border-gray-400 pb-2 italic">
                <div className="flex flex-col ">
                  <span className="font-black text-md uppercase">Tunai</span>
                  <div className="text-sm font-semibold">Total: {formatRupiah(summary?.cash_income || 0)}</div>
                  <div className="text-sm text-orange-500 font-semibold">Kembalian: -{formatRupiah(summary?.total_change_amount || 0)}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-400 uppercase">Tunai Bersih</span>
                  <div className="text-md font-black text-blue-600">
                    {formatRupiah(summary?.net_cash_income || 0)}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center italic">
                <span className="font-black text-md uppercase">Non-Tunai</span>
                <span className="text-md font-black text-blue-600">{formatRupiah(summary?.non_cash_income || 0)}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-2">
                <TrendingDown size={24} className="text-red-500" />
                <span className="text-lg font-bold text-gray-400 uppercase">
                  Pengeluaran Kas
                </span>
              </div>
              <div className="text-xl font-black text-red-600 mt-1">
                {formatRupiah(summary?.total_expenses || 0)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Dari {expenses?.length || 0} catatan operasional
              </div>
            </div>

            <div className="bg-green-600 p-6 rounded-3xl shadow-lg shadow-green-200 flex flex-col text-white">
              <div className="flex items-center gap-2 opacity-80">
                <Wallet size={24} />
                <span className="text-lg font-bold uppercase">
                  Pendapatan Bersih
                </span>
              </div>
              <div className="text-3xl font-black mt-1">
                {formatRupiah(summary?.net_income || 0)}
              </div>
              <div className="text-xs opacity-80 mt-1">
                # Subtotal dikurangi Pengeluaran
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-6 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <Receipt size={20} className="text-blue-500" />
                <h3 className="font-bold text-gray-800">Daftar Transaksi</h3>
              </div>
              <div className="overflow-x-auto max-h-125 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white sticky top-0 border-b border-gray-100 shadow-sm z-10 uppercase font-black text-gray-400">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Waktu / Pelanggan</th>
                      <th className="px-4 py-3">Tipe / Metode</th>
                      <th className="px-4 py-3 text-right">Grand Total</th>
                      <th className="px-4 py-3 text-right">Diterima / Kembali</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {hasTransactions ? (
                      transactions.map((tx, idx) => {
                        return (
                          <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-800 truncate max-w-30">
                                {tx.customer_name || "Pelanggan"}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDate(tx.created_at)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="capitalize font-medium text-gray-600 block">
                                {tx.type}
                              </span>
                              <span className="text-xs text-blue-500 font-bold uppercase">
                                {tx.payment_method || "Split"}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-800 text-right">
                              {formatRupiah(tx.grand_total)}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="font-bold text-gray-700">{formatRupiah(tx.total_paid || 0)}</div>
                                <div className="text-xs text-orange-500 font-semibold">Kembalian: {tx.change_amount ? formatRupiah(tx.change_amount || 0) : '-'}</div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-400 italic font-medium">
                          Tidak ada transaksi yang ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <TrendingDown size={20} className="text-red-500" />
                <h3 className="font-bold text-gray-800">Daftar Pengeluaran</h3>
              </div>
              <div className="overflow-x-auto max-h-125 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white sticky top-0 shadow-sm z-10 uppercase text-gray-400 font-black">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expenses.length > 0 ? (
                      expenses.map((exp, idx) => (
                        <tr
                          key={exp.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-gray-800">
                              {exp.item_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDate(exp.expense_date)}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-600">
                            {exp.quantity} {exp.unit}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-red-600">
                            {formatRupiah(exp.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-12 text-center text-gray-400 italic"
                        >
                          Tidak ada pengeluaran
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleProcessSettlement}
        title="Konfirmasi Tutup Kasir"
        message={`Apakah Anda yakin ingin melakukan proses Settlement? Aksi ini akan mengunci ${transactions?.length} transaksi dan ${expenses?.length} pengeluaran secara permanen.`}
        type="warning"
        confirmText="Ya, Tutup Kasir"
      />
    </div>
  );
}
