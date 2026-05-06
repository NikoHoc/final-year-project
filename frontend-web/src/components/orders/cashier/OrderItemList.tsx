"use client";

import { CheckSquare, Square, Minus, Plus, CheckCircle2, Eye } from "lucide-react";
import { formatRupiah } from "@/utils/format";
import { CheckoutItem } from "./CheckoutPaymentModal";
import { PaidSegment } from "./ReceiptPreview";

interface OrderItemListProps {
  isAllFullyPaid: boolean;
  selectAll: boolean;
  toggleSelectAll: () => void;
  unpaidItems: CheckoutItem[];
  paidSegments: PaidSegment[];
  handleRemoveFromNota: (id: string) => void;
  handleAddToNota: (id: string) => void;
  setViewingSegmentId: (id: number | null) => void;
  setShowMasterReceipt: (show: boolean) => void;
}

export default function OrderItemList({
  isAllFullyPaid,
  selectAll,
  toggleSelectAll,
  unpaidItems,
  paidSegments,
  handleRemoveFromNota,
  handleAddToNota,
  setViewingSegmentId,
  setShowMasterReceipt,
}: OrderItemListProps) {
  return (
    <>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10 shrink-0">
        <h3 className="font-bold text-gray-800">Daftar Pesanan Meja</h3>
        {!isAllFullyPaid && (
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600">
            {selectAll ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />} Pilih Semua Sisa
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!isAllFullyPaid ? (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Belum Dibayar</h4>
            {unpaidItems.map((item) => {
              const qtyAvailable = item.qtyTotal - item.qtyPaid - item.qtyInNota;
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-bold text-gray-800 text-sm truncate">
                      {item.name}
                      {item.is_half_portion && (
                        <span className="ml-2 text-[9px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          1/2 Porsi
                        </span>
                      )}
                    </h4>
                    <p className="text-blue-600 font-semibold text-sm">{formatRupiah(item.price)}</p>
                    {/* CATATAN (NOTE) */}
                    {item.note && (
                      <p className="text-[10px] text-orange-500 italic mt-0.5 truncate">
                        # {item.note}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 mb-1">Sisa: {qtyAvailable}</span>
                    <div className={`flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 ${selectAll ? "opacity-50" : ""}`}>
                      <button onClick={() => handleRemoveFromNota(item.id)} disabled={item.qtyInNota === 0 || selectAll} className="w-7 h-7 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed">
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-blue-600">{item.qtyInNota}</span>
                      <button onClick={() => handleAddToNota(item.id)} disabled={qtyAvailable === 0 || selectAll} className="w-7 h-7 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-green-500 bg-green-50 rounded-xl border border-green-100">
            <CheckCircle2 size={40} className="mb-2" />
            <p className="font-bold">Semua Item Sudah Dibayar!</p>
          </div>
        )}
        {paidSegments.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckCircle2 size={14} /> Sudah Lunas
            </h4>
            {paidSegments.map((segment) => (
              <div key={segment.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                  <div>
                    <h5 className="font-bold text-sm text-gray-800">{segment.customerName}</h5>
                    <p className="text-xs text-gray-500">{segment.method} • {segment.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{formatRupiah(segment.grandTotal)}</p>
                    <button onClick={() => { setViewingSegmentId(segment.id); setShowMasterReceipt(false); }} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 mt-1">
                      <Eye size={14} /> Lihat Nota
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}