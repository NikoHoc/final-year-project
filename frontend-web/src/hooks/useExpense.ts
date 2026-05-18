import { useState, useCallback } from "react";
import { expenseService } from "@/services/expenseService";
import { Expense, ExpensePayload } from "@/types";
import { handleApiError } from "@/utils/errorHandler";
import toast from "react-hot-toast";

export const useExpense = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchExpenses = useCallback(async (depotId: number, startDate?: string, endDate?: string) => {
    setIsLoading(true);
    try {
      const res = await expenseService.getAllByDepot(depotId, startDate, endDate);
      setExpenses(res.data || []); 
      return res.data as Expense[];
    } catch (error) {
      handleApiError(error, "Gagal memuat data pengeluaran");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExpense = async (data: ExpensePayload) => {
    setIsProcessing(true);
    try {
      const res = await expenseService.create(data);
      toast.success(res.message || "Pengeluaran berhasil dicatat");
      return res;
    } catch (error) {
      handleApiError(error, "Gagal mencatat pengeluaran");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateExpense = async (id: number, data: Partial<ExpensePayload>) => {
    setIsProcessing(true);
    try {
      const res = await expenseService.update(id, data);
      toast.success(res.message || "Data pengeluaran berhasil diperbarui");
      return res;
    } catch (error) {
      handleApiError(error, "Gagal memperbarui pengeluaran");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteExpense = async (id: number) => {
    setIsProcessing(true);
    try {
      const res = await expenseService.delete(id);
      toast.success(res.message || "Data pengeluaran berhasil dihapus");
      return res;
    } catch (error) {
      handleApiError(error, "Gagal menghapus pengeluaran");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    expenses,
    isLoading,
    isProcessing,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};