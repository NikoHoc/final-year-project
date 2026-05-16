"use client";

import React from "react";
import { Printer, CheckCircle2, ArrowLeftCircle, Receipt } from "lucide-react";
import { formatRupiah } from "@/utils/format";

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  is_half_portion?: boolean;
  note?: string;
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
  tableId: string | number;
  transactionId: string;
  customerName: string | null;
  activeSegmentToView: PaidSegment | null;
  showMasterReceipt: boolean;
  setShowMasterReceipt: (show: boolean) => void;
  setViewingSegmentId: (id: number | null) => void;
  isAllFullyPaid: boolean;
  hasPaidSegments: boolean;
  handlePrintReceipt: () => void;
  handleFinalizeTransaction?: () => void;
  depot?: {
    name: string;
    address: string;
    phone_number: string;
  } | null;
  isReadOnly?: boolean;
}

export default function ReceiptPreview({
  receiptRef,
  rcp,
  tableId,
  transactionId,
  customerName,
  activeSegmentToView,
  showMasterReceipt,
  setShowMasterReceipt,
  setViewingSegmentId,
  isAllFullyPaid,
  hasPaidSegments,
  handlePrintReceipt,
  handleFinalizeTransaction,
  depot,
  isReadOnly = false
}: ReceiptPreviewProps) {
  return (
    <div className="w-full lg:w-[45%] bg-gray-100 p-6 flex flex-col items-center overflow-y-auto custom-scrollbar relative border-l border-gray-200">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
        {isReadOnly ? "Preview Nota Laporan" : "Preview Nota Transaksi"}
      </h3>
      {((activeSegmentToView || showMasterReceipt) && !isReadOnly) && (
        <button
          onClick={() => {
            setViewingSegmentId(null);
            setShowMasterReceipt(false);
          }}
          className="absolute top-4 left-4 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm font-bold text-sm text-gray-700 hover:text-blue-600 z-10 border"
        >
          <ArrowLeftCircle size={16} /> Reset
        </button>
      )}

      <div
        ref={receiptRef}
        className={`w-full max-w-[320px] bg-white p-6 shadow-sm relative text-gray-800 ${
          rcp.status === "NOT PAID" ? "border-t-8 border-gray-800" : "border-t-8 border-green-500 shrink-0"
        }`}
      >
        {isReadOnly && (
          <div className="absolute -top-3 -right-3 bg-gray-800 text-white text-[9px] font-black px-3 py-1.5 rounded-lg rotate-12 z-20 shadow-xl border-2 border-white">
            Copy
          </div>
        )}
        <div className="text-center section-gap border-b border-gray-300 pb-6">
          <h2 className="font-black text-sm uppercase">
            {depot?.name || "DEPOT POS"}
          </h2>
          <p className="text-[10px] uppercase">
            {depot?.address || "Alamat belum diatur"}
          </p>
          <p className="text-[10px]">
            {depot?.phone_number ? `Telp: ${depot.phone_number}` : "08"}
          </p>
        </div>

        <div className="space-y-2 section-gap text-[11px] mt-4">
          <div className="flex justify-between" style={{display:"flex",justifyContent:"space-between",width:"100%"}}>
            <span>Transaksi:</span> 
            <span className="font-bold" style={{fontWeight:"bold"}}> TRX-{transactionId.slice(-6).toUpperCase()}</span>
          </div>
          <div className="flex justify-between" style={{display:"flex",justifyContent:"space-between",width:"100%"}}>
            <span>Waktu:</span> 
            <span>{rcp.time}</span>
          </div>
          <div className="flex justify-between" style={{display:"flex",justifyContent:"space-between",width:"100%"}}>
            <span>Meja:</span> 
            <span className="font-bold" style={{fontWeight:"bold"}}>{tableId ? tableId : "BUNGKUS"}</span>
          </div>
          {customerName && (
            <div className="flex justify-between" style={{display:"flex",justifyContent:"space-between",width:"100%"}}>
              <span>Pelanggan:</span> 
              <span className="font-bold uppercase" style={{fontWeight:"bold",textTransform:"uppercase"}}>{customerName}</span>
            </div>
          )}
        </div>

        <div className="border-t border-b border-dashed border-gray-400 py-4 section-gap space-y-2 text-xs mt-4">
          {rcp.items.length === 0 ? (
            <div className="text-center py-4 text-gray-400 italic">Belum ada pesanan</div>
          ) : (
            rcp.items.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="item-row flex justify-between items-start">
                  <div className="item-left flex flex-1" style={{gap: "6px"}}>
                    <span className="item-qty inline-block shrink-0" style={{minWidth: "14px"}}>{item.qty}</span>
                    <span className="item-name font-bold uppercase wrap-break-words">{item.name}</span>
                  </div>
                  <div className="item-price whitespace-nowrap ml-2">
                    {formatRupiah(item.price * item.qty)}
                  </div>
                </div>

                {/* Detail 1/2 porsi & Note dengan indentasi satu tab (pl-10) */}
                <div className="item-detail pl-5 opacity-90 italic text-[10px] space-y-0.5">
                  {item.is_half_portion && (
                    <div># 1/2 PORSI</div>
                  )}
                  {item.note && (
                    <div className="wrap-break-words"># {item.note}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-[11px] text-black">
          <div className="flex justify-between font-bold pt-4 ">
            <span>{rcp.totalItems} ITEMS</span>
          </div>

          <div className="space-y-1 mt-2 totals-section">
            <div className="total-row flex justify-between ml-auto w-[60%]">
              <span>SUBTOTAL</span>
              <span>{formatRupiah(rcp.subtotal)}</span>
            </div>
            <div className="total-row flex justify-between ml-auto w-[60%]">
              <span>PAJAK (10%)</span>
              <span>{formatRupiah(rcp.tax)}</span>
            </div>
            <div className={`total-row grand flex justify-between ml-auto w-[60%] font-black text-xs border-t border-black pt-2 pb-2 ${
                (rcp.status === "PAID" || rcp.paid > 0) ? "has-payment border-b border-black" : ""
              }`}>
              <span>GRAND TOTAL</span>
              <span>{formatRupiah(rcp.total)}</span>
            </div>
          </div>

          {(rcp.status === "PAID" || rcp.paid > 0) && (
            <div className="payment-section pt-2 space-y-1">
              <div className="payment-row flex justify-between ml-auto w-[60%] uppercase font-bold">
                <span>{rcp.method || "CASH"}</span>
                <span>{formatRupiah(rcp.paid)}</span>
              </div>
              {rcp.change > 0 && (
                <div className="payment-row bold flex justify-between ml-auto w-[60%] font-bold">
                  <span>KEMBALI</span>
                  <span>{formatRupiah(rcp.change)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-center mt-12 pt-6 border-t border-dashed border-gray-300">
          <p className="font-black text-sm mb-3 uppercase tracking-widest">
            *** {rcp.status === "NOT PAID" ? "BELUM BAYAR" : rcp.status === "REKAP" ? "REKAP TRANSAKSI" : "LUNAS"} ***
          </p>
          <p className="text-[10px] font-medium text-gray-500 uppercase">
            {rcp.status === "NOT PAID" ? "SILAHKAN CEK KEMBALI PESANAN ANDA" : "TERIMA KASIH ATAS KUNJUNGAN ANDA"}
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm mt-6 space-y-2">
        {isAllFullyPaid && hasPaidSegments && !showMasterReceipt && !isReadOnly && (
          <button
            onClick={() => {
              setShowMasterReceipt(true);
              setViewingSegmentId(null);
            }}
            className="w-full py-2.5 bg-white border-2 border-gray-800 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-100 flex items-center justify-center gap-2 mb-2"
          >
            <Receipt size={16} /> Lihat Rekap Full
          </button>
        )}

        {rcp.items && rcp.items.length > 0 && (
          <button
            onClick={handlePrintReceipt}
            className="cursor-pointer w-full py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <Printer size={16} /> Cetak Nota Ini
          </button>
        )}

        {isAllFullyPaid && !isReadOnly && handleFinalizeTransaction && (
          <button
            onClick={handleFinalizeTransaction}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-base hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2 mt-4 animate-bounce"
          >
            <CheckCircle2 size={20} /> SELESAIKAN PESANAN INI
          </button>
        )}
      </div>
    </div>
  );
}