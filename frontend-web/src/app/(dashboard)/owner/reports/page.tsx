"use client";

import { useState, useEffect } from "react";
import { Activity, Filter } from "lucide-react";
import { useSettlement } from "@/hooks/useSettlement";
import { formatDateFull, getTodayStr, getFirstDayOfMonthStr } from "@/utils/format";
import { useSession } from "@/contexts/SessionContext";
import SettlementHistoryTable from "@/components/settlements/SettlementHistoryTable";
import AccumulatedSummaryCards from "@/components/settlements/AccumulatedSummaryCards";
import TransactionTypeChart from "@/components/charts/TransactionTypeChart";
import PaymentMethodChart from "@/components/charts/PaymentMethodChart";
import TopMenuLeaderboard from "@/components/charts/TopMenuLeaderboard";
import RevenueTrendChart from "@/components/charts/RevenueTrendChart";

export default function OwnerReportsPage() {
  const { settlements, transactionTypeSummary, paymentSummary, topMenuSummary, isLoading, fetchSettlements } = useSettlement();
  const { user, isLoadingSession } = useSession();

  const [startDate, setStartDate] = useState(getFirstDayOfMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [activeShortcut, setActiveShortcut] = useState<"bulan_ini" | "semua" | "custom">("bulan_ini");

  const endOfToday = `${getTodayStr()}T23:59:59.999Z`;

  useEffect(() => {
    if (!isLoadingSession && user?.depot_id) {
      fetchSettlements(user.depot_id, getFirstDayOfMonthStr(), endOfToday);
    }
  }, [isLoadingSession, user?.depot_id, fetchSettlements, endOfToday]);

  const handleApplyFilter = () => {
    if (!user?.depot_id) return;
    setActiveShortcut("custom");
    const adjustedEndDate = endDate ? `${endDate}T23:59:59.999Z` : "";
    fetchSettlements(user.depot_id, startDate, adjustedEndDate);
  };

  const handleFilterShortcut = (type: "bulan_ini" | "semua") => {
    if (!user?.depot_id) return;
    setActiveShortcut(type);

    if (type === "bulan_ini") {
      setStartDate(getFirstDayOfMonthStr());
      setEndDate(getTodayStr());
      fetchSettlements(user.depot_id, getFirstDayOfMonthStr(), endOfToday);
    } else if (type === "semua") {
      setStartDate("");
      setEndDate("");
      fetchSettlements(user.depot_id); 
    }
  };

  if (isLoadingSession) {
    return <div className="p-8 text-center animate-pulse text-gray-400 font-bold">Mempersiapkan Laporan Keuangan...</div>;
  }
  
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Laporan Depot</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
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

      <AccumulatedSummaryCards data={settlements} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <TransactionTypeChart data={transactionTypeSummary} isLoading={isLoading} />
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <PaymentMethodChart data={paymentSummary} isLoading={isLoading} startDate={startDate} endDate={endDate} />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <TopMenuLeaderboard data={topMenuSummary} isLoading={isLoading} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-4">
            <Activity size={20} className="text-blue-500" /> Tren Pendapatan & Pengeluaran
        </h2>
        <RevenueTrendChart 
            data={settlements} 
            isLoading={isLoading} 
            startDate={startDate} 
            endDate={endDate} 
          />
      </div>
      <SettlementHistoryTable 
        data={settlements}
        isLoading={isLoading}
        startDate={startDate}
        endDate={endDate}
        detailPathPrefix="/owner/reports/settlement"
        role='owner'
      />
    </div>
  );
}