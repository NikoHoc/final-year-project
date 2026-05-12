"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { useStock } from "@/hooks/useStock";
import { StockMutation, User } from "@/types";
import ActiveMutationsTable from "@/components/mutations/ActiveMutationsTable";
import HistoryMutationsTable from "@/components/mutations/HistoryMutationsTable";
import MutationFormModal from "@/components/mutations/MutationFormModal";

export default function MutationsPage() {
  const { mutations, isLoading, fetchMutations } = useStock();
  const [depotId, setDepotId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMutation, setSelectedMutation] = useState<StockMutation | null>(null);

  const loadData = useCallback(async () => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const user: User = JSON.parse(userCookie);
      if (user.depot_id) {
        setDepotId(user.depot_id);
        await fetchMutations(user.depot_id);
      }
    }
  }, [fetchMutations]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const activeData = mutations.filter((m) => m.status === "pending");
  const historyData = mutations.filter((m) => m.status !== "pending");

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
        depotId={depotId}
        onRefresh={loadData}
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
        depotId={depotId}
        initialData={selectedMutation}
        onSuccess={loadData}
      />
    </div>
  );
}