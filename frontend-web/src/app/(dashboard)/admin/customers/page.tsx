"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { User } from "@/types";
import { UserFormData } from "@/services/userService";

import CustomerTable from "@/components/users/CustomerTable";
import UserFormModal from "@/components/users/UserFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal"; 

export default function CustomersPage() {
  const { 
    customers, 
    isLoading, 
    fetchCustomers, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer 
  } = useCustomers();

  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, data);
      } else {
        await createCustomer(data);
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleConfirmAction = async () => {
    if (confirmType === "delete" && selectedCustomer) {
      await deleteCustomer(selectedCustomer.id);
    }
    setConfirmType(null);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            Manajemen Pelanggan
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Kelola Data Pelanggan</p>
        </div>
        <button
          onClick={() => { setSelectedCustomer(null); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Pelanggan
        </button>
      </div>

      <CustomerTable 
        data={customers} 
        isLoading={isLoading} 
        onEditClick={(customer) => { setSelectedCustomer(customer); setIsFormOpen(true); }}
        onDeleteClick={(customer) => { setSelectedCustomer(customer); setConfirmType("delete"); }}
      />

      <UserFormModal
        variant="customer"
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedCustomer(null); }}
        initialData={selectedCustomer}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        isOpen={confirmType !== null}
        onClose={() => { setConfirmType(null); setSelectedCustomer(null); }}
        onConfirm={handleConfirmAction}
        title="Hapus Akun Pelanggan?"
        message={`Apakah Anda yakin ingin menghapus pelanggan "${selectedCustomer?.full_name || ''}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}