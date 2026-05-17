import { useState, useCallback } from "react";
import { userService, UserFormData } from "@/services/userService";
import { User } from "@/types";
import toast from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentDepotFilter, setCurrentDepotFilter] = useState<string>("all");
  const [currentRoleFilter, setCurrentRoleFilter] = useState<string>("all");

  const fetchEmployees = useCallback(async (depotId: string = "all", role: string = "all") => {
    setIsLoading(true);
    setCurrentDepotFilter(depotId); 
    setCurrentRoleFilter(role);
    try {
      const data = await userService.getEmployees(depotId, role);
      setEmployees(data);
    } catch (error) {
      handleApiError(error, "Gagal memuat daftar pegawai");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEmployee = async (data: UserFormData) => {
    try {
      await userService.createEmployee(data);
      toast.success("Pegawai baru berhasil didaftarkan!");
      fetchEmployees(currentDepotFilter, currentRoleFilter);
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal membuat pegawai baru");
      throw error;
    }
  };

  const updateEmployee = async (id: string, data: UserFormData) => {
    try {
      await userService.updateEmployee(id, data);
      toast.success("Data pegawai berhasil diperbarui!");
      fetchEmployees(currentDepotFilter, currentRoleFilter); 
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal memperbarui data pegawai");
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await userService.deleteEmployee(id);
      toast.success("Pegawai berhasil dihapus!");
      fetchEmployees(currentDepotFilter, currentRoleFilter);
    } catch (error: unknown) {
      handleApiError(error, "Gagal menghapus pegawai");
      throw error;
    }
  };

  return { 
    employees, 
    currentRoleFilter,
    currentDepotFilter,
    isLoading, 
    fetchEmployees,
    createEmployee, 
    updateEmployee, 
    deleteEmployee 
  };
};