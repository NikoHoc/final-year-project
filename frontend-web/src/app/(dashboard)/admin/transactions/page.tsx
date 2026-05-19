"use client";

import { useState, useEffect } from "react";
import { useSettlement } from "@/hooks/useSettlement";
import { useDepots } from "@/hooks/useDepot";
import { Filter, Building2, Activity } from "lucide-react";
import { getTodayStr, getFirstDayOfMonthStr, formatDateFull } from "@/utils/format";
import AccumulatedSummaryCards from "@/components/settlements/AccumulatedSummaryCards";
import RevenueTrendChart from "@/components/charts/RevenueTrendChart";
import PaymentMethodChart from "@/components/charts/PaymentMethodChart";
import SettlementHistoryTable from "@/components/settlements/SettlementHistoryTable";
import TransactionTypeChart from "@/components/charts/TransactionTypeChart";
import TopMenuLeaderboard from "@/components/charts/TopMenuLeaderboard";

export default function AdminTransactionsPage() {
  const { depots, isLoading: isDepotsLoading, fetchDepots } = useDepots();
  const { settlements, paymentSummary, transactionTypeSummary, topMenuSummary, isLoading: isSettlementLoading, fetchSettlements } = useSettlement();

  const [selectedDepotId, setSelectedDepotId] = useState<number | "">("");
  const [startDate, setStartDate] = useState(getFirstDayOfMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [activeShortcut, setActiveShortcut] = useState<"7_hari" | "bulan_ini" | "semua" | "custom">("bulan_ini");

  useEffect(() => {
    fetchDepots();
  }, [fetchDepots]);

  useEffect(() => {
    if (depots && depots.length > 0 && selectedDepotId === "") {
      const firstDepotId = depots[0].id;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDepotId(firstDepotId);
      fetchSettlements(firstDepotId, getFirstDayOfMonthStr(), `${getTodayStr()}T23:59:59.999Z`);
    }
  }, [depots, selectedDepotId, fetchSettlements]);

  const handleDepotChange = (depotId: number) => {
    setSelectedDepotId(depotId);
    if (depotId) {
      const endParam = endDate ? `${endDate}T23:59:59.999Z` : undefined;
      fetchSettlements(depotId, startDate || undefined, endParam);
    }
  };

  const handleFilterShortcut = (type: "bulan_ini" | "semua") => {
    setActiveShortcut(type);
    if (!selectedDepotId) return;

    let start = "";
    let end = getTodayStr();

    if (type === "bulan_ini") {
      start = getFirstDayOfMonthStr();
    } else if (type === "semua") {
      start = "";
      end = "";
    }

    setStartDate(start);
    setEndDate(end);

    const endParam = end ? `${end}T23:59:59.999Z` : undefined;
    fetchSettlements(Number(selectedDepotId), start || undefined, endParam);
  };

  const handleApplyFilter = () => {
    if (!selectedDepotId) return;
    setActiveShortcut("custom");
    fetchSettlements(Number(selectedDepotId), startDate, `${endDate}T23:59:59.999Z`);
  };

  const currentLoading = isDepotsLoading || isSettlementLoading;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full xl:w-auto">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Laporan Transaksi</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {activeShortcut === "semua" 
                ? "Menampilkan semua riwayat settlement yang tercatat." 
                : `Menampilkan data periode: ${startDate ? formatDateFull(startDate) : '-'} s/d ${endDate ? formatDateFull(endDate) : '-'}`
              }
            </p>
          </div>
          
          <div className="relative min-w-50">
            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedDepotId}
              onChange={(e) => handleDepotChange(Number(e.target.value))}
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500 appearance-none cursor-pointer transition-all"
            >
              {depots.map((depot) => (
                <option key={depot.id} value={depot.id}>
                  {depot.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100 self-start lg:self-auto">
            <button
              onClick={() => handleFilterShortcut("bulan_ini")}
              className={`cursor-pointer px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${activeShortcut === "bulan_ini" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handleFilterShortcut("semua")}
              className={`cursor-pointer px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${activeShortcut === "semua" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Semua
            </button>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto justify-between sm:justify-start">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500 w-full sm:w-auto"
            />
            <span className="text-gray-400 font-black text-xs">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500 w-full sm:w-auto"
            />
            <button
              onClick={handleApplyFilter}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 px-4 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 text-xs font-black min-w-25 justify-center"
              title="Terapkan Filter Tanggal"
            >
              <Filter size={14} /> Tampilkan
            </button>
          </div>

        </div>
      </div>

      {selectedDepotId && (
        <>
          <AccumulatedSummaryCards data={settlements} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <TransactionTypeChart data={transactionTypeSummary} isLoading={currentLoading} />
            </div>
                  
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <PaymentMethodChart data={paymentSummary} isLoading={currentLoading} startDate={startDate} endDate={endDate} />
            </div>
          
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <TopMenuLeaderboard data={topMenuSummary} isLoading={currentLoading} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-4">
              <Activity size={20} className="text-blue-500" /> Tren Pendapatan & Pengeluaran
            </h2>
          <RevenueTrendChart 
            data={settlements} 
            isLoading={currentLoading} 
            startDate={startDate} 
            endDate={endDate} 
          />
          </div>

          <SettlementHistoryTable
            data={settlements}
            isLoading={currentLoading}
            startDate={startDate}
            endDate={endDate}
            detailPathPrefix="/admin/transactions/settlement"
            role="admin"
          />
        </>
      )}
    </div>
  );
}