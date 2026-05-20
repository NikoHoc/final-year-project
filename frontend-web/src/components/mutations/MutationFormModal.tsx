"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { useStock } from "@/hooks/useStock";
import { useDepots } from "@/hooks/useDepot";
import { StockMutation, MutationPayload } from "@/types";

interface MutationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  depotId: number | null;
  initialData?: StockMutation | null;
  onSuccess: () => void;
}

export default function MutationFormModal({ isOpen, onClose, depotId, initialData, onSuccess }: MutationFormModalProps) {
  const { createMutation, updateMutation, isProcessing } = useStock();
  const { depots, fetchDepots } = useDepots();

  const [formData, setFormData] = useState<Partial<MutationPayload>>({
    item_name: "",
    requested_quantity: 1,
    unit: "",
    provider_id: 0,
    requester_notes: "",
  });

  useEffect(() => {
    if (isOpen) fetchDepots();
  }, [isOpen, fetchDepots]);

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        item_name: initialData.item_name,
        requested_quantity: initialData.requested_quantity,
        unit: initialData.unit || "",
        provider_id: initialData.provider_id,
        requester_notes: initialData.requester_notes || "",
      });
    } else {
      setFormData({
        item_name: "",
        requested_quantity: 1,
        unit: "",
        provider_id: 0,
        requester_notes: "",
      });
    }
  }, [initialData, isOpen]);

  const availableProviders = depots.filter((d) => d.id !== depotId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depotId) return;
    if (formData.provider_id === 0) {
      alert("Pilih depot penyedia terlebih dahulu!");
      return;
    }

    try {
      const payload = { ...formData, requester_id: depotId } as MutationPayload;
      
      if (initialData) {
        await updateMutation(initialData.id, payload);
      } else {
        await createMutation(payload);
      }
      onSuccess();
      onClose();
    } catch {
      // Error ditangani hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Ubah Permintaan" : "Buat Permintaan Barang"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Nama Barang</label>
          <input
            type="text" required value={formData.item_name}
            onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
            placeholder="Contoh: Tepung Terigu"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Jumlah Diminta</label>
            <input
              type="number" step="0.01" required min="0.1" value={formData.requested_quantity ?? ""}
              onChange={(e) => setFormData({ ...formData, requested_quantity: e.target.value === "" ? 0 : parseFloat(e.target.value), })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Satuan</label>
            <input
              type="text" required value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
              placeholder="kg / box / pcs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Minta Dari (Depot Penyedia)</label>
          <select
            required value={formData.provider_id}
            onChange={(e) => setFormData({ ...formData, provider_id: parseInt(e.target.value) })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
          >
            <option value={0} disabled>-- Pilih Depot Penyedia --</option>
            {availableProviders.map((depot) => (
              <option key={depot.id} value={depot.id}>{depot.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Keterangan (Opsional)</label>
          <textarea
            value={formData.requester_notes}
            onChange={(e) => setFormData({ ...formData, requester_notes: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 min-h-20"
            placeholder="Contoh: Stok menipis untuk event akhir pekan"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-50">Batal</button>
          <button type="submit" disabled={isProcessing} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
            {isProcessing ? "Menyimpan..." : initialData ? "Simpan" : "Kirim Permintaan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}