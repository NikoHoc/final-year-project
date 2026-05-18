import { useState, useCallback } from "react";
import { transactionService } from "@/services/transactionService";
import { 
  Transaction, 
  CreateTransactionPayload, 
  AddItemsPayload 
} from "@/types";
import { handleApiError } from "@/utils/errorHandler";

export const useTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAllTransactions = useCallback(async (depotId: number, status?: 'active' | 'completed') => {
    setIsLoading(true);
    try {
      const data = await transactionService.getAll(depotId, { status });
      return data as Transaction[];
    } catch (error) {
      handleApiError(error, "Gagal memuat daftar transaksi");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransactionById = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await transactionService.getById(id);
      return data as Transaction;
    } catch (error) {
      handleApiError(error, "Gagal memuat transaksi");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTransaction = async (data: CreateTransactionPayload) => {
    setIsProcessing(true);
    try {
      const res = await transactionService.create(data);
      return res;
    } catch (error) {
      handleApiError(error, "Gagal membuat transaksi baru");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const addItems = async (id: string, payload: AddItemsPayload) => {
    setIsProcessing(true);
    try {
      const res = await transactionService.addItems(id, payload);
      return res;
    } catch (error) {
      handleApiError(error, "Gagal menambahkan item transaksi");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCustomerName = async (transactionId: string, name: string) => {
    setIsProcessing(true);
    try {
      const res = await transactionService.updateCustomerName(transactionId, name);
      return res;
    } catch (error) {
      handleApiError(error, "Gagal memperbarui nama pelanggan");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateTransactionStatus = async (id: string, data: { order_status?: string; payment_status?: string }) => {
    setIsProcessing(true);
    try {
      const res = await transactionService.updateTransactionStatus(id, data);
      return res;
    } catch (error) {
      handleApiError(error, "Gagal memperbarui status transaksi");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (transactionId: string, payload: {
    payment_method_id: number;
    paid_amount: number;
    change_amount: number;
    items: { transaction_item_id: number, quantity: number, price_at_time: number }[];
  }) => {
    setIsProcessing(true);
    try {
      const res = await transactionService.processPayment(transactionId, payload);
      return res;
    } catch (error) {
      handleApiError(error, "Gagal memproses pembayaran");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateTransactionItemStatus = async (transactionId: string, itemId: string, status: 'cooking' | 'served') => {
    setIsProcessing(true);
    try {
      const res = await transactionService.updateTransactionItemStatus(transactionId, itemId, status);
      return res;
    } catch (error) {
      handleApiError(error, "Gagal memperbarui status item");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateItemQuantity = async (transactionId: string, itemId: string, quantity: number) => {
    setIsProcessing(true);
    try {
      const res = await transactionService.updateItemQuantity(transactionId, itemId, quantity);
      return res;
    } catch (error) {
      handleApiError(error, "Gagal memperbarui jumlah item");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteTransactionItem = async (transactionId: string, itemId: string) => {
    setIsProcessing(true);
    try {
      const res = await transactionService.deleteTransactionItem(transactionId, itemId);
      return res;
    } catch (error) {
      handleApiError(error, "Gagal menghapus item");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isLoading,
    isProcessing,
    fetchAllTransactions,
    fetchTransactionById,
    createTransaction,
    addItems,
    updateCustomerName,
    updateTransactionStatus,
    processPayment,
    updateTransactionItemStatus,
    updateItemQuantity,
    deleteTransactionItem,
  };
};