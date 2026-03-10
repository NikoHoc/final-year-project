"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useDepots } from "@/hooks/useDepot"; 
import { Depot } from "@/types";
import DepotTable from "@/components/depots/DepotTable";
import DepotFormModal from "@/components/depots/DepotFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function DepotsPage() {
  const { depots, isLoading, toggleDepotStatus, deleteDepot, createDepot, updateDepot } = useDepots();

  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
  const [confirmType, setConfirmType] = useState<"toggle" | "delete" | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [depotToEdit, setDepotToEdit] = useState<Depot | null>(null);

  const handleConfirmAction = async () => {
    if (!selectedDepot) return;
    if (confirmType === "toggle") {
      await toggleDepotStatus(selectedDepot.id, !!selectedDepot.is_open);
    } else if (confirmType === "delete") {
      await deleteDepot(selectedDepot.id);
    }
    setConfirmType(null);
    setSelectedDepot(null);
  };

  const handleFormSubmit = async (data: { name: string; address: string; phone_number: string }) => {
    if (depotToEdit) {
      return await updateDepot(depotToEdit.id, data); 
    } else {
      return await createDepot(data);
    }
  };

  const handleEditClick = (depot: Depot) => {
    setDepotToEdit(depot);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-poppins">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-montserrat">Manajemen Depot</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data cabang dan konfigurasi pembayaran.</p>
        </div>
        
        <button 
          onClick={() => { setDepotToEdit(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Tambah Depot
        </button>
      </div>

      <DepotTable 
        data={depots} 
        isLoading={isLoading} 
        onToggleClick={(depot) => { setSelectedDepot(depot); setConfirmType("toggle"); }}
        onDeleteClick={(depot) => { setSelectedDepot(depot); setConfirmType("delete"); }}
        onEditClick={handleEditClick}
      />

      <DepotFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setDepotToEdit(null); }}
        initialData={depotToEdit}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        isOpen={confirmType !== null}
        onClose={() => { setConfirmType(null); setSelectedDepot(null); }}
        onConfirm={handleConfirmAction}
        title={confirmType === "delete" ? "Hapus Cabang?" : "Ubah Status Operasional?"}
        message={
          confirmType === "delete" 
            ? `Apakah Anda yakin ingin menghapus depot "${selectedDepot?.name}" secara permanen? Data yang dihapus tidak dapat dikembalikan.`
            : `Apakah Anda yakin ingin ${selectedDepot?.is_open ? "MENUTUP" : "MEMBUKA"} operasional untuk cabang "${selectedDepot?.name}"?`
        }
        type={confirmType === "delete" ? "danger" : "warning"}
      />
    </div>
  );
}