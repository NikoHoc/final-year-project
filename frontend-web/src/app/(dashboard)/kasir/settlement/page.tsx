"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import {
  Wallet,
  CheckCircle,
  Receipt,
  TrendingDown,
  Loader2,
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

  const cashIncome = summary?.payment_methods?.find(
    (m) => m.method_name.toLowerCase().includes("cash") || m.method_name.toLowerCase().includes("tunai")
  )?.total_net_amount || 0;

  const nonCashIncome = summary?.payment_methods?.filter(
    (m) => !(m.method_name.toLowerCase().includes("cash") || m.method_name.toLowerCase().includes("tunai"))
  ).reduce((sum, m) => sum + m.total_net_amount, 0) || 0;

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
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Receipt size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Volume Penjualan</span>
                <div className="text-xl font-black text-gray-800">{summary?.total_transactions || 0} Transaksi</div>
                <div className="text-xs text-gray-500 mt-1 italic">
                  # Transaksi Onsite - Takeaway - Online
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                <Coins size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-gray-400 uppercase block">
                  Ringkasan Transaksi
                </span>
                <div className="text-xl font-black text-gray-800 mt-1">
                  {formatRupiah(summary?.grand_total || 0)}
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 text-[10px] sm:text-xs font-bold italic uppercase">
                  <span className="text-green-500">
                    SubTotal: {formatRupiah(summary?.subtotal_amount || 0)}
                  </span>
                  <span className="text-blue-500">
                    Pajak: {formatRupiah(summary?.tax_amount || 0)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <TrendingDown size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Total Pengeluaran</span>
                <div className="text-xl font-black text-red-600">{formatRupiah(summary?.total_expenses || 0)}</div>
                <div className="text-xs text-gray-500 mt-1 italic">
                  Dari {expenses?.length || 0} catatan operasional
                </div>
              </div>
            </div>
            <div className="bg-green-600 p-6 rounded-3xl shadow-lg shadow-green-100 flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase opacity-80">Estimasi Bersih</span>
                <div className="text-xl font-black">{formatRupiah(summary?.net_income || 0)}</div>
                <div className="text-xs mt-1 italic">
                  # Subtotal dikurangi Pengeluaran
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-bold text-gray-800">Breakdown Pemasukan</span>
                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs justify-end">
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg border border-green-100 font-semibold">
                    <span>Tunai:</span>
                    <span>{formatRupiah(cashIncome)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1.5 rounded-lg border border-purple-100 font-semibold">
                    <span>Digital:</span>
                    <span>{formatRupiah(nonCashIncome)}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 ml-1 shadow-sm">
                    <span className="font-bold">TOTAL:</span>
                    <span className="text-sm font-black">{formatRupiah(summary?.grand_total || 0)}</span>
                  </div>
                </div>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase font-black">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-6 py-4">Metode Pembayaran</th>
                    <th className="px-6 py-4 text-center">Jml Transaksi</th>
                    <th className="px-6 py-4 text-right">Total Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summary?.payment_methods?.map((pm, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-gray-700">{pm.method_name}</td>
                      <td className="px-6 py-4 text-center font-medium text-gray-500">{pm.transaction_count}</td>
                      <td className="px-6 py-4 text-right font-black text-gray-800">{formatRupiah(pm.total_net_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-5 border-b border-gray-50 bg-gray-50/50 font-bold text-gray-800">
                Daftar Pengeluaran
              </div>
              <div className="overflow-y-auto max-h-75">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white sticky top-0 border-b border-gray-100 shadow-sm z-10 uppercase font-black text-gray-400">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {hasExpenses ? (
                      expenses.map((exp, idx) => (
                        <tr key={exp.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-4">
                            <div className="font-bold text-gray-800">{exp.item_name}</div>
                            <div className="text-[10px] text-gray-400">{formatDate(exp.expense_date)}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-600">
                            {exp.quantity} {exp.unit}
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-red-600">{formatRupiah(exp.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-gray-400 italic font-medium">
                          Tidak ada transaksi yang ditemukan.
                        </td>
                      </tr>
                    )}
                    
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Log Transaksi Hari Ini</h3>
              {/* <span className="text-xs font-bold text-gray-400 uppercase">Geser untuk detail &rarr;</span> */}
            </div>
            <div className="overflow-x-auto max-h-150">
              <table className="w-full text-left text-sm">
                <thead className="bg-white sticky top-0 border-b border-gray-100 shadow-sm z-10 uppercase font-black text-gray-400">
                  <tr>
                    <th className="px-4 py-3 w-10">No</th>
                    <th className="px-4 py-3">Waktu / Pelanggan</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Metode</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-right">Pajak</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {hasTransactions ? (
                    transactions.map((tx, idx) => {
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-gray-800">{tx.customer_name || "Pelanggan"}</div>
                            <div className="text-xs text-gray-400">{formatDate(tx.created_at)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize font-medium text-gray-600 block">{tx.type}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-blue-500 font-bold uppercase">{tx.payment_method || "Split"}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-600">
                            {formatRupiah(tx.subtotal)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-red-500">
                            {formatRupiah(tx.tax_amount)}
                          </td>
                          <td className="px-4 py-3 font-black text-gray-800 text-right">
                            {formatRupiah(tx.grand_total)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400 italic font-medium">
                        Tidak ada transaksi yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
