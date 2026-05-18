import { DailySettlement } from "@/types";
import { formatDateFull } from "@/utils/format";
import { ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
  data: DailySettlement[];
  isLoading: boolean;
  startDate: string;
  endDate: string;
}

export default function RevenueTrendChart({ data, isLoading, startDate, endDate }: Props) {
  if (isLoading) {
    return (
      <div className="h-87.5 w-full flex items-center justify-center mt-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-87.5 w-full flex items-center justify-center text-sm font-medium text-gray-400 italic mt-4 border-2 border-dashed border-gray-100 rounded-3xl">
        Tidak ada transaksi pada periode: {startDate ? formatDateFull(startDate) : '-'} s/d {endDate ? formatDateFull(endDate) : '-'}
      </div>
    );
  }

  return (
    <div className="h-87.5 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          
          <XAxis 
            dataKey="settlement_date" 
            tickFormatter={(val) => formatDateFull(val)} 
            tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 'bold' }} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
          />
          
          <YAxis 
            yAxisId="left" 
            tickFormatter={(val) => `Rp ${(val / 1000)}k`}
            tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 'bold' }} 
            axisLine={false} 
            tickLine={false} 
            dx={-10}
          />

          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 'bold' }} 
            axisLine={false} 
            tickLine={false} 
            dx={10}
          />

          <Tooltip 
            labelFormatter={(label) => formatDateFull(label as string)} 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
            formatter={(value, name) => {
                const val = Number(value ?? 0);
                if (name === "Total Transaksi") return [`${val} Nota`, name];
                return [`Rp ${val.toLocaleString("id-ID")}`, name];
            }}
            />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />

          <Area 
            yAxisId="left" 
            type="monotone" 
            dataKey="subtotal_amount" 
            name="Omset (Subtotal)" 
            fill="#dbeafe" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            fillOpacity={1} 
          />

          <Area 
            yAxisId="left" 
            type="monotone" 
            dataKey="net_income" 
            name="Estimasi Pendapatan Bersih" 
            fill="#d1fae5" 
            stroke="#10b981" 
            strokeWidth={3} 
            fillOpacity={0.8} 
          />

          <Bar 
            yAxisId="right" 
            dataKey="total_transactions" 
            name="Total Transaksi" 
            fill="#f59e0b" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={30} 
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}