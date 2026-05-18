import { Receipt, Coins, TrendingDown, Wallet } from "lucide-react";
import { formatRupiah } from "@/utils/format";
import { SettlementSummary } from "@/types";

interface Props {
  summary: SettlementSummary | null;
}

export default function DailySummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          <Receipt size={24} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase">Volume Penjualan</span>
          <div className="text-xl font-black text-gray-800">{summary?.total_transactions || 0} Transaksi</div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
          <Coins size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase block">Ringkasan Transaksi</span>
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
          <span className="text-[11px] font-bold uppercase opacity-80">Estimasi Bersih</span>
          <div className="text-xl font-black">{formatRupiah(summary?.net_income || 0)}</div>
        </div>
      </div>
    </div>
  );
}