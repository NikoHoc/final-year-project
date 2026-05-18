"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Calendar, Filter, Receipt, TrendingDown, Wallet, Activity, Percent, Banknote, Eye } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useSettlement } from "@/hooks/useSettlement";
import { formatDateTime, formatRupiah, formatDateFull, getTodayStr, getFirstDayOfMonthStr, getSevenDaysAgoStr } from "@/utils/format";
import { useSession } from "@/contexts/SessionContext";

export default function ReportsPage() {
  const { settlements, isLoading, fetchSettlements } = useSettlement();
  const { user, isLoadingSession } = useSession();

  const [startDate, setStartDate] = useState(getFirstDayOfMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [activeShortcut, setActiveShortcut] = useState<"bulan_ini" | "7_hari" | "semua" | "custom">("bulan_ini");

  const endOfToday = `${getTodayStr()}T23:59:59.999Z`;

  useEffect(() => {
    if (!isLoadingSession && user?.depot_id) {
      fetchSettlements(user.depot_id, getFirstDayOfMonthStr(), endOfToday);
    }
  }, [isLoadingSession, user?.depot_id, fetchSettlements, endOfToday]);

  const handleApplyFilter = () => {
    if (!user?.depot_id) return;
    setActiveShortcut("custom");
    const adjustedEndDate = endDate ? `${endDate}T23:59:59.999Z` : "";
    fetchSettlements(user.depot_id, startDate, adjustedEndDate);
  };

  const handleFilterShortcut = (type: "bulan_ini" | "7_hari" | "semua") => {
    if (!user?.depot_id) return;
    setActiveShortcut(type);

    if (type === "bulan_ini") {
      setStartDate(getFirstDayOfMonthStr());
      setEndDate(getTodayStr());
      fetchSettlements(user.depot_id, getFirstDayOfMonthStr(), endOfToday);
    } else if (type === "7_hari") {
      setStartDate(getSevenDaysAgoStr());
      setEndDate(getTodayStr());
      fetchSettlements(user.depot_id, getSevenDaysAgoStr(), endOfToday);
    } else if (type === "semua") {
      setStartDate("");
      setEndDate("");
      fetchSettlements(user.depot_id); 
    }
  };

  const summary = useMemo(() => {
    if (!settlements || settlements.length === 0) {
      return { trx: 0, subtotal: 0, tax: 0, grand: 0, expense: 0, net: 0 };
    }
    return settlements.reduce(
      (acc, curr) => ({
        trx: acc.trx + Number(curr.total_transactions || 0),
        subtotal: acc.subtotal + Number(curr.subtotal_amount || 0),
        tax: acc.tax + Number(curr.tax_amount || 0),
        grand: acc.grand + Number(curr.grand_total || 0),
        expense: acc.expense + Number(curr.total_expenses || 0),
        net: acc.net + Number(curr.net_income || 0),
      }),
      { trx: 0, subtotal: 0, tax: 0, grand: 0, expense: 0, net: 0 }
    );
  }, [settlements]);

  const chartData = useMemo(() => {
    if (!settlements) return [];
    return [...settlements].reverse().map((item) => ({
      date: new Date(item.settlement_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }),
      pendapatan: Number(item.grand_total || 0),
      transaksi: Number(item.total_transactions || 0),
    }));
  }, [settlements]);

  if (isLoadingSession) {
    return <div className="p-8 text-center animate-pulse text-gray-400 font-bold">Mempersiapkan Laporan Keuangan...</div>;
  }
  
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Laporan Keuangan</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {activeShortcut === "semua" 
              ? "Menampilkan semua riwayat settlement yang tercatat." 
              : `Menampilkan data periode: ${startDate ? formatDateFull(startDate) : '-'} s/d ${endDate ? formatDateFull(endDate) : '-'}`
            }
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button
              onClick={() => handleFilterShortcut("7_hari")}
              className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeShortcut === "7_hari" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              7 Hari
            </button>
            <button
              onClick={() => handleFilterShortcut("bulan_ini")}
              className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeShortcut === "bulan_ini" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handleFilterShortcut("semua")}
              className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeShortcut === "semua" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Semua
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
            />
            <span className="text-gray-400 font-bold">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
            />
            <button
              onClick={handleApplyFilter}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors shadow-sm flex justify-between items-center gap-2 font-semibold"
              title="Terapkan Filter"
            >
              <Filter size={18} />Tampilkan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Transaksi", value: `${summary.trx} Trx`, icon: Receipt, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Subtotal", value: formatRupiah(summary.subtotal), icon: Banknote, color: "text-gray-600", bg: "bg-gray-100" },
          { label: "Pajak Terpungut", value: formatRupiah(summary.tax), icon: Percent, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Grand Total", value: formatRupiah(summary.grand), icon: Wallet, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Pengeluaran", value: formatRupiah(summary.expense), icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
          { label: "Net Income", value: formatRupiah(summary.net), icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-3`}>
              <card.icon size={20} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wide">{card.label}</span>
            <div className={`text-sm sm:text-lg font-black mt-1 ${idx === 5 ? 'text-purple-600' : 'text-gray-800'}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col w-full">
        <h2 className="text-sm font-bold text-gray-800 uppercase mb-6 flex items-center gap-2">
          <Activity size={18} className="text-blue-500" /> Tren Pendapatan & Transaksi Harian
        </h2>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-87.5">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : settlements && settlements.length > 0 ? (
          <div className="w-full h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="left" 
                  tickFormatter={(val) => `Rp ${val / 1000}k`} 
                  tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 'bold' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                  formatter={(value, name) => {
                    const val = Number(value ?? 0);
                    if (name === "Grand Total") return [formatRupiah(val), name];
                    return [val, "Jumlah Transaksi"];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />

                <Bar 
                  yAxisId="right" 
                  dataKey="transaksi" 
                  name="Jumlah Transaksi" 
                  fill="#619eff"
                  barSize={60} 
                  radius={[8, 8, 0, 0]}
                />

                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="pendapatan" 
                  name="Grand Total" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-400 italic min-h-87.5">
            Tidak ada transaksi pada periode: {startDate ? formatDateFull(startDate) : '-'} s/d {endDate ? formatDateFull(endDate) : '-'}
          </div>
        )}
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col w-full">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
            <Calendar size={20} className="text-orange-500" /> Detail Riwayat Settlement
          </h2>
          <span className="text-xs font-bold text-gray-400 uppercase bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
            Total: {settlements?.length || 0} Hari
          </span>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase font-black">
              <tr>
                <th className="px-6 py-4">Tgl Settlement</th>
                <th className="px-6 py-4">Jml Trx</th>
                <th className="px-6 py-4 text-right">Subtotal</th>
                <th className="px-6 py-4 text-right">Pajak</th>
                <th className="px-6 py-4 text-right font-black ">Grand Total</th>
                <th className="px-6 py-4 text-right">Pengeluaran</th>
                <th className="px-6 py-4 text-right font-black ">Net Income</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>
                  </td>
                </tr>
              ) : settlements && settlements.length > 0 ? (
                settlements.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{formatDateTime(item.settlement_date)}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Oleh: {item.creator?.full_name || 'Kasir'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-[10px] font-black border border-blue-100">
                        {item.total_transactions} TRX
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-500">{formatRupiah(item.subtotal_amount)}</td>
                    <td className="px-6 py-4 text-right font-medium text-orange-500">{formatRupiah(item.tax_amount)}</td>
                    <td className="px-6 py-4 text-right font-black text-green-600">{formatRupiah(item.grand_total)}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-500">{formatRupiah(item.total_expenses)}</td>
                    <td className="px-6 py-4 text-right font-black text-blue-600">{formatRupiah(item.net_income)}</td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/kasir/reports/settlement/${item.id}`}>
                        <button className="cursor-pointer inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-colors shadow-sm">
                          <Eye size={14} /> Lihat Detail
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                    Tidak ada settlement pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}