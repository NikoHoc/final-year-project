"use client";

import { useEffect, useState } from "react";
import { Plus, Filter } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useDepots } from "@/hooks/useDepot"; 
import { User } from "@/types";
import { UserFormData } from "@/services/userService";

import EmployeeTable from "@/components/users/EmployeeTable";
import UserFormModal from "@/components/users/UserFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal"; 

export default function EmployeesPage() {
  const { employees, isLoading, fetchEmployees, createEmployee, updateEmployee, deleteEmployee, currentDepotFilter, currentRoleFilter } = useEmployees();
  const { depots, fetchDepots } = useDepots();

  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepots?.();
  }, [fetchEmployees, fetchDepots]);

  const handleDepotFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    fetchEmployees(e.target.value, currentRoleFilter);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    fetchEmployees(currentDepotFilter, e.target.value);
  };

  const handleFormSubmit = async (data: UserFormData) => {
    if (selectedEmployee) {
      return await updateEmployee(selectedEmployee.id, data);
    } else {
      return await createEmployee(data);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedEmployee) return;
    if (confirmType === "delete") {
      await deleteEmployee(selectedEmployee.id);
    }
    setConfirmType(null);
    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            Manajemen Pegawai
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Kelola data kasir dan pelayan depot.</p>
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
              <option value="owner">Owner</option>
              <option value="kasir">Kasir</option>
              <option value="pelayan">Pelayan</option>
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
            onClick={() => { setSelectedEmployee(null); setIsFormOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            <span>Pegawai</span>
          </button>
        </div>
      </div>

      <EmployeeTable 
        data={employees} 
        isLoading={isLoading} 
        onEditClick={(user) => { setSelectedEmployee(user); setIsFormOpen(true); }}
        onDeleteClick={(user) => { setSelectedEmployee(user); setConfirmType("delete"); }}
      />

      <UserFormModal
        variant="employee"
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedEmployee(null); }}
        initialData={selectedEmployee}
        depotsList={depots} 
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        isOpen={confirmType !== null}
        onClose={() => { setConfirmType(null); setSelectedEmployee(null); }}
        onConfirm={handleConfirmAction}
        title="Hapus Data User?"
        message={`Apakah Anda yakin ingin menghapus "${selectedEmployee?.full_name}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        type="danger"
      />
    </div>
  );
}