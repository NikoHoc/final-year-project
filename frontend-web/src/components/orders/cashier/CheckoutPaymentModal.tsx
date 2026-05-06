"use client";

import { useState, useRef, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import OrderItemList from "./OrderItemList";
import PaymentActionForm from "./PaymentActionForm";
import ReceiptPreview, { PaidSegment } from "./ReceiptPreview";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { transactionService } from "@/services/transactionService";
import { CartItem } from "@/hooks/useCart"; 
import { TransactionPayment } from "@/types";
import { useRouter } from "next/navigation";

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  qtyTotal: number;
  qtyPaid: number;
  qtyInNota: number;
  is_half_portion?: boolean;
  note?: string;
}
interface CheckoutPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  transactionId: string;
  tableId: string;
  existingPayments: TransactionPayment[]; 
  onSuccess: () => void;
}
export default function CheckoutPaymentModal({ isOpen, onClose, cartItems, transactionId, tableId, existingPayments, onSuccess }: CheckoutPaymentModalProps) {
  const router = useRouter()
  const receiptRef = useRef<HTMLDivElement>(null);

  const { methods, isLoading: isLoadingMethods, fetchMethods } = usePaymentMethods();
  const activeMethods = methods.filter(m => m.is_active);

  const [items, setItems] = useState<CheckoutItem[]>([]);
  
  const [paidSegments, setPaidSegments] = useState<PaidSegment[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [customerMoney, setCustomerMoney] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const [viewingSegmentId, setViewingSegmentId] = useState<number | null>(null);
  const [showMasterReceipt, setShowMasterReceipt] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMethods();

      const updateTime = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleString("id-ID", {
          day: "numeric", month: "long", year: "numeric",
          hour: "2-digit", minute: "2-digit"
        }));
      };
      
      updateTime();
      const timer = setInterval(updateTime, 60000); 
      
      return () => clearInterval(timer);
    }
  }, [isOpen, fetchMethods]);

  useEffect(() => {
    if (isOpen) {
      const mappedItems = cartItems.map((item) => ({
        id: item.id ? item.id.toString() : item.unique_id,
        name: item.menu.name,
        price: item.price_at_time,
        qtyTotal: item.quantity,
        qtyPaid: item.quantity_paid || 0,
        qtyInNota: 0,
        is_half_portion: item.is_half_portion,
        note: item.note,
      }));
      setItems(mappedItems);

      const mappedSegments: PaidSegment[] = (existingPayments || []).map((payment, index) => {
        const segItems = payment.transaction_payment_items?.map((pi) => {
          const originalCartItem = cartItems.find((c) => c.id === pi.transaction_item_id);
          return {
            id: pi.transaction_item_id.toString(),
            name: originalCartItem?.menu.name || "Item",
            price: pi.price_at_time,
            qty: pi.quantity,
            is_half_portion: originalCartItem?.is_half_portion,
            note: originalCartItem?.note,
          };
        }) || [];

        const segmentSubtotal = segItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        const segmentTax = segmentSubtotal * 0.1;
        const segmentGrandTotal = payment.paid_amount - payment.change_amount;

        return {
          id: payment.id,
          customerName: `Pelanggan ${index + 1}`,
          items: segItems,
          subtotal: segmentSubtotal,
          tax: segmentTax, 
          grandTotal: segmentGrandTotal,
          method: payment.payment_methods?.name || "Unknown",
          time: new Date(payment.created_at).toLocaleString("id-ID"),
          paidAmount: payment.paid_amount,
          changeAmount: payment.change_amount,
        };
      });
      setPaidSegments(mappedSegments);
    }
  }, [isOpen, cartItems, existingPayments]);

  useEffect(() => {
    if (activeMethods.length > 0) {
      const isCurrentMethodValid = activeMethods.some(m => m.name === selectedMethod);
      if (!isCurrentMethodValid) {
        setSelectedMethod(activeMethods[0].name);
      }
    }
  }, [activeMethods, selectedMethod]);

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
  const masterMethods = Array.from(new Set(
    existingPayments.map(p => p.payment_methods?.name).filter(Boolean)
  )).join(" & ");
  const masterPaid = paidSegments.reduce((sum, seg) => sum + seg.paidAmount, 0);
  const masterChange = paidSegments.reduce((sum, seg) => sum + seg.changeAmount, 0);

  const handleAddToNota = (id: string) => {
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

  const handleRemoveFromNota = (id: string) => {
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

  const handleProcessPayment = async () => {
    if (!isMoneySufficient || itemsInNota.length === 0) return;

    const selectedMethodObj = activeMethods.find(m => m.name === selectedMethod);
    if (!selectedMethodObj) {
      toast.error("Metode pembayaran tidak valid");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        payment_method_id: selectedMethodObj.id,
        paid_amount: moneyValue,
        change_amount: change,
        items: itemsInNota.map((i) => ({
          transaction_item_id: parseInt(i.id),
          quantity: i.qtyInNota,
          price_at_time: i.price,
        })),
      };

      await transactionService.processPayment(transactionId, payload);

      toast.success("Pembayaran Segmen Berhasil!");
      setCustomerMoney("");
      setSelectAll(false);
      
      onSuccess(); 

    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Gagal memproses pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeTransaction = () => {
    toast.success(`Transaksi Meja ${tableId} Selesai!`);
    onClose();
    router.push("/kasir");
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
        paid: masterPaid,      
        change: masterChange,
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
            handleRemoveFromNota={handleRemoveFromNota}
            handleAddToNota={handleAddToNota}
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
            paymentMethods={activeMethods}
            isLoadingMethods={isLoadingMethods}
            isSubmitting={isSubmitting}
          />
        </div>
        <ReceiptPreview
          receiptRef={receiptRef}
          rcp={rcp}
          tableId={tableId}
          transactionId={transactionId}
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
