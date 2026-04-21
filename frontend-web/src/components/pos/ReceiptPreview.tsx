"use client";

import React from "react";
import { Printer, CheckCircle2, ArrowLeftCircle, Receipt } from "lucide-react";

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface PaidSegment {
  id: number;
  customerName: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  method: string;
  time: string;
  paidAmount: number;   
  changeAmount: number;
}

export interface ReceiptData {
  items: ReceiptItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  method: string | null;
  paid: number;
  change: number;
  time: string;
  status: string;
}

interface ReceiptPreviewProps {
  receiptRef: React.RefObject<HTMLDivElement | null>;
  rcp: ReceiptData;
  dummyTableId: string;
  dummyTransactionId: string;
  activeSegmentToView: PaidSegment | null;
  showMasterReceipt: boolean;
  setShowMasterReceipt: (show: boolean) => void;
  setViewingSegmentId: (id: number | null) => void;
  isAllFullyPaid: boolean;
  hasPaidSegments: boolean;
  handlePrintReceipt: () => void;
  handleFinalizeTransaction: () => void;
}

export default function ReceiptPreview({
  receiptRef,
  rcp,
  dummyTableId,
  dummyTransactionId,
  activeSegmentToView,
  showMasterReceipt,
  setShowMasterReceipt,
  setViewingSegmentId,
  isAllFullyPaid,
  hasPaidSegments,
  handlePrintReceipt,
  handleFinalizeTransaction,
}: ReceiptPreviewProps) {
  return (
    <div className="w-full lg:w-[45%] bg-gray-100 p-6 flex flex-col items-center overflow-y-auto relative">
      {(activeSegmentToView || showMasterReceipt) && (
        <button
          onClick={() => {
            setViewingSegmentId(null);
            setShowMasterReceipt(false);
          }}
          className="absolute top-4 left-4 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm font-bold text-sm text-gray-700 hover:text-blue-600 z-10 border"
        >
          <ArrowLeftCircle size={16} /> Kembali ke Nota Aktif
        </button>
      )}

      <div
        ref={receiptRef}
        className={`w-full max-w-[320px] bg-white p-6 shadow-sm relative text-gray-800 ${
          rcp.status === "NOT PAID" ? "border-t-8 border-gray-800" : "border-t-8 border-green-500 mt-10"
        }`}
      >
        <div className="text-center section-gap border-b border-gray-300 pb-6">
          <h2 className="font-bold text-lg uppercase mb-1">Bakso Sapi Asli</h2>
          <p className="text-xs">Jl. Balikpapan No. 1, Kaltim</p>
          <p className="text-xs">Telp: 0812-3456-7890</p>
        </div>

        <div className="space-y-2 section-gap text-[11px] mt-4">
          <div className="flex justify-between"><span>No. TRX:</span> <span className="font-bold">{dummyTransactionId}</span></div>
          <div className="flex justify-between"><span>Waktu:</span> <span>{rcp.time}</span></div>
          <div className="flex justify-between"><span>Meja:</span> <span>{dummyTableId || "-"}</span></div>
        </div>

        <div className="border-t border-b border-dashed border-gray-400 py-4 section-gap space-y-2 text-xs mt-4">
          {rcp.items.length === 0 ? (
            <div className="text-center py-4 text-gray-400 italic">Belum ada pesanan</div>
          ) : (
            rcp.items.map((item: ReceiptItem) => (
              <div key={item.id} className="flex items-start justify-between item-row">
                <div className="flex gap-2"><span className="w-4">{item.qty}x</span><span>{item.name}</span></div>
                <span>{(item.price * item.qty).toLocaleString("id-ID")}</span>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 section-gap text-xs mt-4">
          <div className="flex justify-between text-gray-600 mb-2"><span>Total Item:</span> <span>{rcp.totalItems} items</span></div>
          <div className="flex justify-between"><span>Subtotal:</span> <span>{rcp.subtotal.toLocaleString("id-ID")}</span></div>
          <div className="flex justify-between"><span>Pajak 10%:</span> <span>{rcp.tax.toLocaleString("id-ID")}</span></div>

          <div className="border-t border-dashed border-gray-400 pt-4 mt-4">
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL BAYAR</span>
              <span>{rcp.total.toLocaleString("id-ID")}</span>
            </div>

            {rcp.status !== "NOT PAID" && rcp.method && (
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="uppercase">{rcp.method}</span>
                  <span>{rcp.paid.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>KEMBALI</span>
                  <span>{rcp.change.toLocaleString("id-ID")}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12 pt-6 border-t border-dashed border-gray-300">
          <p className="font-bold text-sm mb-3 uppercase">
            *** {rcp.status === "NOT PAID" ? "BELUM BAYAR" : rcp.status === "REKAP" ? "REKAP TRANSAKSI" : "LUNAS"} ***
          </p>
          <p className="text-[10px]">
            {rcp.status === "NOT PAID" ? "SILAHKAN CEK KEMBALI PESANAN ANDA" : "TERIMA KASIH ATAS KUNJUNGAN ANDA"}
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm mt-6 space-y-2">
        {isAllFullyPaid && hasPaidSegments && !showMasterReceipt && (
          <button
            onClick={() => {
              setShowMasterReceipt(true);
              setViewingSegmentId(null);
            }}
            className="w-full py-2.5 bg-white border-2 border-gray-800 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-100 flex items-center justify-center gap-2 mb-2"
          >
            <Receipt size={16} /> Lihat Rekap Full (Semua Segmen)
          </button>
        )}

        <button
          onClick={handlePrintReceipt}
          className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700 flex items-center justify-center gap-2"
        >
          <Printer size={16} /> Cetak Nota Ini
        </button>

        {isAllFullyPaid && (
          <button
            onClick={handleFinalizeTransaction}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-base hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2 mt-4 animate-bounce"
          >
            <CheckCircle2 size={20} /> SELESAIKAN MEJA INI
          </button>
        )}
      </div>
    </div>
  );
}