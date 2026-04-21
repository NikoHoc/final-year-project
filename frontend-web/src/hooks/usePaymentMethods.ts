import { useState, useCallback } from "react";
import { paymentMethodService } from "@/services/paymentMethodService";
import { PaymentMethod } from "@/types";
import toast from "react-hot-toast";

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (error: unknown, defaultMsg: string) => {
    if (typeof error === "object" && error !== null) {
      const err = error as Record<string, unknown>;
      const response = err.response as Record<string, unknown> | undefined;
      const data = response?.data as Record<string, unknown> | undefined;
      
      return (data?.message as string) || (err.message as string) || defaultMsg;
    }
    if (error instanceof Error) return error.message;
    return defaultMsg;
  };

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await paymentMethodService.getAll();
      setMethods(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal mengambil data metode pembayaran"));
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
      toast.error(getErrorMessage(error, "Gagal menambah metode pembayaran"));
      return false;
    }
  };

  const updateMethod = async (id: number, data: { name?: string; is_active?: boolean }) => {
    try {
      await paymentMethodService.update(id, data);
      await fetchMethods();
      toast.success("Metode pembayaran diperbarui");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memperbarui metode pembayaran"));
      return false;
    }
  };

  const deleteMethod = async (id: number) => {
    try {
      await paymentMethodService.delete(id);
      await fetchMethods();
      toast.success("Metode pembayaran dihapus");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus metode pembayaran"));
      return false;
    }
  };

  return { methods, isLoading, fetchMethods, createMethod, updateMethod, deleteMethod };
};