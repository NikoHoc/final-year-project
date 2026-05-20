"use client";

import { useState, useEffect } from "react";
import { useStock } from "@/hooks/useStock";
import { getTodayStr, getFirstDayOfMonthStr } from "@/utils/format";
import { Truck } from "lucide-react";
import HistoryMutationsTable from "@/components/mutations/HistoryMutationsTable";
import ActiveMutationsTable from "@/components/mutations/ActiveMutationsTable";

export default function AdminMutationsPage() {
  const { activeMutations, historyMutations, isActiveLoading, isHistoryLoading, fetchActiveMutations, fetchHistoryMutations } = useStock();

  const [startDate, setStartDate] = useState(getFirstDayOfMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [activeShortcut, setActiveShortcut] = useState<"bulan_ini" | "semua" | "custom">("bulan_ini");

  useEffect(() => {
    fetchActiveMutations(null);
    fetchHistoryMutations(null, getFirstDayOfMonthStr(), `${getTodayStr()}T23:59:59.999Z`);
  }, [fetchHistoryMutations, fetchActiveMutations]);

  const handleApplyFilter = () => {
    setActiveShortcut("custom");
    const adjustedEndDate = endDate ? `${endDate}T23:59:59.999Z` : "";
    fetchHistoryMutations(null, startDate, adjustedEndDate);
  };
  
  const handleFilterShortcut = (type: "bulan_ini" | "semua") => {
    setActiveShortcut(type);

    if (type === "bulan_ini") {
      setStartDate(getFirstDayOfMonthStr());
      setEndDate(getTodayStr());
      fetchHistoryMutations(null, getFirstDayOfMonthStr(), `${getTodayStr()}T23:59:59.999Z`);
    } else if (type === "semua") {
      setStartDate("");
      setEndDate("");
      fetchHistoryMutations(null); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            Laporan Mutasi Stok
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Pantau seluruh riwayat pergerakan logistik antar cabang secara global.
          </p>
        </div>
      </div>

      <ActiveMutationsTable 
        data={activeMutations}
        isLoading={isActiveLoading}
        depotId={null}
        readOnly={true}
        onRefresh={() => fetchActiveMutations(null)}
        title="Permintaan Aktif"
        description="Daftar permintaan mutasi stok yang sedang berjalan"
        icon={<Truck size={24}/>}
      />

      <HistoryMutationsTable 
        data={historyMutations}
        isLoading={isHistoryLoading}
        activeShortcut={activeShortcut}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApplyFilter={handleApplyFilter}
        onShortcutChange={handleFilterShortcut}
      />

    </div>
  );
}