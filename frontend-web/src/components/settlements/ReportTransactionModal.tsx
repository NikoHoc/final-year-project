"use client";

import { useState, useEffect, useRef } from "react";
import { X, Tag, CheckCircle2, Loader2, CircleUser, Calendar, MapPin } from "lucide-react";
import { formatRupiah, formatDateTime } from "@/utils/format";
import { Depot, Transaction, TransactionItem, TransactionPayment, TransactionPaymentItem } from "@/types";
import ReceiptPreview, { ReceiptData } from "@/components/orders/cashier/ReceiptPreview";
import { useTransaction } from "@/hooks/useTransaction";
import { printReceiptHTML } from "@/utils/printHandler";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  depot: Depot | null;
}

export default function ReportTransactionModal({ isOpen, onClose, transaction, depot }: Props) {
  const [transactionDetail, setTransactonDetail] = useState<Transaction | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  
  const receiptRef = useRef<HTMLDivElement>(null);
  const { fetchTransactionById } = useTransaction(); 

  const handlePrint = () => {
    const printContent = receiptRef.current?.innerHTML;
    if (printContent) {
        printReceiptHTML(printContent, `Cetak Ulang - ${transaction?.id}`);
    }
  };

  useEffect(() => {
    if (isOpen && transaction?.id) {
      const fetchDetail = async () => {
        setIsLoadingDetail(true);
        try {
          const transactionData = await fetchTransactionById(transaction.id);
          
          if (transactionData) {
            setTransactonDetail(transactionData);
          }
        } catch (error) {
          console.error("Gagal memuat detail pesanan:", error);
        } finally {
          setIsLoadingDetail(false);
        }
      };
      fetchDetail();
    } else {
      setTransactonDetail(null);
    }
  }, [isOpen, transaction, fetchTransactionById]);

  if (!isOpen || !transaction) return null;

  let rcp: ReceiptData | null = null;
  if (transactionDetail) {
    const totalPaid = transactionDetail.transaction_payments?.reduce(
      (acc: number, curr: TransactionPayment) => acc + Number(curr.paid_amount || 0), 0
    ) || 0;

    const totalChange = transactionDetail.transaction_payments?.reduce(
      (acc: number, curr: TransactionPayment) => acc + Number(curr.change_amount || 0), 0
    ) || 0;

    rcp = {
      items: (transactionDetail.transaction_items || []).map((item: TransactionItem) => ({
        id: String(item.id),
        name: item.menus?.name || "Item",
        price: item.price_at_time,
        qty: item.quantity,
        note: item.note,
        is_half_portion: item.is_half_portion
      })),
      totalItems: (transactionDetail.transaction_items || []).reduce((acc: number, curr: TransactionItem) => acc + curr.quantity, 0),
      subtotal: transactionDetail.subtotal,
      tax: transactionDetail.tax_amount,
      total: transactionDetail.grand_total,
      method: transactionDetail.payment_method || "Tunai",
      paid: totalPaid,
      change: totalChange,
      time: formatDateTime(transactionDetail.created_at),
      status: "REKAP"
    };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
      <div className="bg-gray-50 w-full max-w-5xl h-[85vh] rounded-4xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-gray-800">Detail Histori Transaksi</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {transaction.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="cursor-pointer p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50">
          <div className="w-full lg:w-[55%] flex flex-col bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Rincian Transaksi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><CircleUser size={20} /></div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Pelanggan</div>
                  <div className="text-sm font-black text-gray-800 truncate">{transaction.customer_name || "Guest"}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Tag size={20} /></div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Tipe</div>
                  <div className="text-sm font-black text-gray-800 capitalize">{transaction.type}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Waktu Pesan</div>
                  <div className="text-sm font-black text-gray-800">{formatDateTime(transactionDetail?.created_at || transaction.created_at || "")}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><MapPin size={20} /></div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Meja</div>
                  <div className="text-sm font-black text-gray-800">
                    {(transactionDetail?.type === 'dining' || transaction?.type === 'dining') 
                      ? (transactionDetail?.tables?.table_number || transactionDetail?.table_id || "-") 
                      : "BUNGKUS"}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between divide-x divide-gray-400">
              <div className="flex-1 pr-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Subtotal</div>
                <div className="text-sm font-black text-gray-600">{formatRupiah(transactionDetail?.subtotal || transaction.subtotal)}</div>
              </div>
              <div className="flex-1 px-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Pajak</div>
                <div className="text-sm font-black text-red-500">{formatRupiah(transactionDetail?.tax_amount || transaction.tax_amount)}</div>
              </div>
              <div className="flex-1 pl-4 text-right">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Grand Total</div>
                <div className="text-lg font-black text-green-600">{formatRupiah(transactionDetail?.grand_total || transaction.grand_total)}</div>
              </div>
            </div>

            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ">Riwayat Pembayaran</h3>
            <div className="space-y-4">
              {isLoadingDetail ? (
                <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-xs font-bold uppercase">Memuat Log...</span>
                </div>
              ) : (transactionDetail?.transaction_payments?.length ?? 0) > 0 ? (
                transactionDetail?.transaction_payments?.map((transactionPayment, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
                    <div className="p-4 flex justify-between items-center border-b border-gray-200 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center"><CheckCircle2 size={16} /></div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Segmen #{idx + 1}</div>
                          <div className="text-xs font-black text-gray-800 uppercase">{transactionPayment.payment_methods?.name || "Metode Lainnya"}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-gray-800">{formatRupiah(transactionPayment.paid_amount)}</div>
                        {Number(transactionPayment.change_amount) > 0 && <div className="text-[10px] font-bold text-orange-500 mt-0.5">Kembali: {formatRupiah(transactionPayment.change_amount)}</div>}
                      </div>
                    </div>
                    {transactionPayment.transaction_payment_items && transactionPayment.transaction_payment_items.length > 0 && (
                      <div className="p-3 bg-gray-50">
                        <div className="text-[9px] font-bold text-gray-400 uppercase mb-2 px-1">Rincian Item Terbayar:</div>
                        <div className="space-y-1.5 px-1">
                          {transactionPayment.transaction_payment_items.map((item: TransactionPaymentItem, piIdx: number) => {
                            const originalItem = transactionDetail.transaction_items?.find((ti: TransactionItem) => ti.id === item.transaction_item_id);
                            const itemName = originalItem?.menus?.name || "Item";
                            
                            return (
                              <div key={piIdx} className="flex justify-between items-start text-xs mb-2 last:mb-0">
                                <div className="flex flex-1 gap-2 pr-4">
                                  <span className="font-black text-gray-800 shrink-0">{item.quantity}</span>
                                  <div className="flex flex-col">
                                    <div className="font-medium text-gray-600 uppercase flex flex-wrap items-center gap-1.5">
                                      <span>{itemName}</span>
                                      {originalItem?.is_half_portion && (
                                        <span className="text-[9px] bg-red-100 text-red-500 border border-red-200 rounded px-1.5 py-0.5 font-bold tracking-wider">
                                          1/2 Porsi
                                        </span>
                                      )}
                                    </div>
                                    {originalItem?.note && (
                                      <span className="text-xs text-gray-400 font-medium italic mt-0.5 normal-case">
                                        # {originalItem.note}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="font-bold text-gray-700 whitespace-nowrap pt-0.5">
                                  {formatRupiah(item.price_at_time * item.quantity)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-10 border-2 border-dashed border-gray-200 rounded-3xl text-center text-xs font-bold text-gray-400 uppercase">
                  Tidak ada log pembayaran
                </div>
              )}
            </div>
          </div>
          {isLoadingDetail || !rcp ? (
            <div className="w-full lg:w-[45%] bg-gray-100 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-xs font-bold uppercase">Menyiapkan Struk...</span>
            </div>
          ) : (
            <>
            <ReceiptPreview 
              receiptRef={receiptRef}
              rcp={rcp}
              tableId={transactionDetail?.tables?.table_number || transactionDetail?.table_id?.toString() || '-'}
              transactionId={transaction.id}
              customerName={transaction.customer_name || 'Pelanggan'}
              activeSegmentToView={null}
              showMasterReceipt={true}
              setShowMasterReceipt={() => {}}
              setViewingSegmentId={() => {}}
              isAllFullyPaid={true}
              hasPaidSegments={true}
              handlePrintReceipt={handlePrint}
              depot={depot}
              isReadOnly={true}
            />
            </>
          )}

        </div>
      </div>
    </div>
  );
}