import { DailySettlement } from "@/types";
import { formatDateFull, formatRupiah } from "@/utils/format";
import { Eye, Calendar } from "lucide-react";
import Link from "next/link";

interface SettlementHistoryTableProps {
  data: DailySettlement[];
  isLoading: boolean;
  startDate: string;
  endDate: string;
  detailPathPrefix: string;
  role?: "kasir" | "owner" | "admin";
}

export default function SettlementHistoryTable({
  data,
  isLoading,
  startDate,
  endDate,
  detailPathPrefix,
  role = "owner"
}: SettlementHistoryTableProps) {

  const isOwnerOrAdmin = role === "owner" || role === "admin";

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
            <Calendar size={20} className="text-orange-500" /> Detail Riwayat Settlement
          </h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            Daftar penutupan kasir harian yang telah tercatat di sistem.
          </p>
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 block sm:inline w-fit">
          Total: {data.length} Hari Kerja
        </span>
      </div>

      <div className="overflow-x-auto max-h-125 custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-center">No</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4 text-center">Total Tx</th>
              <th className="px-6 py-4 text-right">Subtotal</th>
              <th className="px-6 py-4 text-right">Pajak (PPN)</th>
              <th className="px-6 py-4 text-right">Grand Total</th>
              {isOwnerOrAdmin && (
                <>
                  <th className="px-6 py-4 text-right">Pengeluaran</th>
                  <th className="px-6 py-4 text-right">Subtotal - Pengeluaran</th>
                </>
              )}
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-medium">
                  Memuat riwayat settlement...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                  Tidak ada transaksi pada periode: {startDate ? formatDateFull(startDate) : '-'} s/d {endDate ? formatDateFull(endDate) : '-'}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700 text-center">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">
                    {formatDateFull(item.settlement_date)}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-600">
                    {item.total_transactions}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-500">
                    {formatRupiah(item.subtotal_amount)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-orange-500">
                    {formatRupiah(item.tax_amount)}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-green-600">
                    {formatRupiah(item.grand_total)}
                  </td>
                  {isOwnerOrAdmin && (
                    <>
                      <td className="px-6 py-4 text-right font-medium text-red-500">
                        {formatRupiah(item.total_expenses)}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-blue-600">
                        {formatRupiah(item.net_income)}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-center">
                    <Link href={`${detailPathPrefix}/${item.id}`}>
                      <button className="cursor-pointer inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors shadow-sm">
                        <Eye size={14} /> Lihat Detail
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}