"use client";

import { useState, useRef, useEffect } from "react";
import {
  CheckSquare,
  Square,
  Minus,
  Plus,
  CheckCircle2,
  Eye,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatRupiah } from "@/utils/format";
import { PAYMENT_METHODS } from "@/utils/paymentMethods";
import toast from "react-hot-toast";
import OrderItemList from "./OrderItemList";
import PaymentActionForm from "./PaymentActionForm";
import ReceiptPreview, { PaidSegment } from "./ReceiptPreview";

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  qtyTotal: number;
  qtyPaid: number;
  qtyInNota: number;
}

interface DummyItem {
  id: string;
  name: string;
  price: number;
  qtyTotal: number;
  qtyPaid: number;
  qtyInNota: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const segmentIdCounter = useRef(1);

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

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const timeString = now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) +
        `, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentTime(timeString);
    }
  }, [isOpen]);

  // --- KALKULASI NOTA AKTIF ---
  const itemsInNota = items.filter((item) => item.qtyInNota > 0);
  const subtotalNota = itemsInNota.reduce((sum, item) => sum + item.price * item.qtyInNota, 0);
  const taxNota = subtotalNota * 0.1;
  const grandTotalNota = subtotalNota + taxNota;

  const moneyValue = parseInt(customerMoney.replace(/[^0-9]/g, "")) || 0;
  const isMoneySufficient = moneyValue >= grandTotalNota;
  const change = isMoneySufficient ? moneyValue - grandTotalNota : 0;

  const isAllFullyPaid = items.every((item) => item.qtyTotal === item.qtyPaid);

  // --- KALKULASI MASTER RECEIPT ---
  const masterItems = items.filter((item) => item.qtyPaid > 0);
  const masterSubtotal = masterItems.reduce((sum, item) => sum + item.price * item.qtyPaid, 0);
  const masterTax = masterSubtotal * 0.1;
  const masterGrandTotal = masterSubtotal + masterTax;
  const masterMethods = Array.from(new Set(usedPaymentMethods)).join(" & ");
  const masterPaid = paidSegments.reduce((sum, seg) => sum + seg.paidAmount, 0);
  const masterChange = paidSegments.reduce((sum, seg) => sum + seg.changeAmount, 0);

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
      id: segmentIdCounter.current++,
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
      time: currentTime,
      paidAmount: moneyValue, 
      changeAmount: change, 
    };

    setPaidSegments([...paidSegments, newSegment]);
    setUsedPaymentMethods((prev) => Array.from(new Set([...prev, selectedMethod])));

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
  const activeSegmentToView = viewingSegmentId ? (paidSegments.find((s) => s.id === viewingSegmentId) || null) : null;

  const getReceiptData = () => {
    if (showMasterReceipt) {
      return {
        items: masterItems.map((i) => ({ ...i, qty: i.qtyPaid })),
        totalItems: masterItems.reduce((sum, i) => sum + i.qtyPaid, 0),
        subtotal: masterSubtotal,
        tax: masterTax,
        total: masterGrandTotal,
        method: masterMethods,
        paid: masterPaid,      // <--- GUNAKAN DATA TOTAL BAYAR
        change: masterChange,  // <--- GUNAKAN DATA TOTAL KEMBALIAN
        time: currentTime,
        status: "REKAP",
      };
    }
    if (activeSegmentToView) {
      return {
        items: activeSegmentToView.items,
        totalItems: activeSegmentToView.items.reduce((sum, i) => sum + i.qty, 0),
        subtotal: activeSegmentToView.subtotal,
        tax: activeSegmentToView.tax,
        total: activeSegmentToView.grandTotal,
        method: activeSegmentToView.method,
        paid: activeSegmentToView.paidAmount,
        change: activeSegmentToView.changeAmount,
        time: activeSegmentToView.time,
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
      time: currentTime,
      status: "NOT PAID",
    };
  };

  const rcp = getReceiptData();

  const handlePrintReceipt = () => {
    const printContent = receiptRef.current?.innerHTML;
    if (!printContent) return;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.write(`
      <html>
        <head>
          <title>Cetak Nota</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              /* Lebar dikurangi menjadi 60mm untuk margin kanan-kiri yang lebih luas */
              width: 65mm; 
              margin: 0 auto; 
              padding: 10px 0;
              color: #000;
              line-height: 1.5;
            }
            
            p, h2, h4 { margin: 0; }

            .text-center { text-align: center; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .gap-2 { gap: 8px; }
            .w-4 { width: 16px; display: inline-block; }

            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .italic { font-style: italic; }
            .text-\\[10px\\] { font-size: 10px; }
            .text-\\[11px\\] { font-size: 11px; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .text-lg { font-size: 18px; }

            .border-b { border-bottom: 1px dashed #000; }
            .border-t { border-top: 1px dashed #000; }

            .mt-4 { margin-top: 16px; }
            .mt-12 { margin-top: 48px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            
            .pt-4 { padding-top: 16px; }
            .pt-6 { padding-top: 24px; }
            .pb-6 { padding-bottom: 24px; }
            .py-4 { padding-top: 16px; padding-bottom: 16px; }

            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-3 > * + * { margin-top: 12px; }

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
        <div className="w-full lg:w-[55%] flex flex-col bg-white border-r border-gray-200">
          <OrderItemList
            isAllFullyPaid={isAllFullyPaid}
            selectAll={selectAll}
            toggleSelectAll={toggleSelectAll}
            unpaidItems={unpaidItems}
            paidSegments={paidSegments}
            handleDecreaseNota={handleDecreaseNota}
            handleIncreaseNota={handleIncreaseNota}
            setViewingSegmentId={setViewingSegmentId}
            setShowMasterReceipt={setShowMasterReceipt}
          />
          <PaymentActionForm
            isAllFullyPaid={isAllFullyPaid}
            grandTotalNota={grandTotalNota}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
            customerMoney={customerMoney}
            setCustomerMoney={setCustomerMoney}
            isMoneySufficient={isMoneySufficient}
            change={change}
            handleProcessPayment={handleProcessPayment}
            itemsInNotaLength={itemsInNota.length}
          />
        </div>
        <ReceiptPreview
          receiptRef={receiptRef}
          rcp={rcp}
          dummyTableId={dummyTableId}
          dummyTransactionId={dummyTransactionId}
          activeSegmentToView={activeSegmentToView}
          showMasterReceipt={showMasterReceipt}
          setShowMasterReceipt={setShowMasterReceipt}
          setViewingSegmentId={setViewingSegmentId}
          isAllFullyPaid={isAllFullyPaid}
          hasPaidSegments={paidSegments.length > 0}
          handlePrintReceipt={handlePrintReceipt}
          handleFinalizeTransaction={handleFinalizeTransaction}
        />
      </div>
    </Modal>
  );
}
