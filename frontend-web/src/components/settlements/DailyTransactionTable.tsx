import { Eye } from "lucide-react";
import { formatRupiah, formatDateTime } from "@/utils/format";
import { Transaction } from "@/types";
import { Receipt } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onViewReceipt?: (transaction: Transaction) => void;
}

export default function DailyTransactionTable({ transactions, onViewReceipt }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <h2 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
          <Receipt size={20} className="text-blue-500" /> Log Transaksi
        </h2>
        <span className="text-xs font-bold text-gray-400 uppercase">Total: {transactions.length}</span>
      </div>
      <div className="overflow-x-auto max-h-150 custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-center">No</th>
              <th className="px-4 py-3">Waktu / Pelanggan</th>
              <th className="px-4 py-3">Tipe / Meja</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3 text-right">Pajak</th>
              <th className="px-4 py-3 text-right">Grand Total</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                  <td className="px-4 py-3 font-bold text-gray-700 text-center">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-600">{tx.customer_name || "Pelanggan"}</div>
                    <div className="text-xs text-gray-400">{formatDateTime(tx.created_at)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-md uppercase ${
                        tx.type === 'dining' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {tx.type}
                      </span>
                      <span className=" font-bold text-gray-400">/</span>
                      <span className="font-bold text-gray-700">
                        {tx.type === 'dining' ? (tx.tables?.table_number) : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-blue-500 font-bold uppercase">{tx.payment_method || "Split"}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-600">{formatRupiah(tx.subtotal)}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-500">{formatRupiah(tx.tax_amount)}</td>
                  <td className="px-4 py-3 font-black text-gray-800 text-right">{formatRupiah(tx.grand_total)}</td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => onViewReceipt?.(tx)}
                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors text-gray-600 cursor-pointer"
                        title="Lihat Struk"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400 italic font-medium">
                  Tidak ada transaksi yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}