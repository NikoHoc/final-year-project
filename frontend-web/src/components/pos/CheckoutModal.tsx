"use client";

import React, { useState, useRef } from "react";
import {
  CheckSquare,
  Square,
  Minus,
  Plus,
  Printer,
  CheckCircle2,
  Eye,
  ArrowLeftCircle,
  Receipt,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatRupiah } from "@/utils/format";
import { PAYMENT_METHODS } from "@/utils/paymentMethods";
import toast from "react-hot-toast";

interface DummyItem {
  id: string;
  name: string;
  price: number;
  qtyTotal: number;
  qtyPaid: number;
  qtyInNota: number;
}

interface PaidSegment {
  id: number;
  customerName: string;
  items: { id: string; name: string; price: number; qty: number }[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  method: string;
  time: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const dummyTableId = "5";
  const dummyTransactionId = "TRX-99821A";

  const [items, setItems] = useState<DummyItem[]>([
    {
      id: "1",
      name: "Nasi Goreng Spesial",
      price: 25000,
      qtyTotal: 3,
      qtyPaid: 0,
      qtyInNota: 0,
    },
    {
      id: "2",
      name: "Es Teh Manis",
      price: 5000,
      qtyTotal: 4,
      qtyPaid: 0,
      qtyInNota: 0,
    },
    {
      id: "3",
      name: "Ayam Bakar Madu",
      price: 30000,
      qtyTotal: 1,
      qtyPaid: 0,
      qtyInNota: 0,
    },
  ]);

  const [paidSegments, setPaidSegments] = useState<PaidSegment[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [customerMoney, setCustomerMoney] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const [usedPaymentMethods, setUsedPaymentMethods] = useState<string[]>([]);

  const [viewingSegmentId, setViewingSegmentId] = useState<number | null>(null);
  const [showMasterReceipt, setShowMasterReceipt] = useState<boolean>(false);

  // --- KALKULASI NOTA AKTIF ---
  const itemsInNota = items.filter((item) => item.qtyInNota > 0);
  const subtotalNota = itemsInNota.reduce(
    (sum, item) => sum + item.price * item.qtyInNota,
    0,
  );
  const taxNota = subtotalNota * 0.1;
  const grandTotalNota = subtotalNota + taxNota;

  const moneyValue = parseInt(customerMoney.replace(/[^0-9]/g, "")) || 0;
  const isMoneySufficient = moneyValue >= grandTotalNota;
  const change = isMoneySufficient ? moneyValue - grandTotalNota : 0;

  const isAllFullyPaid = items.every((item) => item.qtyTotal === item.qtyPaid);

  // --- KALKULASI MASTER RECEIPT ---
  const masterItems = items.filter((item) => item.qtyPaid > 0);
  const masterSubtotal = masterItems.reduce(
    (sum, item) => sum + item.price * item.qtyPaid,
    0,
  );
  const masterTax = masterSubtotal * 0.1;
  const masterGrandTotal = masterSubtotal + masterTax;
  const masterMethods = Array.from(new Set(usedPaymentMethods)).join(" & ");

  // --- KONTROL +/- ---
  const handleIncreaseNota = (id: string) => {
    if (selectAll) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const qtyAvailable = item.qtyTotal - item.qtyPaid - item.qtyInNota;
          if (qtyAvailable > 0)
            return { ...item, qtyInNota: item.qtyInNota + 1 };
        }
        return item;
      }),
    );
  };

  const handleDecreaseNota = (id: string) => {
    if (selectAll) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.qtyInNota > 0)
          return { ...item, qtyInNota: item.qtyInNota - 1 };
        return item;
      }),
    );
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        qtyInNota: newSelectAll ? item.qtyTotal - item.qtyPaid : 0,
      })),
    );
  };

  const handleProcessPayment = () => {
    if (!isMoneySufficient || itemsInNota.length === 0) return;

    const newSegment: PaidSegment = {
      id: Date.now(),
      customerName: `Customer ${paidSegments.length + 1}`,
      items: itemsInNota.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qtyInNota,
      })),
      subtotal: subtotalNota,
      tax: taxNota,
      grandTotal: grandTotalNota,
      method: selectedMethod,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setPaidSegments([...paidSegments, newSegment]);
    setUsedPaymentMethods((prev) =>
      Array.from(new Set([...prev, selectedMethod])),
    );

    setItems((prev) =>
      prev.map((item) => {
        if (item.qtyInNota > 0) {
          return {
            ...item,
            qtyPaid: item.qtyPaid + item.qtyInNota,
            qtyInNota: 0,
          };
        }
        return item;
      }),
    );

    setCustomerMoney("");
    setSelectAll(false);
    toast.success(`${newSegment.customerName} Berhasil Membayar!`);
  };

  const handleFinalizeTransaction = () => {
    const finalPaymentMethods = usedPaymentMethods.join(" & ");
    toast.success(`Transaksi Selesai Total! (Metode: ${finalPaymentMethods})`);
    onClose();
  };

  // --- LOGIKA DATA NOTA YANG DITAMPILKAN ---
  const unpaidItems = items.filter((item) => item.qtyTotal > item.qtyPaid);
  const activeSegmentToView = viewingSegmentId
    ? paidSegments.find((s) => s.id === viewingSegmentId)
    : null;

  const getReceiptData = () => {
    const now = new Date();
    const fullTime =
      now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }) +
      `, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;

    if (showMasterReceipt) {
      return {
        items: masterItems.map((i) => ({ ...i, qty: i.qtyPaid })),
        totalItems: masterItems.reduce((sum, i) => sum + i.qtyPaid, 0),
        subtotal: masterSubtotal,
        tax: masterTax,
        total: masterGrandTotal,
        method: masterMethods,
        paid: masterGrandTotal,
        change: 0,
        time: fullTime,
        status: "REKAP",
      };
    }
    if (activeSegmentToView) {
      return {
        items: activeSegmentToView.items,
        totalItems: activeSegmentToView.items.reduce(
          (sum, i) => sum + i.qty,
          0,
        ),
        subtotal: activeSegmentToView.subtotal,
        tax: activeSegmentToView.tax,
        total: activeSegmentToView.grandTotal,
        method: activeSegmentToView.method,
        paid: activeSegmentToView.grandTotal,
        change: 0,
        time: fullTime,
        status: "BUKTI RESMI",
      };
    }
    return {
      items: itemsInNota.map((i) => ({ ...i, qty: i.qtyInNota })),
      totalItems: itemsInNota.reduce((sum, i) => sum + i.qtyInNota, 0),
      subtotal: subtotalNota,
      tax: taxNota,
      total: grandTotalNota,
      method: null,
      paid: 0,
      change: 0,
      time: fullTime,
      status: "NOT PAID",
    };
  };

  const rcp = getReceiptData();

  // --- FUNGSI PRINT THERMAL 80MM ---
  const handlePrintReceipt = () => {
    const printContent = receiptRef.current?.innerHTML;
    if (!printContent) return;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // CSS Khusus Printer Thermal
    iframeDoc.write(`
      <head>
          <title>Cetak Nota</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              /* Mengurangi width agar ada margin alami di kiri-kanan kertas 80mm */
              width: 68mm; 
              margin: 0 auto; 
              padding: 30px 0; /* Padding atas bawah lebih lega */
              font-size: 13px; 
              color: #000;
              line-height: 1.5;
            }
            .text-center { text-align: center; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000; }
            .border-t { border-top: 1px dashed #000; }
            .pb-4 { padding-bottom: 15px; }
            .pt-4 { padding-top: 15px; }
            .mb-4 { margin-bottom: 15px; }
            .mb-6 { margin-bottom: 25px; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .uppercase { text-transform: uppercase; }
            .space-y-2 > * + * { margin-top: 8px; }
            p, h2, h4 { margin: 4px 0; }
            .hide-on-print { display: none !important; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    iframeDoc.close();
    iframe.contentWindow?.focus();

    setTimeout(() => {
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checkout Pembayaran"
      maxWidth="6xl"
    >
      <div className="flex flex-col lg:flex-row h-[80vh] bg-gray-50 rounded-b-2xl overflow-hidden -mx-6 -mb-6">
        {/* ========================================= */}
        {/* PANEL KIRI: DAFTAR ITEM & SEGMEN LUNAS */}
        {/* ========================================= */}
        <div className="w-full lg:w-[55%] flex flex-col bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10 shrink-0">
            <h3 className="font-bold text-gray-800">Daftar Pesanan Meja</h3>
            {!isAllFullyPaid && (
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                {selectAll ? (
                  <CheckSquare size={18} className="text-blue-600" />
                ) : (
                  <Square size={18} />
                )}{" "}
                Pilih Semua Sisa
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {!isAllFullyPaid ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                  Belum Dibayar
                </h4>
                {unpaidItems.map((item) => {
                  const qtyAvailable =
                    item.qtyTotal - item.qtyPaid - item.qtyInNota;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-bold text-gray-800 text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-blue-600 font-semibold text-sm">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 mb-1">
                          Sisa: {qtyAvailable}
                        </span>
                        <div
                          className={`flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 ${selectAll ? "opacity-50" : ""}`}
                        >
                          <button
                            onClick={() => handleDecreaseNota(item.id)}
                            disabled={item.qtyInNota === 0 || selectAll}
                            className="w-7 h-7 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-blue-600">
                            {item.qtyInNota}
                          </span>
                          <button
                            onClick={() => handleIncreaseNota(item.id)}
                            disabled={qtyAvailable === 0 || selectAll}
                            className="w-7 h-7 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
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
                  <CheckCircle2 size={14} /> Sudah Lunas (Berdasarkan Pelanggan)
                </h4>
                {paidSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                      <div>
                        <h5 className="font-bold text-sm text-gray-800">
                          {segment.customerName}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {segment.method} • {segment.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          {formatRupiah(segment.grandTotal)}
                        </p>
                        <button
                          onClick={() => {
                            setViewingSegmentId(segment.id);
                            setShowMasterReceipt(false);
                          }}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 mt-1"
                        >
                          <Eye size={14} /> Lihat Nota
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isAllFullyPaid && (
            <div className="p-4 bg-white border-t border-gray-200 shrink-0 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                <span className="text-sm font-bold text-gray-500 uppercase">
                  Total Tagihan Saat Ini
                </span>
                <span className="text-2xl font-black text-blue-600">
                  {formatRupiah(grandTotalNota)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Metode
                  </label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Uang Pelanggan
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={customerMoney}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setCustomerMoney(
                          val ? parseInt(val).toLocaleString("id-ID") : "",
                        );
                      }}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
              <div
                className={`p-3 rounded-xl flex justify-between items-center ${isMoneySufficient && grandTotalNota > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
              >
                <span className="text-sm font-bold">Kembalian:</span>
                <span className="text-lg font-black">
                  {customerMoney ? formatRupiah(change) : "Rp 0"}
                </span>
              </div>
              <button
                onClick={handleProcessPayment}
                disabled={!isMoneySufficient || itemsInNota.length === 0}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
              >
                Bayar Sekarang
              </button>
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* PANEL KANAN: PRATINJAU NOTA */}
        {/* ========================================= */}
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

          {/* AREA KHUSUS PRINTABLE (Hanya ini yang masuk printer thermal) */}
          <div
            ref={receiptRef}
            className={`w-full max-w-[320px] bg-white p-6 shadow-sm relative text-gray-800 ${rcp.status === "NOT PAID" ? "border-t-8 border-gray-800" : "border-t-8 border-green-500 mt-10"}`}
          >
            {/* 1. HEADER NOTA */}
            <div className="text-center mb-4 border-b border-gray-300 pb-3">
              <h2 className="font-bold text-lg uppercase mb-1">
                Bakso Sapi Asli
              </h2>
              <p className="text-xs">Jl. Balikpapan No. 1, Kaltim</p>
              <p className="text-xs">Telp: 0812-3456-7890</p>
            </div>

            {/* 2. INFO TRANSAKSI */}
            <div className="space-y-1 mb-3 text-xs">
              <div className="flex justify-between">
                <span>No. TRX:</span> <span>{dummyTransactionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span> <span>{rcp.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Meja:</span> <span>{dummyTableId || "-"}</span>
              </div>
            </div>

            {/* 3. LIST ITEM */}
            <div className="border-t border-b border-dashed border-gray-400 py-3 mb-2 space-y-2 text-xs">
              {rcp.items.length === 0 ? (
                <div className="text-center py-4 text-gray-400 italic">
                  Pilih pesanan di sebelah kiri
                </div>
              ) : (
                rcp.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between"
                  >
                    <div className="flex gap-2">
                      <span className="w-4">{item.qty}x</span>
                      <span>{item.name}</span>
                    </div>
                    <span>
                      {(item.price * item.qty).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* 4. TOTAL & PEMBAYARAN */}
            <div className="space-y-1 text-xs mb-4">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Total Item:</span> <span>{rcp.totalItems} items</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>{" "}
                <span>{rcp.subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak 10%:</span>{" "}
                <span>{rcp.tax.toLocaleString("id-ID")}</span>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 mt-2">
                <div className="flex justify-between font-bold text-sm mb-1">
                  <span>TOTAL BAYAR</span>
                  <span>{rcp.total.toLocaleString("id-ID")}</span>
                </div>
                {/* Info Uang dan Kembalian (Muncul hanya jika tidak 0 atau sudah dibayar) */}
                {rcp.paid > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="uppercase">{rcp.method}</span>
                      <span>{rcp.paid.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KEMBALI</span>
                      <span>{rcp.change.toLocaleString("id-ID")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 5. STATUS (Disembunyikan saat di-print lewat css) */}
            <div className="text-center mt-10 pt-4 border-t border-dashed border-gray-300">
               <p className="font-bold text-sm mb-2 uppercase">
                 *** {
                   rcp.status === "NOT PAID" ? "BELUM BAYAR" : 
                   rcp.status === "REKAP" ? "REKAP TRANSAKSI" : "LUNAS"
                 } ***
               </p>
               <p className="text-[10px]">
                 {rcp.status === "NOT PAID" 
                   ? "SILAHKAN CEK KEMBALI PESANAN ANDA" 
                   : "TERIMA KASIH ATAS KUNJUNGAN ANDA"}
               </p>
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <div className="w-full max-w-sm mt-6 space-y-2">
            {isAllFullyPaid &&
              paidSegments.length > 0 &&
              !showMasterReceipt && (
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
              <Printer size={16} /> Cetak Nota Ini (Test Thermal)
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
      </div>
    </Modal>
  );
}
