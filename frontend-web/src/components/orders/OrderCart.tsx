"use client";

import { useMemo, useState } from "react";
import { Banknote, ChefHat, ScrollText, Settings, CheckCircle2, Minus, Plus, Trash2 } from "lucide-react";
import { formatRupiah } from "@/utils/format";
import { CartItem } from "@/types";
import EditOrderItemModal from "./EditOrderItemModal"; 
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useTransaction } from "@/hooks/useTransaction";

interface OrderCartProps {
  variant: "kasir" | "pelayan";
  cartItems: CartItem[];
  isProcessing: boolean;
  totals?: {
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
  };
  onSave: () => void;
  onCheckout: () => void;
  onUpdateQuantity: (uniqueId: string, delta: number) => void;
  onUpdateNote: (uniqueId: string, note: string) => void;
  onToggleHalf: (uniqueId: string) => void;
  onRemove: (uniqueId: string) => void;
  onRefresh?: () => void;
}

export default function OrderCart({
  variant,
  cartItems,
  isProcessing,
  totals,
  onSave,
  onCheckout,
  onUpdateQuantity,
  onUpdateNote,
  onToggleHalf,
  onRemove,
  onRefresh
}: OrderCartProps) {
  const params = useParams();
  const transactionId = params.id as string;
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { updateTransactionItemStatus } = useTransaction();

  const unsavedItems = cartItems.filter((item) => !item.is_saved);
  
  const { savedBatches } = useMemo(() => {
    const saved = cartItems.filter((item) => item.is_saved);
    const batches = saved.reduce((acc: Record<number, CartItem[]>, item: CartItem) => {
      const bNum = Number(item.batch_number) || 1;
      if (!acc[bNum]) acc[bNum] = [];
      acc[bNum].push(item);
      return acc;
    }, {});
    return { savedBatches: batches };
  }, [cartItems]);

  const handleToggleStatus = async (item: CartItem) => {
    if (!item.id || !transactionId || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const newStatus = item.serve_status === 'cooking' ? 'served' : 'cooking';

      await updateTransactionItemStatus(transactionId as string, item.id!.toString(), newStatus);

      toast.success(`Status ${item.menu.name} diperbarui`);

      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error Client Side - Gagal mengubah status item: ", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <aside className="w-full lg:w-96 bg-white border-l border-gray-100 flex flex-col h-full shadow-xl">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-black text-gray-800 flex items-center gap-2">
          <ScrollText size={20} className="text-blue-600" /> DETAIL PESANAN
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3 py-10">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <ScrollText size={32} className="text-gray-300" />
            </div>
            <div>
              <p className="font-bold text-gray-500">Keranjang Masih Kosong</p>
              <p className="text-xs mt-1 max-w-50 mx-auto">
                Silakan pilih menu dari daftar di sebelah kiri untuk mulai membuat pesanan.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* SECTION 1: PESANAN BARU (UNSAVED) */}
            {unsavedItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                  Pesanan Baru
                </h4>
                <div className="bg-blue-50/30 border border-blue-100 rounded-2xl overflow-hidden divide-y divide-blue-100 shadow-sm">
                  {unsavedItems.map((item) => (
                    <div key={item.unique_id} className="p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <h5 className="font-bold text-gray-800 text-sm">{item.menu.name}</h5>
                        {variant === "kasir" && (
                          <p className="text-xs font-bold text-blue-600">
                            {formatRupiah((item.is_half_portion ? item.menu.half_price || 0 : item.menu.price) * item.quantity)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center bg-white border border-blue-100 rounded-lg p-0.5">
                          <button onClick={() => onUpdateQuantity(item.unique_id, -1)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Minus size={14} /></button>
                          <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.unique_id, 1)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => onRemove(item.unique_id)} className="text-red-400 hover:text-red-600 p-2 bg-white border border-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Catatan..." 
                          value={item.note || ""} 
                          onChange={(e) => onUpdateNote(item.unique_id, e.target.value)} 
                          className="flex-1 text-[11px] p-2 bg-white border border-blue-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-400 italic" 
                        />
                        {item.menu.half_price && (
                          <button 
                            onClick={() => onToggleHalf(item.unique_id)} 
                            className={`text-[9px] px-2 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${item.is_half_portion ? "bg-blue-600 text-white" : "bg-white border border-blue-100 text-gray-400"}`}
                          >
                            1/2 PORSI
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {Object.entries(savedBatches).map(([batchNum, items]) => (
              <div key={batchNum} className="space-y-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">BATCH {batchNum}</h4>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 shadow-sm">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-gray-800 text-sm leading-tight">
                          {item.quantity}x {item.menu.name}
                          {item.is_half_portion && <span className="ml-1 text-[9px] text-red-600 font-bold uppercase">[1/2]</span>}
                        </h5>
                        {variant === "kasir" && (
                          <p className="text-[11px] font-bold text-gray-400">
                            {formatRupiah(item.price_at_time * item.quantity)}
                          </p>
                        )}
                        {item.note && <p className="text-[10px] text-orange-400 italic font-bold"># {item.note}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleStatus(item)}
                          disabled={isUpdatingStatus}
                          className={`cursor-pointer flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black border transition-all ${
                            item.serve_status === 'served' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                          }`}
                        >
                          {item.serve_status === 'served' ? <CheckCircle2 size={10}/> : <ChefHat size={10}/>}
                          {item.serve_status === 'served' ? 'SERVED' : 'COOKING'}
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          disabled={item.serve_status === 'served'}
                          className={`p-1.5 rounded-lg transition-colors ${item.serve_status === 'served' ? 'text-gray-200 cursor-not-allowed' : 'cursor-pointer text-gray-400 hover:bg-gray-100 hover:text-blue-600'}`}
                        >
                          <Settings size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
        {variant === "kasir" && totals && (
          <div className="space-y-1 pb-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span className="font-bold">{formatRupiah(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Pajak (10%)</span>
              <span className="font-bold">{formatRupiah(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg pt-1 border-t border-dashed border-gray-300">
              <span className="font-black text-gray-800">TOTAL</span>
              <span className="font-black text-blue-600">{formatRupiah(totals.grandTotal)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onSave} disabled={unsavedItems.length === 0 || isProcessing} className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-30 rounded-xl font-bold transition-all"><ChefHat size={18} /> Simpan</button>
          <button onClick={onCheckout} disabled={cartItems.length === 0} className="flex items-center justify-center gap-2 py-3 bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-30 rounded-xl font-bold transition-all">
            {variant === "kasir" ? <Banknote size={18} /> : <ScrollText size={18} />}
            {variant === "kasir" ? "Checkout" : "Opsi / Cetak"}
          </button>
        </div>
      </div>

      <EditOrderItemModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        transactionId={transactionId}
        onSuccess={onRefresh}
      />
    </aside>
  );
}