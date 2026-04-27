"use client";

import { useState, useMemo } from "react";
import { Printer, ClipboardList, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { CartItem } from "@/hooks/useCart";

interface CheckoutOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  tableId: string | null;
}

type FilterType = "all" | "food" | "drink";

export default function CheckoutOrderModal({
  isOpen,
  onClose,
  cartItems,
  tableId,
}: CheckoutOrderModalProps) {
  const [selectedBatch, setSelectedBatch] = useState<number | "all">("all");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const { savedBatches } = useMemo(() => {
    const saved = cartItems.filter((item) => item.is_saved);
    const batches = saved.reduce(
      (acc: Record<number, CartItem[]>, item: CartItem) => {
        const bNum = Number(item.batch_number) || 1;
        if (!acc[bNum]) acc[bNum] = [];
        acc[bNum].push(item);
        return acc;
      },
      {},
    );
    return { savedBatches: batches };
  }, [cartItems]);

  const previewItems = useMemo(() => {
    const itemsToFilter =
      selectedBatch === "all"
        ? cartItems.filter((i) => i.is_saved)
        : savedBatches[selectedBatch as number] || [];

    return itemsToFilter.filter((item) => {
      if (filterType === "all") return true;
      const catType = item.menu?.categories?.type;
      if (filterType === "food") return catType === "food";
      if (filterType === "drink") return catType === "drink";
      return true;
    });
  }, [selectedBatch, filterType, savedBatches, cartItems]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checkout Pesanan Pelanggan"
      maxWidth="6xl"
    >
      <div className="flex h-[80vh] -mx-6 -my-6 overflow-hidden">
        <div className="w-1/3 border-r border-gray-100 p-6 overflow-y-auto bg-white space-y-4">
          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Printer className="text-blue-600" size={20} /> Tiket Dapur
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Meja {tableId} • Pilih Pesanan
            </p>
            <div className="h-px border-t border-dashed border-gray-400 my-3"></div>
          </div>

          {Object.keys(savedBatches).map((bNumStr) => {
            const bNum = Number(bNumStr);
            return (
              <div
                key={bNum}
                onClick={() => setSelectedBatch(bNum)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedBatch === bNum
                    ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-100 text-white"
                    : "bg-gray-50 border border-gray-200 rounded-xl text-gray-800 hover:border-blue-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">Batch #{bNum}</p>
                    <p
                      className={`text-[10px] ${selectedBatch === bNum ? "text-blue-100" : "text-gray-400"}`}
                    >
                      {savedBatches[bNum].length} Menu
                    </p>
                  </div>
                  <CheckCircle2
                    size={18}
                    className={
                      selectedBatch === bNum ? "text-blue-200" : "text-gray-200"
                    }
                  />
                </div>
              </div>
            );
          })}
          <div className="h-px border-t border-dashed border-gray-400 my-3"></div>
          <button
            onClick={() => setSelectedBatch("all")}
            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 font-bold transition-all mt-4 ${
              selectedBatch === "all"
                ? "bg-gray-800 border-gray-800 text-white shadow-lg"
                : "bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:border-gray-200"
            }`}
          >
            <ClipboardList size={18} /> Semua Batch
          </button>
        </div>

        {/* PANEL KANAN: Abu-abu Terang (Agar Kertas Putih Terlihat Kontras) */}
        <div className="w-2/3 p-8 flex flex-col h-full bg-gray-100/80">
          <div className="flex bg-gray-200/50 p-1 rounded-xl w-fit mb-6">
            {["all", "food", "drink"].map((id) => (
              <button
                key={id}
                onClick={() => setFilterType(id as FilterType)}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterType === id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                {id === "all" ? "Semua" : id === "food" ? "Makanan" : "Minuman"}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white border border-gray-200 rounded-sm shadow-xl overflow-y-auto p-10 font-mono text-xs max-w-95 mx-auto w-full relative">
            <div className="text-center mb-6">
              <p className="font-bold text-sm uppercase tracking-widest">
                KITCHEN TICKET
              </p>
              <div className="h-px border-t border-dashed border-gray-400 my-3"></div>
              <p className="font-bold text-base">MEJA: {tableId}</p>
              <p className="uppercase">
                Batch: {selectedBatch === "all" ? "SEMUA" : `#${selectedBatch}`}
              </p>
              <p className="text-[10px] opacity-60">
                {new Date().toLocaleString("id-ID")}
              </p>
              <div className="h-px border-t border-dashed border-gray-400 my-3"></div>
            </div>

            <div className="space-y-4">
              {previewItems.map((item) => (
                <div key={item.unique_id} className="pb-1">
                  <div className="flex gap-3">
                    <span className="font-bold text-sm">{item.quantity}x</span>
                    <span className="font-bold text-sm uppercase flex-1">
                      {item.menu.name}
                    </span>
                  </div>
                  <div className="pl-8 space-y-1">
                    {item.is_half_portion && (
                      <p className="text-[10px] font-black border-l-2 border-black pl-2">
                        1/2 PORSI
                      </p>
                    )}
                    {item.note && (
                      <p className="text-[10px] italic bg-gray-100 p-1">
                        Note: {item.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-4 border-t border-dashed border-gray-300 text-center text-[10px] text-gray-400">
              -- SELESAI --
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all"
            >
              Tutup
            </button>
            <button
              onClick={() => window.print()}
              disabled={previewItems.length === 0}
              className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              <Printer size={18} /> CETAK TIKET
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
