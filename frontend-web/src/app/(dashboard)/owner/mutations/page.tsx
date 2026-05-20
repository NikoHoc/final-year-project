"use client";

import { useState, useEffect, useMemo } from "react";
import { useStock } from "@/hooks/useStock";
import { StockMutation } from "@/types";
import ActiveMutationsTable from "@/components/mutations/ActiveMutationsTable";
import HistoryMutationsTable from "@/components/mutations/HistoryMutationsTable";
import MutationFormModal from "@/components/mutations/MutationFormModal";
import { useSession } from "@/contexts/SessionContext";
import { getTodayStr, getFirstDayOfMonthStr } from "@/utils/format";
import { ArrowDownToLine, ArrowUpFromLine, Plus } from "lucide-react";

export default function OwnerMutationsPage() {
  const { 
    activeMutations, 
    historyMutations, 
    isActiveLoading, 
    isHistoryLoading, 
    fetchActiveMutations, 
    fetchHistoryMutations 
  } = useStock();
  
  const { user, isLoadingSession } = useSession();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMutation, setSelectedMutation] = useState<StockMutation | null>(null);

  const [startDate, setStartDate] = useState(getFirstDayOfMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [activeShortcut, setActiveShortcut] = useState<"bulan_ini" | "semua" | "custom" >("bulan_ini");

  const depotId = user?.depot_id;
  
  useEffect(() => {
    if (!isLoadingSession && depotId) {
      fetchActiveMutations(depotId);
      fetchHistoryMutations(depotId, getFirstDayOfMonthStr(), `${getTodayStr()}T23:59:59.999Z`);
    }
  }, [isLoadingSession, depotId, fetchActiveMutations, fetchHistoryMutations]);

  // 💡 LOGIKA PEMISAHAN UTAMA (MUTASI MASUK VS MUTASI KELUAR)
  const { incomingRequests, outgoingRequests } = useMemo(() => {
    if (!activeMutations || !depotId) {
      return { incomingRequests: [], outgoingRequests: [] };
    }
    return {
      // Cabang kita bertindak sebagai pemberi stok (dimintai bantuan oleh cabang lain)
      incomingRequests: activeMutations.filter((m) => m.provider_id === depotId),
      // Cabang kita yang membuat request (meminta stok ke cabang lain)
      outgoingRequests: activeMutations.filter((m) => m.requester_id === depotId),
    };
  }, [activeMutations, depotId]);

  const handleApplyFilter = () => {
    if (depotId) {
      fetchHistoryMutations(depotId, `${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`);
      setActiveShortcut("custom");
    }
  };

  const handleFilterShortcut = (type: "bulan_ini" | "semua") => {
    if (!depotId) return;
    setActiveShortcut(type);
    if (type === "bulan_ini") {
      setStartDate(getFirstDayOfMonthStr());
      setEndDate(getTodayStr());
      fetchHistoryMutations(depotId, getFirstDayOfMonthStr(), `${getTodayStr()}T23:59:59.999Z`);
    } else {
      setStartDate("");
      setEndDate("");
      fetchHistoryMutations(depotId);
    }
  };

  const handleRefreshData = () => {
    if (depotId) {
      fetchActiveMutations(depotId);
      fetchHistoryMutations(depotId, startDate ? `${startDate}T00:00:00.000Z` : undefined, endDate ? `${endDate}T23:59:59.999Z` : undefined);
    }
  };

  if (isLoadingSession) return null;

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Mutasi Logistik Stok</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Kelola pengiriman dan penerimaan barang antar depot.</p>
        </div>
        <button
          onClick={() => {
            setSelectedMutation(null);
            setIsFormOpen(true);
          }}
          className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={18} />
          <span>Request Baru</span>
        </button>
      </div>

      <ActiveMutationsTable 
        data={incomingRequests} 
        isLoading={isActiveLoading} 
        depotId={depotId || 0}
        onRefresh={handleRefreshData}
        onEdit={(m) => {
          setSelectedMutation(m);
          setIsFormOpen(true);
        }}
        title="Permintaan Stok Masuk"
        description="Daftar permintaan mutasi stok dari cabang lain yang butuh persetujuan"
        icon={<ArrowDownToLine size={24} className="text-red-500" />}
      />

      <ActiveMutationsTable 
        data={outgoingRequests} 
        isLoading={isActiveLoading} 
        depotId={depotId || 0}
        onRefresh={handleRefreshData}
        onEdit={(m) => {
          setSelectedMutation(m);
          setIsFormOpen(true);
        }}
        title="Permintaan Stok Keluar"
        description="Daftar permintaan mutasi logistik yang Anda ajukan ke cabang lain"
        icon={<ArrowUpFromLine size={24} className="text-blue-500" />}
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
        depotId={depotId || 0}
        initialData={selectedMutation}
        onSuccess={handleRefreshData}
      />
    </div>
  );
}