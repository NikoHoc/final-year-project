"use client";

import { useState, useEffect } from "react";
import { useStock } from "@/hooks/useStock";
import { StockMutation } from "@/types";
import ActiveMutationsTable from "@/components/mutations/ActiveMutationsTable";
import HistoryMutationsTable from "@/components/mutations/HistoryMutationsTable";
import MutationFormModal from "@/components/mutations/MutationFormModal";
import { useSession } from "@/contexts/SessionContext";

export default function MutationsPage() {
  const { mutations, isLoading, fetchMutations } = useStock();
  const { user, isLoadingSession } = useSession();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMutation, setSelectedMutation] = useState<StockMutation | null>(null);

  useEffect(() => {
    if (!isLoadingSession && user?.depot_id) {
      fetchMutations(user.depot_id);
    }
  }, [isLoadingSession, user, fetchMutations]);

  const activeData = mutations.filter((m) => m.status === "pending");
  const historyData = mutations.filter((m) => m.status !== "pending");

  if (isLoadingSession) {
    return <div className="p-8 text-center animate-pulse text-gray-400">Memuat Sesi Kasir...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Mutasi Stok
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola pengiriman dan penerimaan barang antar depot.</p>
        </div>
        <button
          onClick={() => {
            setSelectedMutation(null);
            setIsFormOpen(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          + Buat Mutasi Baru
        </button>
      </div>

      <ActiveMutationsTable 
        data={activeData} 
        isLoading={isLoading} 
        depotId={user?.depot_id || 0}
        onRefresh={() => {
          if (user?.depot_id) fetchMutations(user.depot_id);
        }}
        onEdit={(m) => {
          setSelectedMutation(m);
          setIsFormOpen(true);
        }}
      />

      <HistoryMutationsTable 
        data={historyData} 
        isLoading={isLoading} 
      />

      <MutationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        depotId={user?.depot_id || 0}
        initialData={selectedMutation}
        onSuccess={() => {
          if (user?.depot_id) fetchMutations(user.depot_id);
        }}
      />
    </div>
  );
}