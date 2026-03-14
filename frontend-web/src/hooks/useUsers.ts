import { useState, useEffect, useCallback } from "react";
import { userService, UserFormData } from "@/services/userService";
import { Employee } from "@/types";
import toast from "react-hot-toast";

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
      console.error("Gagal mengambil data pegawai:", error);
      toast.error("Gagal memuat daftar pengguna");
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
      console.error("Gagal menambah pegawai:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal mendaftarkan pegawai");
      return false;
    }
  };

  const updateUser = async (id: string, data: UserFormData) => {
    try {
      await userService.update(id, data);
      toast.success("Data pegawai berhasil diperbarui!");
      fetchUsers(currentDepotFilter); 
      return true;
    } catch (error: unknown) {
      console.error("Gagal mengupdate pegawai:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal memperbarui data pegawai");
      return false;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      toast.success("Pegawai berhasil dihapus!");
      fetchUsers(currentDepotFilter);
    } catch (error: unknown) {
      console.error("Gagal menghapus pegawai:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal menghapus data pegawai");
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