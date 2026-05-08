"use client";

import { ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
import { Transaction } from "@/types";
import { useRouter } from "next/navigation";

interface TakeawayCardProps {
  transaction: Transaction;
  role: "kasir" | "pelayan";
}

export default function TakeawayCard({ transaction, role }: TakeawayCardProps) {
  const router = useRouter();
  
  const isPaid = transaction.payment_status === 'paid';
  
  const totalItems = transaction.transaction_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const baseUrl = role === "kasir" ? "/kasir/pos" : "/pelayan/pesanan";

  return (
    <div 
      onClick={() => router.push(`${baseUrl}/${transaction.id}?type=takeaway`)}
      className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${
        isPaid 
          ? "bg-blue-50 border-blue-200" 
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${isPaid ? "bg-blue-100 text-blue-600" : "bg-yellow-100 text-yellow-600"}`}>
          <ShoppingBag size={20} />
        </div>
        <div className={`text-[9px] font-black px-2 py-1.5 rounded-md uppercase tracking-wider ${
          isPaid ? "bg-blue-600 text-white shadow-sm" : "bg-yellow-500 text-white shadow-sm"
        }`}>
          {isPaid ? "COOKING - LUNAS" : "COOKING - BELUM BAYAR"}
        </div>
      </div>

      <div className="space-y-1">
        <h4 className={`font-black text-lg ${isPaid ? "text-blue-900" : "text-yellow-900"}`}>
          TRX-{transaction.id.toString().slice(-4)}
        </h4>
        <div className="flex items-center gap-1.5 text-xs opacity-70">
          <Clock size={12} />
          <span>{new Date(transaction.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
        </div>
      </div>

      <div className={`mt-4 pt-4 border-t ${isPaid ? "border-blue-100 text-blue-700" : "border-yellow-200 text-yellow-700"} flex items-center justify-between`}>
        <div className="flex items-center gap-1">
          <CheckCircle2 size={14} />
          <span className="text-xs font-bold">{totalItems} Porsi Dipesan</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider hover:underline">Buka & Proses</span>
      </div>
    </div>
  );
}