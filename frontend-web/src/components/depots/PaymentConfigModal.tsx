"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Depot } from "@/types";

interface PaymentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  depot: Depot | null;
  onSubmit: (data: {
    merchant_id: string;
    midtrans_client_key: string;
    midtrans_server_key: string;
  }) => Promise<boolean>;
}

export default function PaymentConfigModal({
  isOpen,
  onClose,
  depot,
  onSubmit,
}: PaymentConfigModalProps) {
  const [merchantId, setMerchantId] = useState("");
  const [clientKey, setClientKey] = useState("");
  const [serverKey, setServerKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMerchantId("");
      setClientKey("");
      setServerKey("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await onSubmit({
        merchant_id: merchantId,
        midtrans_client_key: clientKey,
        midtrans_server_key: serverKey,
      });
      if (success) onClose();
    } catch (error) {
      console.error("Gagal menyimpan data user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!depot) return null;
  const isRegistered = !!depot.payment_configs;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isRegistered
          ? `Edit Kredensial Midtrans: ${depot.name}`
          : `Setup Midtrans: ${depot.name}`
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            Silakan masukkan kredensial Production/Sandbox dari dashboard
            Midtrans Anda. Kunci ini akan digunakan untuk memproses pembayaran
            *online* khusus di cabang ini.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Merchant ID
          </label>
          <input
            type="text"
            required
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-black"
            placeholder="Contoh: G123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Key (Public)
          </label>
          <input
            type="text"
            required
            value={clientKey}
            onChange={(e) => setClientKey(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-black"
            placeholder="SB-Mid-client-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Server Key (Secret)
          </label>
          <input
            type="password"
            required
            value={serverKey}
            onChange={(e) => setServerKey(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-black"
            placeholder="SB-Mid-server-..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !merchantId || !clientKey || !serverKey}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
              isSubmitting || !merchantId || !clientKey || !serverKey
                ? "bg-emerald-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isSubmitting
              ? "Menyimpan..."
              : isRegistered
                ? "Perbarui Kredensial"
                : "Simpan Kredensial"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
