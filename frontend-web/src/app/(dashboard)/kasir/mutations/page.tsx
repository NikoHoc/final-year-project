"use client";

import { useState, useEffect } from "react";
import { useStock } from "@/hooks/useStock";
import { StockMutation } from "@/types";
import ActiveMutationsTable from "@/components/mutations/ActiveMutationsTable";
import HistoryMutationsTable from "@/components/mutations/HistoryMutationsTable";
import MutationFormModal from "@/components/mutations/MutationFormModal";
import { useSession } from "@/contexts/SessionContext";
import { getTodayStr, getFirstDayOfMonthStr } from "@/utils/format";

export default function MutationsPage() {
  const { activeMutations, historyMutations, isActiveLoading, isHistoryLoading, fetchActiveMutations, fetchHistoryMutations } = useStock();
  const { user, isLoadingSession } = useSession();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMutation, setSelectedMutation] = useState<StockMutation | null>(null);

  const [startDate, setStartDate] = useState(getFirstDayOfMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [activeShortcut, setActiveShortcut] = useState<"bulan_ini" | "semua" | "custom">("bulan_ini");

  useEffect(() => {
    if (!isLoadingSession && user?.depot_id) {
      fetchActiveMutations(user.depot_id);
      fetchHistoryMutations(user.depot_id, getFirstDayOfMonthStr(), `${getTodayStr()}T23:59:59.999Z`);
    }
  }, [isLoadingSession, user, fetchActiveMutations, fetchHistoryMutations]);


  const handleApplyFilter = () => {
    if (!user?.depot_id) return;
    setActiveShortcut("custom");
    const adjustedEndDate = endDate ? `${endDate}T23:59:59.999Z` : "";
    fetchHistoryMutations(user.depot_id, startDate, adjustedEndDate);
  };
  
  const handleFilterShortcut = (type: "bulan_ini" | "semua") => {
    if (!user?.depot_id) return;
    setActiveShortcut(type);

    if (type === "bulan_ini") {
      setStartDate(getFirstDayOfMonthStr());
      setEndDate(getTodayStr());
      fetchHistoryMutations(user.depot_id, getFirstDayOfMonthStr(), `${getTodayStr()}T23:59:59.999Z`);
    } else if (type === "semua") {
      setStartDate("");
      setEndDate("");
      fetchHistoryMutations(user.depot_id); 
    }
  };

  if (isLoadingSession) {
    return <div className="p-8 text-center animate-pulse text-gray-400">Memuat Sesi Kasir...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            Manajemen Mutasi Stok
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Kelola pengiriman dan penerimaan barang antar depot.</p>
        </div>
        <button
          onClick={() => {
            setSelectedMutation(null);
            setIsFormOpen(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          + Request
        </button>
      </div>

      <ActiveMutationsTable 
        data={activeMutations} 
        isLoading={isActiveLoading} 
        depotId={user?.depot_id || 0}
        onRefresh={() => {
          if (user?.depot_id) window.location.reload();
        }}
        onEdit={(m) => {
          setSelectedMutation(m);
          setIsFormOpen(true);
        }}
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

      <MutationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        depotId={user?.depot_id || 0}
        initialData={selectedMutation}
        onSuccess={() => {
          if (user?.depot_id) window.location.reload();
        }}
      />
    </div>
  );
}