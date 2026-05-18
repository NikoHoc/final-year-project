import { useMemo } from "react";
import { Receipt, TrendingDown, Wallet, Percent, Banknote, Coins } from "lucide-react";
import { DailySettlement } from "@/types";
import { formatRupiah } from "@/utils/format";

export default function AccumulatedSummaryCards({ data }: { data: DailySettlement[] }) {
  const { totals, totalDays } = useMemo(() => {
    const daysCount = data.length || 1;
    const calculatedTotals = data.reduce(
      (acc, curr) => ({
        transactions: acc.transactions + curr.total_transactions,
        grossSubtotal: acc.grossSubtotal + curr.subtotal_amount,
        tax: acc.tax + curr.tax_amount,
        grandTotal: acc.grandTotal + curr.grand_total,
        net: acc.net + curr.net_income,
        expense: acc.expense + curr.total_expenses,
      }),
      { transactions: 0, grossSubtotal: 0, tax: 0, grandTotal: 0, net: 0, expense: 0 }
    );

    return { totals: calculatedTotals, totalDays: daysCount };
  }, [data]);

  const cards = [
    { 
      title: "Total Transaksi", 
      value: `${totals.transactions} Nota`, 
      subText: `Avg: ${Math.round(totals.transactions / totalDays)} transaksi / hari`,
      icon: <Receipt size={24} className="text-purple-500" />, 
      bg: "bg-purple-50" 
    },
    { 
      title: "Total Uang Masuk (Grand)", 
      value: formatRupiah(totals.grandTotal), 
      subText: `Avg: ${formatRupiah(Math.round(totals.grandTotal / totalDays))} / hari`,
      icon: <Coins size={24} className="text-teal-500" />, 
      bg: "bg-teal-50" 
    },
    { 
      title: "Total Omset (Subtotal)", 
      value: formatRupiah(totals.grossSubtotal), 
      subText: `Avg: ${formatRupiah(Math.round(totals.grossSubtotal / totalDays))} / hari`,
      icon: <Banknote size={24} className="text-blue-500" />, 
      bg: "bg-blue-50" 
    },
    { 
      title: "Total Pajak (PPN)", 
      value: formatRupiah(totals.tax), 
      subText: "*Akumulasi PPN 10%",
      icon: <Percent size={24} className="text-orange-500" />, 
      bg: "bg-orange-50" 
    },
    { 
      title: "Total Pengeluaran", 
      value: formatRupiah(totals.expense), 
      subText: `Avg: ${formatRupiah(Math.round(totals.expense / totalDays))} / hari`,
      icon: <TrendingDown size={24} className="text-red-500" />, 
      bg: "bg-red-50" 
    },
    { 
      title: "Pendapatan Bersih (Net)", 
      value: formatRupiah(totals.net), 
      subText: "*Grand Total - Pengeluaran Operasional",
      icon: <Wallet size={24} className="text-green-500" />, 
      bg: "bg-green-50" 
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-35">
          <div className="flex flex-col gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{card.title}</p>
              <p className="text-base font-black text-gray-800 mt-0.5">{card.value}</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 mt-2 border-t border-gray-50 pt-1.5 italic">
            {card.subText}
          </p>
        </div>
      ))}
    </div>
  );
}