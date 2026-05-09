import { useState, useEffect, useCallback } from "react";
import { userService, UserFormData } from "@/services/userService";
import { Employee } from "@/types";
import toast from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";

export const useUsers = () => {
  const [users, setUsers] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentDepotFilter, setCurrentDepotFilter] = useState<string>("all");
  const [currentRoleFilter, setCurrentRoleFilter] = useState<string>("all");

  const fetchUsers = useCallback(async (depotId: string = "all", role: string = "all") => {
    setIsLoading(true);
    setCurrentDepotFilter(depotId); 
    setCurrentRoleFilter(role);
    try {
      const data = await userService.getAll(depotId, role);
      setUsers(data);
    } catch (error) {
      handleApiError(error, "Gagal memuat daftar user");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (data: UserFormData) => {
    try {
      await userService.create(data);
      toast.success("Pegawai baru berhasil didaftarkan!");
      fetchUsers(currentDepotFilter);
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal membuat user baru");
      throw error;
    }
  };

  const updateUser = async (id: string, data: UserFormData) => {
    try {
      await userService.update(id, data);
      toast.success("Data pegawai berhasil diperbarui!");
      fetchUsers(currentDepotFilter); 
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal memperbarui data user");
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      toast.success("Pegawai berhasil dihapus!");
      fetchUsers(currentDepotFilter);
    } catch (error: unknown) {
      handleApiError(error, "Gagal menghapus user");
      throw error;
    }
  };

  return { 
    users, 
    currentRoleFilter,
    currentDepotFilter,
    isLoading, 
    fetchUsers,
    createUser, 
    updateUser, 
    deleteUser 
  };
};