import { useState, useCallback } from "react";
import { UserFormData, userService } from "@/services/userService";
import { User } from "@/types";
import toast from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getCustomers();
      setCustomers(data);
    } catch (error) {
      handleApiError(error, "Gagal memuat daftar pelanggan");
    } {
      setIsLoading(false);
    }
  }, []);

  const createCustomer = async (data: UserFormData) => {
    try {
      await userService.createCustomer(data);
      toast.success("Pelanggan baru berhasil ditambahkan!");
      fetchCustomers();
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal menambahkan pelanggan");
      throw error;
    }
  };

  const updateCustomer = async (id: string, data: UserFormData) => {
    try {
      await userService.updateCustomer(id, data);
      toast.success("Data pelanggan berhasil diperbarui!");
      fetchCustomers(); 
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal memperbarui data pelanggan");
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await userService.deleteCustomer(id);
      toast.success("Pelanggan berhasil dihapus!");
      fetchCustomers();
    } catch (error: unknown) {
      handleApiError(error, "Gagal menghapus pelanggan");
      throw error;
    }
  };

  return {
    customers,
    isLoading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};