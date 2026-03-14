"use client";

import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useDepots } from "@/hooks/useDepot"; 
import { Employee } from "@/types";
import { UserFormData } from "@/services/userService";

import UserTable from "@/components/users/UserTable";
import UserFormModal from "@/components/users/UserFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal"; 

export default function EmployeesPage() {
  const { users, isLoading, fetchUsers, createUser, updateUser, deleteUser, currentDepotFilter, currentRoleFilter } = useUsers();
  
  const { depots } = useDepots(); 

  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | null>(null);

  const handleDepotFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    fetchUsers(e.target.value, currentRoleFilter);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    fetchUsers(currentDepotFilter, e.target.value);
  };

  const handleFormSubmit = async (data: UserFormData) => {
    if (selectedUser) {
      return await updateUser(selectedUser.id, data);
    } else {
      return await createUser(data);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    if (confirmType === "delete") {
      await deleteUser(selectedUser.id);
    }
    setConfirmType(null);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-poppins">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-montserrat">Manajemen Users</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data kasir, pelayan, serta pelanggan.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Filter size={16} />
            </div>
            <select
              value={currentRoleFilter}
              onChange={handleRoleFilterChange}
              className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer font-medium text-gray-700 shadow-sm"
            >
              <option value="all">Semua Peran</option>
              <option value="kasir">Kasir</option>
              <option value="pelayan">Pelayan</option>
              <option value="pelanggan">Pelanggan</option>
            </select>
          </div>
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Filter size={16} />
            </div>
            <select
              value={currentDepotFilter}
              onChange={handleDepotFilterChange}
              className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer font-medium text-gray-700 shadow-sm"
            >
              <option value="all">Semua Cabang (Global)</option>
              {depots.map(depot => (
                <option key={depot.id} value={depot.id}>Cabang: {depot.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => { setSelectedUser(null); setIsFormOpen(true); }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Tambah Users</span>
          </button>

        </div>
      </div>

      <UserTable 
        data={users} 
        isLoading={isLoading} 
        onEditClick={(user) => { setSelectedUser(user); setIsFormOpen(true); }}
        onDeleteClick={(user) => { setSelectedUser(user); setConfirmType("delete"); }}
      />

      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedUser(null); }}
        initialData={selectedUser}
        depotsList={depots} 
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        isOpen={confirmType !== null}
        onClose={() => { setConfirmType(null); setSelectedUser(null); }}
        onConfirm={handleConfirmAction}
        title="Hapus Data User?"
        message={`Apakah Anda yakin ingin menghapus "${selectedUser?.full_name}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        type="danger"
      />

    </div>
  );
}