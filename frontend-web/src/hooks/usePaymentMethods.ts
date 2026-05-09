import { useState, useCallback } from "react";
import { paymentMethodService } from "@/services/paymentMethodService";
import { PaymentMethod } from "@/types";
import toast from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await paymentMethodService.getAll();
      setMethods(data || []);
    } catch (error) {
      handleApiError(error, "Gagal mengambil data metode pembayaran");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMethod = async (data: { name: string; is_active: boolean }) => {
    try {
      await paymentMethodService.create(data);
      await fetchMethods();
      toast.success("Metode pembayaran berhasil ditambahkan");
      return true;
    } catch (error) {
      handleApiError(error, "Gagal menambah metode pembayaran");
      throw error;
    }
  };

  const updateMethod = async (id: number, data: { name?: string; is_active?: boolean }) => {
    try {
      await paymentMethodService.update(id, data);
      await fetchMethods();
      toast.success("Metode pembayaran diperbarui");
      return true;
    } catch (error) {
      handleApiError(error, "Gagal memperbarui metode pembayaran");
      throw error;
    }
  };

  const deleteMethod = async (id: number) => {
    try {
      await paymentMethodService.delete(id);
      await fetchMethods();
      toast.success("Metode pembayaran dihapus");
      return true;
    } catch (error) {
      handleApiError(error, "Gagal menghapus metode pembayaran");
      throw error;
    }
  };

  return { methods, isLoading, fetchMethods, createMethod, updateMethod, deleteMethod };
};