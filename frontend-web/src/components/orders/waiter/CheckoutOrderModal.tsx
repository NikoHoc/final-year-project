"use client";

import { useState, useMemo, useRef } from "react";
import { Printer, ClipboardList, Filter } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { CartItem } from "@/types";

interface CheckoutOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  tableId: string | null;
  customerName: string | null;
}

type FilterType = "all" | "food" | "drink";

export default function CheckoutOrderModal({
  isOpen,
  onClose,
  cartItems,
  tableId,
  customerName
}: CheckoutOrderModalProps) {
  const [selectedBatch, setSelectedBatch] = useState<number | "all">("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const printRef = useRef<HTMLDivElement>(null);

  const { savedBatches, batchNumbers } = useMemo(() => {
    const saved = cartItems.filter((item) => item.is_saved);
    const batches = saved.reduce(
      (acc: Record<number, CartItem[]>, item: CartItem) => {
        const bNum = Number(item.batch_number) || 1;
        if (!acc[bNum]) acc[bNum] = [];
        acc[bNum].push(item);
        return acc;
      },
      {}
    );
    return { 
      savedBatches: batches, 
      batchNumbers: Object.keys(batches).map(Number).sort((a, b) => a - b) 
    };
  }, [cartItems]);

  // Filter Data Gabungan
  const previewItems = useMemo(() => {
    let items: CartItem[] = [];
    if (selectedBatch === "all") {
      items = cartItems.filter((item) => item.is_saved);
    } else {
      items = savedBatches[selectedBatch] || [];
    }

    if (filterType === "food") {
      return items.filter((i) => i.menu.categories?.type === "food");
    }
    if (filterType === "drink") {
      return items.filter((i) => i.menu.categories?.type === "drink");
    }
    return items;
  }, [cartItems, selectedBatch, savedBatches, filterType]);

  // Mengelompokkan item preview berdasarkan Batch untuk tampilan UI di kiri
  const groupedPreviewItems = useMemo(() => {
    const groups: Record<number, CartItem[]> = {};
    previewItems.forEach((item) => {
      const b = Number(item.batch_number) || 1;
      if (!groups[b]) groups[b] = [];
      groups[b].push(item);
    });
    return groups;
  }, [previewItems]);

  const getReceiptTitle = () => {
    if (filterType === "food") return "MAKANAN";
    if (filterType === "drink") return "MINUMAN";
    return "CHECKER";
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`
      <html>
        <head>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 70mm; margin: 0 auto; 
              padding: 15px; /* PADDING AGAR TIDAK NEMPEL PINGGIR */
              font-size: 13px;
              color: #000;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .text-xl { font-size: 22px; }
            .text-sm { font-size: 16px; }
            .text-\\[10px\\] { font-size: 10px; }
            .uppercase { text-transform: uppercase; }
            .tracking-widest { letter-spacing: 0.1em; }
            .border-b { border-bottom: 1px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
            .flex { display: flex; }
            .items-start { align-items: flex-start; }
            .w-6 { width: 28px; display: inline-block; }
            .pl-8 { padding-left: 28px; }
            .mt-1 { margin-top: 4px; }
            .space-y-4 > * + * { margin-top: 16px; } /* JARAK ANTAR ITEM AGAR LEGA */
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    doc.close();
    
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Opsi Cetak Pesanan" maxWidth="6xl">
      <div className="flex flex-col lg:flex-row h-[75vh] bg-gray-50 rounded-b-2xl overflow-hidden -mx-6 -mb-6">
        <div className="w-full lg:w-[50%] flex flex-col bg-white border-r border-gray-200">
          
          <div className="p-4 border-b border-gray-100 bg-white shadow-sm shrink-0">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
              Pilih Batch Pesanan
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBatch("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedBatch === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                Semua Batch
              </button>
              {batchNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedBatch(num)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBatch === num ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  Batch {num}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
            {Object.keys(groupedPreviewItems).length > 0 ? (
              Object.entries(groupedPreviewItems).map(([batchNum, items]) => (
                <div key={batchNum} className="space-y-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">BATCH {batchNum}</h4>
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 shadow-sm">
                    {items.map((item, idx) => (
                      <div key={idx} className="p-3">
                        <h4 className="font-bold text-gray-800 text-sm leading-tight">
                          {item.quantity} x {item.menu.name}
                        </h4>
                        {item.is_half_portion && <p className="text-[10px] font-bold text-purple-600 mt-1 uppercase"># 1/2 Porsi</p>}
                        {item.note && <p className="text-[10px] text-orange-500 mt-1 uppercase"># {item.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 italic py-10">
                <ClipboardList size={40} className="mb-2 opacity-20" />
                <p className="text-sm">Tidak ada item untuk dicetak</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[50%] bg-gray-100 p-6 flex flex-col items-center overflow-y-auto relative">
          <div className="w-full max-w-[320px] mb-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block text-center">
              Cetak Pesanan
            </label>
            <div className="flex gap-2">
              {(["all", "food", "drink"] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 shadow-sm ${
                    filterType === type ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Filter size={14} />
                  {type === "all" ? "Semua" : type === "food" ? "Makanan" : "Minuman"}
                </button>
              ))}
            </div>
          </div>
          <div
            ref={printRef}
            className="w-full max-w-[320px] bg-white p-6 shadow-md border-t-8 border-gray-800"
          >
            <div className="text-center border-b border-gray-300 pb-4 mb-4">
              <h2 className="font-bold text-xl border-b border-gray-300 uppercase tracking-widest">{getReceiptTitle()}</h2>
              <h3 className="font-bold text-sm mt-1 uppercase">
                {tableId ? `PESANAN MEJA ${tableId}` : "BUNGKUS"}
              </h3>
              {customerName && (
                <p className="font-black text-sm uppercase mt-1 border border-black inline-block px-2">
                  A/N: {customerName}
                </p>
              )}
              <p className="text-[10px] text-gray-500 mt-1">{new Date().toLocaleString("id-ID")}</p>
            </div>
            <div className="space-y-4">
              {previewItems.length === 0 ? (
                <p className="text-center text-[10px] text-gray-400 py-4 italic">Item kosong</p>
              ) : (
                previewItems.map((item, idx) => (
                  <div key={idx} className="text-sm leading-tight text-gray-900">
                    <div className="flex items-start">
                      <span className="w-6 font-bold">{item.quantity}</span>
                      <span className="font-bold">{item.menu.name}</span>
                    </div>
                    {item.is_half_portion && <div className="pl-8 font-bold mt-1"># 1/2 PORSI</div>}
                    {item.note && <div className="pl-8 mt-1 uppercase"># {item.note}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="w-full max-w-[320px] mt-6 space-y-3">
            <button
              onClick={handlePrint}
              disabled={previewItems.length === 0}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Printer size={18} /> CETAK KE {getReceiptTitle()}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-white text-gray-500 rounded-2xl font-bold text-xs hover:bg-gray-100 border border-gray-200 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}