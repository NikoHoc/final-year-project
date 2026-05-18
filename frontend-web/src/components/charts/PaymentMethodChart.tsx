import { PaymentPieChartData } from "@/types";
import { formatDateFull } from "@/utils/format";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444", 
  "#8b5cf6",
  "#ec4899",
  "#14b8a6", 
  "#f97316", 
  "#06b6d4", 
  "#6366f1", 
  "#84cc16", 
  "#a855f7", 
];

interface Props {
  data: PaymentPieChartData[];
  isLoading: boolean;
  startDate: string;
  endDate: string;
}

export default function PaymentMethodChart({ data, isLoading, startDate, endDate }: Props) {
  if (isLoading) {
    return (
      <div className="h-87.5 w-full flex flex-col items-center justify-center">
        <h3 className="text-sm font-black text-gray-600 uppercase tracking-wider mb-2 text-center">Metode Pembayaran</h3>
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-87.5 w-full flex flex-col items-center justify-center">
        <h3 className="text-sm font-black text-gray-600 uppercase tracking-wider mb-2 text-center">Metode Pembayaran</h3>
        <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-400 italic w-full border-2 border-dashed border-gray-100 rounded-3xl text-center px-4">
          Tidak ada data pembayaran <br/> {startDate ? formatDateFull(startDate) : '-'} s/d {endDate ? formatDateFull(endDate) : '-'}
        </div>
      </div>
    );
  }
  return (
    <div className="h-87.5 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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