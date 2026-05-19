import { formatRupiah } from "@/utils/format";
import { SettlementSummary } from "@/types";
import { Coins } from "lucide-react";

interface Props {
  summary: SettlementSummary | null;
}

export default function PaymentBreakdownTable({ summary }: Props) {
  const cashIncome = summary?.payment_methods?.find(
    (m) => m.method_name.toLowerCase().includes("cash") || m.method_name.toLowerCase().includes("tunai")
  )?.total_net_amount || 0;

  const nonCashIncome = summary?.payment_methods?.filter(
    (m) => !(m.method_name.toLowerCase().includes("cash") || m.method_name.toLowerCase().includes("tunai"))
  ).reduce((sum, m) => sum + m.total_net_amount, 0) || 0;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <h2 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
          <Coins size={20} className="text-green-500" /> Rincian Pemasukan
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg border border-green-100 font-semibold">
            <span>Tunai:</span>
            <span>{formatRupiah(cashIncome)}</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1.5 rounded-lg border border-purple-100 font-semibold">
            <span>Digital:</span>
            <span>{formatRupiah(nonCashIncome)}</span>
          </div>
          <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 ml-1 shadow-sm">
            <span className="font-bold">TOTAL:</span>
            <span className="text-sm font-black">{formatRupiah(summary?.grand_total || 0)}</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase font-black">
            <tr>
              <th className="px-6 py-4 text-center">No</th>
              <th className="px-6 py-4">Metode Pembayaran</th>
              <th className="px-6 py-4 text-center">Jml Transaksi</th>
              <th className="px-6 py-4 text-right">Total Bersih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {!summary?.payment_methods || summary.payment_methods.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-medium italic">
                  Tidak ada transaksi yang tercatat.
                </td>
              </tr>
            ) : (
              summary.payment_methods.map((pm, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 text-center">{idx+1}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{pm.method_name}</td>
                  <td className="px-6 py-4 text-center font-medium text-gray-500">{pm.transaction_count}</td>
                  <td className="px-6 py-4 text-right font-black text-gray-800">{formatRupiah(pm.total_net_amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}