import { Receipt, Coins, TrendingDown, Wallet, Utensils, ShoppingBag, Smartphone, TrendingUp } from "lucide-react";
import { formatRupiah } from "@/utils/format";
import { SettlementSummary, Transaction } from "@/types";
import { useMemo } from "react";

interface Props {
  summary: SettlementSummary | null;
  transactions?: Transaction[];
  role?: "kasir" | "owner" | "admin";
}

export default function DailySummaryCards({ summary, transactions = [], role = "owner" }: Props) {
  const { dining, takeaway, online } = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === "dining") acc.dining++;
        if (tx.type === "takeaway") acc.takeaway++;
        if (tx.type === "online") acc.online++;
        return acc;
      },
      { dining: 0, takeaway: 0, online: 0 }
    );
  }, [transactions]);

  const isOwnerOrAdmin = role === "owner" || role === "admin";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          <Receipt size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase block">Volume Penjualan</span>
          <div className="text-xl font-black text-gray-800 mt-1">{summary?.total_transactions || 0} Transaksi</div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 font-semibold uppercase text-sm">
            <span className="text-orange-600 flex gap-2 items-center"><Utensils size={16} />: {dining}</span> |
            <span className="text-blue-500 flex gap-2 items-center"><ShoppingBag size={16}/>: {takeaway}</span> |
            <span className="text-green-600 flex gap-2 items-center"><Smartphone size={16}/>: {online}</span>
          </div>
        </div>
      </div>
      {isOwnerOrAdmin && (
        <>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
              <Coins size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase block">Subtotal</span>
              <div className="text-xl font-black text-gray-800 mt-1">{formatRupiah(summary?.grand_total || 0)}</div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 text-[10px] sm:text-xs font-semibold italic uppercase">
                <span className="text-green-500">Sub: {formatRupiah(summary?.subtotal_amount || 0)}</span>
                <span className="text-blue-500">Tax: {formatRupiah(summary?.tax_amount || 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
              <TrendingDown size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">Total Pengeluaran</span>
              <div className="text-xl font-black text-red-600">{formatRupiah(summary?.total_expenses || 0)}</div>
            </div>
          </div>
          <div className="bg-green-600 p-6 rounded-3xl shadow-lg shadow-green-100 flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase opacity-80">Subtotal - Pengeluaran</span>
              <div className="text-xl font-black">{formatRupiah(summary?.net_income || 0)}</div>
            </div>
          </div>
        </>
      )}
      {!isOwnerOrAdmin && (
        <>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Subtotal</span>
            <div className="text-xl font-black text-blue-600">{formatRupiah(summary?.subtotal_amount || 0)}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <Coins size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Pajak</span>
            <div className="text-xl font-black text-red-600">{formatRupiah(summary?.tax_amount || 0)}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <Wallet size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Grand Total</span>
            <div className="text-xl font-black text-green-600">{formatRupiah(summary?.grand_total || 0)}</div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}