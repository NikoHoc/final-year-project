import { formatRupiah, formatDate } from "@/utils/format";
import { Expense } from "@/types";

interface Props {
  expenses: Expense[];
}

export default function ExpenseTable({ expenses }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-gray-50 bg-gray-50/50 font-bold text-gray-800">
        Daftar Pengeluaran
      </div>
      <div className="overflow-y-auto max-h-75 custom-scrollbar flex-1">
        <table className="w-full text-left text-xs">
          <tbody className="divide-y divide-gray-50">
            {expenses && expenses.length > 0 ? (
              expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-800">{exp.item_name}</div>
                    <div className="text-[10px] text-gray-400">{formatDate(exp.expense_date)}</div>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-red-600">
                    {formatRupiah(exp.amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-4 py-12 text-center text-gray-400 italic">Tidak ada pengeluaran</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}