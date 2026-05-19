import { ChartData } from "@/types";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Utensils } from "lucide-react";

// Warna khusus disesuaikan dengan icon di detail: Biru (Dining), Hijau (Online), Oranye (Takeaway)
const TYPE_COLORS: Record<string, string> = {
  "Dining": "#3b82f6",
  "Takeaway": "#f97316",
  "Online": "#10b981",
};

interface Props {
  data: ChartData[];
  isLoading?: boolean;
}

export default function TransactionTypeChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-87.5 w-full flex flex-col items-center justify-center">
        <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 mb-2">
          <Utensils size={18} className="text-blue-500" /> Tipe Pesanan
        </h3>
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-87.5 w-full flex flex-col items-center justify-center">
        <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 mb-2">
          <Utensils size={18} className="text-blue-500" /> Tipe Pesanan
        </h3>
        <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-400 italic w-full border-2 border-dashed border-gray-100 rounded-3xl">
          Belum ada data tipe pesanan
        </div>
      </div>
    );
  }

  return (
    <div className="h-87.5 w-full flex flex-col items-center justify-center">
      <h3 className="text-md font-black text-gray-800 flex items-center gap-2 mb-2 self-start w-full border-b border-gray-50 pb-3">
        <Utensils size={18} className="text-blue-500" /> Tipe Pesanan
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || "#9ca3af"} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
            formatter={(value) => {
              const val = Number(value ?? 0);
              return [`${val} Transaksi`, "Jumlah"];
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}