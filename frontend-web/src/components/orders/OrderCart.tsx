"use client";

import { useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  Banknote,
  ChefHat,
  ScrollText,
} from "lucide-react";
import { formatRupiah } from "@/utils/format";
import { CartItem } from "@/hooks/useCart";

interface OrderCartProps {
  variant: "kasir" | "pelayan";
  cartItems: CartItem[];
  tableId: string | null;
  orderType?: string;
  isProcessing: boolean;
  totals?: {
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
  };
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateNote: (id: string, note: string) => void;
  onToggleHalf: (id: string) => void;
  onRemove: (id: string) => void;
  onSave: () => void;
  onCheckout: () => void;
}

export default function OrderCart({
  variant,
  cartItems,
  tableId,
  orderType = "onsite",
  isProcessing,
  totals,
  onUpdateQuantity,
  onUpdateNote,
  onToggleHalf,
  onRemove,
  onSave,
  onCheckout,
}: OrderCartProps) {
  
  const { unsavedItems, savedBatches } = useMemo(() => {
    const unsaved = cartItems.filter((item) => !item.is_saved);
    const saved = cartItems.filter((item) => item.is_saved);

    const batches = saved.reduce((acc: Record<number, CartItem[]>, item: CartItem) => {
    const batchNumber = Number(item.batch_number) || 1; 

    if (!acc[batchNumber]) acc[batchNumber] = [];
    acc[batchNumber].push(item);

    return acc;
    }, {});

    return { unsavedItems: unsaved, savedBatches: batches };
  }, [cartItems]);

  const renderItem = (item: CartItem, isSaved: boolean) => (
    <div
      key={item.unique_id}
      className={`flex gap-3 pb-3 border-b border-gray-100 last:border-0 ${
        isSaved ? "opacity-70" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-gray-800 truncate">
          {item.menu.name || "Menu Tidak Diketahui"}
        </h4>
        
        {variant === "kasir" && (
          <p className="text-blue-600 font-semibold text-sm">
            {formatRupiah(
              item.is_half_portion && item.menu?.half_price
                ? item.menu.half_price
                : item.menu?.price || 0
            )}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <Edit3 size={14} className="text-gray-400" />
          <input
            type="text"
            placeholder={isSaved ? "Catatan terkunci" : "Tambah catatan..."}
            value={item.note || ""}
            onChange={(e) => onUpdateNote(item.unique_id, e.target.value)}
            disabled={isSaved}
            className={`flex-1 text-xs border-b outline-none pb-1 bg-transparent ${
              isSaved
                ? "border-transparent text-gray-500 cursor-not-allowed"
                : "border-gray-200 focus:border-blue-500"
            }`}
          />
        </div>

        {item.menu?.half_price && (
          <button
            onClick={() => onToggleHalf(item.unique_id)}
            disabled={isSaved}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-blue-600"
          >
            {item.is_half_portion ? (
              <CheckSquare size={14} className="text-blue-600" />
            ) : (
              <Square size={14} />
            )}
            Porsi 1/2
          </button>
        )}
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(item.unique_id)}
          disabled={isSaved}
          className={`p-1 ${
            isSaved
              ? "text-gray-200 cursor-not-allowed"
              : "text-red-400 hover:text-red-600"
          }`}
        >
          <Trash2 size={16} />
        </button>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => onUpdateQuantity(item.unique_id, -1)}
            disabled={isSaved}
            className={`w-6 h-6 flex items-center justify-center rounded shadow-sm ${
              isSaved
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <Minus size={14} />
          </button>

          <span
            className={`w-6 text-center text-sm font-bold ${
              isSaved ? "text-gray-500" : "text-gray-800"
            }`}
          >
            {item.quantity}
          </span>

          <button
            onClick={() => onUpdateQuantity(item.unique_id, 1)}
            disabled={isSaved}
            className={`w-6 h-6 flex items-center justify-center rounded shadow-sm ${
              isSaved
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full lg:w-100 xl:w-112.5 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden shrink-0 h-full">
      <div
        className={`p-4 flex justify-between items-center shrink-0 ${
          variant === "kasir"
            ? "bg-gray-900 text-white"
            : "bg-blue-50 text-blue-900 border-b border-blue-100"
        }`}
      >
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2">
            {variant === "pelayan" && <ScrollText size={20} />}
            {variant === "kasir" ? "Preview Pesanan" : "Draf Pesanan"} #{tableId || "Takeaway"}
          </h2>
          <p className={`text-xs mt-0.5 ${variant === "kasir" ? "text-gray-400" : "text-blue-600/70"}`}>
            {orderType === "onsite" ? "Dine-in" : "Bungkus"}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            variant === "kasir"
              ? "bg-gray-800 border-gray-700"
              : "bg-blue-100 border-blue-200 text-blue-700 font-bold"
          }`}
        >
          {unsavedItems.length > 0 ? `${unsavedItems.length} Item Baru` : "Tidak ada draf"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Search size={48} className="mb-4 opacity-20" />
            <p>{variant === "kasir" ? "Keranjang masih kosong" : "Belum ada pesanan dicatat"}</p>
            <p className="text-xs mt-1">Klik menu di sebelah kiri untuk menambah</p>
          </div>
        ) : (
          <>
            {unsavedItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Pesanan Baru
                </h3>
                <div className="bg-blue-50/30 p-3 rounded-xl border border-blue-100 space-y-3">
                  {unsavedItems.map((item) => renderItem(item, false))}
                </div>
              </div>
            )}

            {Object.keys(savedBatches).map((batchNumber) => {
              const batchItems = savedBatches[Number(batchNumber)];

              const batchTime = batchItems[0]?.created_at 
                ? new Date(batchItems[0].created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                : "";

              return (
                <div key={batchNumber} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      ✓ Batch {batchNumber} {batchTime && `(${batchTime})`}
                    </h3>
                    <div className="h-px bg-gray-100 flex-1"></div>
                  </div>
                  <div className="space-y-3">
                    {batchItems.map((item) => renderItem(item, true))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
        {variant === "kasir" && totals && (
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">{formatRupiah(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600 opacity-70">
              <span>Pajak (10%)</span>
              <span className="font-semibold">{formatRupiah(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-900 pt-2 border-t border-gray-200 mt-2">
              <span className="font-bold text-base">Total Bayar</span>
              <span className="font-black text-xl text-blue-600">
                {formatRupiah(totals.grandTotal)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {orderType === "onsite" && (
            <button
              onClick={onSave}
              disabled={unsavedItems.length === 0 || isProcessing}
              className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all"
            >
              <ChefHat size={18} /> Simpan
            </button>
          )}
          <button
            onClick={onCheckout}
            disabled={cartItems.length === 0 || (variant === "kasir" && isProcessing)}
            className={`flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all ${
              variant === "kasir"
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                : "bg-gray-800 text-white hover:bg-gray-900"
            } ${orderType !== "onsite" ? "col-span-2" : ""}`}
          >
            {variant === "kasir" ? <Banknote size={18} /> : <ScrollText size={18} />}
            {variant === "kasir" ? "Checkout" : "Cetak / Opsi"}
          </button>
        </div>
      </div>
    </div>
  );
}