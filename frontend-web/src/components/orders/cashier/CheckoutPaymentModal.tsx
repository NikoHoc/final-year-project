"use client";

import { useState, useRef, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import OrderItemList from "./OrderItemList";
import PaymentActionForm from "./PaymentActionForm";
import ReceiptPreview, { PaidSegment } from "./ReceiptPreview";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { TransactionPayment, CartItem, Depot } from "@/types";
import { useRouter } from "next/navigation";
import { useTransaction } from "@/hooks/useTransaction";
import { formatDateTime } from "@/utils/format";
import { printReceiptHTML } from "@/utils/printHandler";

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
  customerName: string | null;
  onSuccess: () => void;
  depot?: Depot | null;
   role?: "kasir" | "owner";
}

export default function CheckoutPaymentModal({ isOpen, onClose, cartItems, transactionId, tableId, existingPayments, customerName, onSuccess, depot, role }: CheckoutPaymentModalProps) {
  const router = useRouter()
  const receiptRef = useRef<HTMLDivElement>(null);

  const { processPayment, updateTransactionStatus } = useTransaction();

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
        setCurrentTime(formatDateTime(new Date()));
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
          time: formatDateTime(payment.created_at),
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
  const masterTime = paidSegments.length > 0 ? paidSegments[paidSegments.length - 1].time : currentTime;

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

      await processPayment(transactionId, payload);

      toast.success("Pembayaran Segmen Berhasil!");
      setCustomerMoney("");
      setSelectAll(false);
      
      onSuccess(); 

    } catch (error) {
      console.error("Error Client Side - Gagal memproses pembayaran: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeTransaction = async () => {
    try {
      setIsSubmitting(true);

      await updateTransactionStatus(transactionId, { 
        payment_status: "paid", 
        order_status: "completed" 
      });
      
      toast.success(`Transaksi Selesai!`);
      onClose();
      if (role === "owner") {
        router.push("/owner/onsite-transactions");
      } else if (role === "kasir") {  
        router.push("/kasir");
      }
    } catch (error) {
      console.error("Error Client Side - Gagal menyelesaikan transaksi: ", error);
    } finally {
      setIsSubmitting(false);
    }
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
        time: masterTime,
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
    if (printContent) {
      printReceiptHTML(printContent, `Cetak Nota - ${transactionId}`);
    }
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
          customerName={customerName}
          activeSegmentToView={activeSegmentToView}
          showMasterReceipt={showMasterReceipt}
          setShowMasterReceipt={setShowMasterReceipt}
          setViewingSegmentId={setViewingSegmentId}
          isAllFullyPaid={isAllFullyPaid}
          hasPaidSegments={paidSegments.length > 0}
          handlePrintReceipt={handlePrintReceipt}
          handleFinalizeTransaction={handleFinalizeTransaction}
          depot={depot}
        />
      </div>
    </Modal>
  );
}
