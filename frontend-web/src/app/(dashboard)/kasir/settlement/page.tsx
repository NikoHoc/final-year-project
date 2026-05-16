"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSettlement } from "@/hooks/useSettlement";
import SettlementSummaryCards from "@/components/settlements/SettlementSummaryCards";
import PaymentBreakdownTable from "@/components/settlements/PaymentBreakdownTable";
import ExpenseTable from "@/components/settlements/ExpenseTable";
import SettlementTransactionTable from "@/components/settlements/TransactionTable";
import { formatDateFull } from "@/utils/format";
import Cookies from "js-cookie";
import { User, Transaction } from "@/types";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ReportTransactionModal from "@/components/settlements/ReportTransactionModal";

export default function CashierSettlementPage() {
  const { todayData, isLoading, fetchTodaySummary, processSettlement } = useSettlement();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [depotId, setDepotId] = useState<number | null>(null);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const user: User = JSON.parse(userCookie);
      if (user.depot_id) {
        setDepotId(user.depot_id);
        fetchTodaySummary(user.depot_id); 
      }
    }
  }, [fetchTodaySummary]);

  const handleProcessSettlement = async () => {
    if (!depotId || !todayData) return;
    
    if (todayData.transactions.length === 0) {
      toast.error("Tidak ada transaksi aktif yang bisa di-settle hari ini.");
      setIsConfirmModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await processSettlement(depotId, todayData.summary);
      if (success) {
        toast.success("Settlement berhasil diproses! Kas hari ini telah ditutup.");
        setIsConfirmModalOpen(false);

        window.location.reload();
      }
    } catch {} 
    finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-bold text-gray-500 animate-pulse">Memuat ringkasan kas hari ini...</p>
      </div>
    );
  }

  const { summary, transactions, expenses } = todayData || {};

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Rekap penjualan harian</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Rekap berjalan: {formatDateFull(new Date().toISOString())}
          </p>
        </div>
        
        <button
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={!todayData || transactions?.length === 0}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-gray-200 disabled:shadow-none shrink-0"
        >
          <CheckCircle2 size={20} />
          Proses Settlement
        </button>
      </div>
      <SettlementSummaryCards summary={summary ?? null} />

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6">
          <PaymentBreakdownTable summary={summary ?? null} />
        </div>
        <div className="lg:col-span-4">
          <ExpenseTable expenses={expenses ?? []} />
        </div>
      </div>

      <SettlementTransactionTable 
        transactions={transactions ?? []} 
        showAction={true} 
        onViewReceipt={(tx) => setSelectedTx(tx)}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleProcessSettlement}
        title="Konfirmasi Tutup Kasir"
        message={`Apakah Anda yakin ingin melakukan proses Settlement? Aksi ini akan mengunci ${transactions?.length} transaksi dan ${expenses?.length} pengeluaran secara permanen.`}
        type="warning"
        confirmText="Ya, Tutup Kasir"
        isLoading={isSubmitting}
      />

      <ReportTransactionModal 
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />
    </div>
  );
}