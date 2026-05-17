"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useDepots } from "@/hooks/useDepot"; 
import { useMenus } from "@/hooks/useMenus";
import { useCategories } from "@/hooks/useCategories";
import { Depot, Menu } from "@/types";
import DepotTable from "@/components/depots/DepotTable";
import DepotFormModal from "@/components/depots/DepotFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PaymentConfigModal from "@/components/depots/PaymentConfigModal";
import AssignMenuModal from "@/components/depots/AssignMenuModal";


export default function DepotsPage() {
  const { depots, isLoading, fetchDepots, toggleDepotStatus, deleteDepot, createDepot, updateDepot, setupPaymentConfig, getDepotMenus, assignDepotMenus } = useDepots();
  const { menus, fetchMenus } = useMenus();
  const { categories, fetchCategories } = useCategories();

  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [initialMenuIds, setInitialMenuIds] = useState<number[]>([]);

  const [confirmType, setConfirmType] = useState<"operasional" | "delete" | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  useEffect(() => {
    fetchDepots();
    fetchMenus(); 
    fetchCategories(); 
  }, [fetchDepots, fetchMenus, fetchCategories]);

  const handleOpenAssignMenu = async (depot: Depot) => {
    setSelectedDepot(depot);
    const currentMenus = await getDepotMenus(depot.id);
    setInitialMenuIds(currentMenus.map((m: Menu) => m.id));
    setIsAssignModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedDepot) return;
    if (confirmType === "operasional") {
      await toggleDepotStatus(selectedDepot.id, !selectedDepot.is_open);
    } else if (confirmType === "delete") {
      await deleteDepot(selectedDepot.id);
    }
    setConfirmType(null);
    setSelectedDepot(null);

    fetchDepots();
  };

  const handleFormSubmit = async (data: { name: string; address: string; phone_number: string }) => {
    if (selectedDepot) {
      return await updateDepot(selectedDepot.id, data); 
    } else {
      return await createDepot(data);
    }
  };

  const handleEditClick = (depot: Depot) => {
    setSelectedDepot(depot);
    setIsFormOpen(true);
  };

  const handlePaymentSubmit = async (data: { merchant_id: string; midtrans_client_key: string; midtrans_server_key: string }) => {
    if (!selectedDepot) return false;
    return await setupPaymentConfig(selectedDepot.id, data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            Manajemen Depot
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Kelola data depot, status operasional, payment-gateway, dan menu.</p>
        </div>
        <button
          onClick={() => { setSelectedDepot(null); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Depot
        </button>
      </div>


      <DepotTable 
        data={depots} 
        isLoading={isLoading} 
        onOperasionalClick={(depot) => { setSelectedDepot(depot); setConfirmType("operasional"); }}
        onDeleteClick={(depot) => { setSelectedDepot(depot); setConfirmType("delete"); }}
        onEditClick={handleEditClick}
        onSetupPaymentClick={(depot) => { setSelectedDepot(depot); setIsPaymentModalOpen(true); }}
        onAssignMenu={handleOpenAssignMenu}
      />

      <DepotFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedDepot(null); }}
        initialData={selectedDepot}
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

      <PaymentConfigModal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setSelectedDepot(null); }}
        depot={selectedDepot}
        onSubmit={handlePaymentSubmit}
      />
      
      {selectedDepot && (
        <AssignMenuModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          depotName={selectedDepot.name}
          allMenus={menus}
          allCategories={categories}
          initialMenuIds={initialMenuIds}
          onSave={(ids) => assignDepotMenus(selectedDepot.id, ids)}
          maxWidth="xl"
        />
      )}
    </div>
  );
}