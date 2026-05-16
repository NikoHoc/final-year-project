import { Eye } from "lucide-react";
import { formatRupiah, formatDate } from "@/utils/format";
import { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
  showAction?: boolean;
  onViewReceipt?: (transaction: Transaction) => void;
}

export default function TransactionTable({ transactions, showAction = false, onViewReceipt }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Log Transaksi</h3>
        <span className="text-xs font-bold text-gray-400 uppercase">Total: {transactions.length}</span>
      </div>
      <div className="overflow-x-auto max-h-150 custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="bg-white sticky top-0 shadow-sm z-10 uppercase text-gray-400 font-black">
            <tr>
              <th className="px-4 py-3 w-10">No</th>
              <th className="px-4 py-3">Waktu / Pelanggan</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3 text-right">Pajak</th>
              <th className="px-4 py-3 text-right">Grand Total</th>
              {showAction && <th className="px-4 py-3 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-800">{tx.customer_name || "Pelanggan"}</div>
                    <div className="text-[10px] text-gray-400">{formatDate(tx.created_at)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize font-medium text-gray-600 block">{tx.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-blue-500 font-bold uppercase">{tx.payment_method || "Split"}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-600">{formatRupiah(tx.subtotal)}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-500">{formatRupiah(tx.tax_amount)}</td>
                  <td className="px-4 py-3 font-black text-gray-800 text-right">{formatRupiah(tx.grand_total)}</td>
                  {showAction && (
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => onViewReceipt?.(tx)}
                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors text-gray-600 cursor-pointer"
                        title="Lihat Struk"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showAction ? 8 : 7} className="px-4 py-12 text-center text-gray-400 italic font-medium">
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