"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { CartItem } from "@/types";
import { Minus, Plus, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useTransaction } from "@/hooks/useTransaction";

interface EditOrderItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
  transactionId: string;
  onSuccess?: () => void;
}

export default function EditOrderItemModal({ isOpen, onClose, item, transactionId, onSuccess }: EditOrderItemModalProps) {
  const [cancelQty, setCancelQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateItemQuantity, deleteTransactionItem } = useTransaction();

  useEffect(() => {
    if (isOpen) setCancelQty(1);
  }, [isOpen]);

  if (!item) return null;

  const maxCancelable = item.quantity - item.quantity_paid;

  const handleUpdateQuantity = async () => {
    if (!item.id || !transactionId) return;
    setIsSubmitting(true);
    try {
      const newQty = item.quantity - cancelQty;
      
      if (newQty === 0) {
        await deleteTransactionItem(transactionId, item.id.toString());
      } else {
        await updateItemQuantity(transactionId, item.id.toString(), newQty);
      }
      
      toast.success(`${cancelQty} porsi berhasil dibatalkan`);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error Client Side - Gagal memperbarui pesanan: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!item.id || !transactionId) return;
    setIsSubmitting(true);
    try {
      if (item.quantity_paid === 0) {
        await deleteTransactionItem(transactionId, item.id.toString());
      } else {
        await updateItemQuantity(transactionId, item.id.toString(), item.quantity_paid);
      }
      
      toast.success("Sisa pesanan berhasil dibatalkan sepenuhnya");
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error Client Side - Gagal membatalkan pesanan: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ubah / Batal Pesanan">
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-yellow-800">Pastikan Lapor Dapur!</p>
            <p className="text-xs text-yellow-700 mt-1">
              Hanya batalkan pesanan jika Anda sudah mengkonfirmasi ke dapur bahwa makanan ini <b>belum dimasak</b>.
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 text-lg">{item.menu.name}</h3>
          <p className="text-sm text-gray-500">Total dipesan: {item.quantity} porsi</p>
          {item.quantity_paid > 0 && (
            <p className="text-xs font-bold text-green-600 mt-1">
              (Telah dibayar: {item.quantity_paid} porsi. Tidak bisa dibatalkan)
            </p>
          )}
        </div>

        {maxCancelable > 0 ? (
          <>
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">Berapa porsi yang ingin dibatalkan?</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCancelQty(Math.max(1, cancelQty - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Minus size={18} />
                </button>
                <span className="font-black text-xl w-8 text-center">{cancelQty}</span>
                <button 
                  onClick={() => setCancelQty(Math.min(maxCancelable, cancelQty + 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Plus size={18} />
                </button>
              </div>
              <button 
                onClick={handleUpdateQuantity}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
              >
                Simpan Perubahan
              </button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400 font-bold uppercase">Atau</span></div>
            </div>

            <button 
              onClick={handleDeleteAll}
              disabled={isSubmitting}
              className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 flex justify-center items-center gap-2"
            >
              <Trash2 size={18} /> Hapus Semua Sisa Porsi
            </button>
          </>
        ) : (
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <p className="text-sm font-bold text-gray-600">Semua porsi item ini sudah dibayar.</p>
            <p className="text-xs text-gray-500">Tidak ada tindakan yang bisa dilakukan.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}