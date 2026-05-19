"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSettlement } from "@/hooks/useSettlement";
import { formatDateFull } from "@/utils/format";
import { Transaction } from "@/types";

import DailySummaryCards from "@/components/settlements/DailySummaryCards";
import PaymentBreakdownTable from "@/components/settlements/PaymentBreakdownTable";
import DailyTransactionTable from "@/components/settlements/DailyTransactionTable";
import ReportTransactionModal from "@/components/settlements/ReportTransactionModal";
import ReportSettlementPrintModal from "@/components/settlements/ReportSettlementPrintModal";
import CompactExpenseTable from "@/components/settlements/CompactExpenseTable";

export default function AdminSettlementDetailPage() {
  const { id } = useParams();
  const { settlementDetail, isLoading, fetchSettlementDetail } = useSettlement();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSettlementDetail(id as string);
    }
  }, [id, fetchSettlementDetail]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 bg-gray-50/50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm text-gray-500 font-bold">Memuat rincian dokumen settlement...</p>
      </div>
    );
  }

  const { settlement, summary, transactions, expenses } =
    settlementDetail || {};
  
  const settlementDepot = settlement?.depot;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/transactions" 
            className="cursor-pointer text-gray-400 hover:text-gray-600 p-2 bg-white rounded-xl border border-gray-100 shadow-sm transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">
              Detail Settlement - {settlementDepot?.name || `Depot #${settlement?.depot_id || ""}`}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-semibold">
              Laporan tanggal: {formatDateFull(settlement?.settlement_date || "")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="cursor-pointer flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 text-xs"
        >
          <Printer size={16} /> Cetak Laporan
        </button>
      </div>

      <DailySummaryCards summary={summary ?? null} transactions={transactions || []} role="admin" />

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6">
          <PaymentBreakdownTable summary={summary ?? null} />
        </div>
        <div className="lg:col-span-4">
          <CompactExpenseTable expenses={expenses ?? []} />
        </div>
      </div>

      <DailyTransactionTable
        transactions={transactions || []}
        onViewReceipt={(tx) => setSelectedTx(tx)}
      />

      <ReportTransactionModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
        depot={settlementDepot ?? null} 
      />

      <ReportSettlementPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        settlement={settlement ?? null}
        summary={summary ?? null}
        expenses={expenses ?? []}
        depot={settlementDepot ?? null}
      />
    </div>
  );
}