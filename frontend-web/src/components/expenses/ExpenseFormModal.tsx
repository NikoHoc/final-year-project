"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { useExpense } from "@/hooks/useExpense";
import { Expense, ExpensePayload } from "@/types";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  depotId: number | null;
  initialData?: Expense | null;
  onSuccess: () => void;
}

export default function ExpenseFormModal({
  isOpen,
  onClose,
  depotId,
  initialData,
  onSuccess,
}: ExpenseFormModalProps) {
  const { createExpense, updateExpense, isProcessing } = useExpense();

  const [formData, setFormData] = useState<Partial<ExpensePayload>>({
    item_name: "",
    amount: 0,
    quantity: 1,
    unit: "",
    expense_date: new Date().toISOString().split("T")[0],
    note: "",
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        item_name: initialData.item_name,
        amount: initialData.amount,
        quantity: initialData.quantity,
        unit: initialData.unit,
        expense_date: initialData.expense_date,
        note: initialData.note || "",
      });
    } else {
      setFormData({
        item_name: "",
        amount: 0,
        quantity: 1,
        unit: "",
        expense_date: new Date().toISOString().split("T")[0],
        note: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depotId) return;

    try {
      const payload = { ...formData, depot_id: depotId } as ExpensePayload;

      if (initialData) {
        await updateExpense(initialData.id, payload);
      } else {
        await createExpense(payload);
      }

      onSuccess();
      onClose();
    } catch {
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData ? "Ubah Catatan Pengeluaran" : "Catat Pengeluaran Baru"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">
            Nama Barang / Keperluan
          </label>
          <input
            type="text"
            required
            value={formData.item_name}
            onChange={(e) =>
              setFormData({ ...formData, item_name: e.target.value })
            }
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all"
            placeholder="Contoh: Beli Ayam Fillet 5kg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Jumlah</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseFloat(e.target.value),
                })
              }
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Satuan</label>
            <input
              type="text"
              required
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all"
              placeholder="kg / box / pcs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Total Harga (Rp)
            </label>
            <input
              type="number"
              required
              value={formData.amount ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value === "" ? 0 : parseInt(e.target.value)})
              }
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Tanggal</label>
            <input
              type="date"
              required
              value={formData.expense_date}
              onChange={(e) =>
                setFormData({ ...formData, expense_date: e.target.value })
              }
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">
            Catatan (Opsional)
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all min-h-25"
            placeholder="Keterangan tambahan..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
          >
            {isProcessing
              ? "Menyimpan..."
              : initialData
                ? "Simpan Perubahan"
                : "Catat Sekarang"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
