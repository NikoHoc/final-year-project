import { formatRupiah, formatDateTime } from "@/utils/format";
import { Expense } from "@/types";
import { TrendingDown } from "lucide-react";

interface Props {
  expenses: Expense[];
}

export default function CompactExpenseTable({ expenses }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <h2 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
          <TrendingDown size={20} className="text-red-500" /> Daftar Pengeluaran
        </h2>
        <span className="text-xs font-bold text-gray-400 uppercase">Total: {expenses.length}</span>
      </div>
      <div className="overflow-y-auto max-h-75 custom-scrollbar flex-1">
        <table className="w-full text-left text-xs">
          <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase font-black">
            <tr>
              <th className="px-4 py-4 text-center">No</th>
              <th className="px-4 py-4">Detail Pengeluaran</th>
              <th className="px-4 py-4 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {expenses && expenses.length > 0 ? (
              expenses.map((exp, index) => (
                <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 text-center">{index+1}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-800">{exp.item_name}</div>
                    <div className="text-[10px] text-gray-400">{formatDateTime(exp.expense_date)}</div>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-red-600">
                    {formatRupiah(exp.amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-400 font-medium italic">
                  Tidak ada pengeluaran yang tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}