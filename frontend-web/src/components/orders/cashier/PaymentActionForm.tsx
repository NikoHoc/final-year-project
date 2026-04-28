"use client";

import { formatRupiah } from "@/utils/format";
import { PaymentMethod } from "@/types";

interface PaymentActionFormProps {
  isAllFullyPaid: boolean;
  grandTotalNota: number;
  selectedMethod: string;
  setSelectedMethod: (method: string) => void;
  customerMoney: string;
  setCustomerMoney: (money: string) => void;
  isMoneySufficient: boolean;
  change: number;
  handleProcessPayment: () => void;
  itemsInNotaLength: number;
  paymentMethods: PaymentMethod[]; 
  isLoadingMethods: boolean;
  isSubmitting?: boolean;
}

export default function PaymentActionForm({
  isAllFullyPaid,
  grandTotalNota,
  selectedMethod,
  setSelectedMethod,
  customerMoney,
  setCustomerMoney,
  isMoneySufficient,
  change,
  handleProcessPayment,
  itemsInNotaLength,
  paymentMethods,
  isLoadingMethods,
  isSubmitting
}: PaymentActionFormProps) {
  
  if (isAllFullyPaid) return null;

  return (
    <div className="p-4 bg-white border-t border-gray-200 shrink-0 space-y-4">
      <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
        <span className="text-sm font-bold text-gray-500 uppercase">Total Tagihan Saat Ini</span>
        <span className="text-2xl font-black text-blue-600">{formatRupiah(grandTotalNota)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Metode</label>
          <select 
            value={selectedMethod} 
            onChange={(e) => setSelectedMethod(e.target.value)} 
            disabled={isLoadingMethods || paymentMethods.length === 0}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMethods ? (
              <option value="">Memuat...</option>
            ) : paymentMethods.length > 0 ? (
              paymentMethods.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))
            ) : (
              <option value="">Tidak ada metode</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Uang Pelanggan</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
            <input 
              type="text" 
              value={customerMoney} 
              onChange={(e) => { 
                const val = e.target.value.replace(/[^0-9]/g, ""); 
                setCustomerMoney(val ? parseInt(val).toLocaleString("id-ID") : ""); 
              }} 
              placeholder="0" 
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>
      </div>

      <div className={`p-3 rounded-xl flex justify-between items-center ${isMoneySufficient && grandTotalNota > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
        <span className="text-sm font-bold">Kembalian:</span>
        <span className="text-lg font-black">{customerMoney ? formatRupiah(change) : "Rp 0"}</span>
      </div>

      <button 
        onClick={handleProcessPayment} 
        disabled={!isMoneySufficient || itemsInNotaLength === 0} 
        className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-[0.98]"
      >
        {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
      </button>
    </div>
  );
}