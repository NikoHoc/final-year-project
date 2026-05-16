"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSettlement } from "@/hooks/useSettlement";
import SettlementSummaryCards from "@/components/settlements/SettlementSummaryCards";
import PaymentBreakdownTable from "@/components/settlements/PaymentBreakdownTable";
import ExpenseTable from "@/components/settlements/ExpenseTable";
import SettlementTransactionTable from "@/components/settlements/TransactionTable";
import { formatDateFull } from "@/utils/format";
import { Transaction } from "@/types";
import ReportTransactionModal from "@/components/settlements/ReportTransactionModal";
import ReportSettlementPrintModal from "@/components/settlements/ReportSettlementPrintModal";
import { useSession } from "@/contexts/SessionContext"

export default function SettlementDetailPage() {
  const { id } = useParams();
  const { settlementDetail, isLoading, fetchSettlementDetail } = useSettlement();
  const { depot, isLoadingSession } = useSession();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    if (id) fetchSettlementDetail(id as string);
  }, [id, fetchSettlementDetail]);

  if (isLoadingSession || isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-bold text-gray-500 animate-pulse">
          {isLoadingSession ? "Memuat Sesi Kasir..." : "Mengambil data detail settlement..."}
        </p>
      </div>
    );
  }

  const { settlement, summary, transactions, expenses } =
    settlementDetail || {};

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/kasir/reports"
            className="cursor-pointer p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-800">
              Detail Settlement
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Laporan tanggal:{" "}
              {formatDateFull(settlement?.settlement_date || "")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="cursor-pointer flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100"
        >
          <Printer size={20} />
          Cetak Laporan
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
        transactions={transactions || []}
        onViewReceipt={(tx) => setSelectedTx(tx)}
      />

      <ReportTransactionModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
        depot={depot}
      />

      <ReportSettlementPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        settlement={settlement ?? null}
        summary={summary ?? null}
        expenses={expenses ?? []}
        depot={depot}
      />
    </div>
  );
}
