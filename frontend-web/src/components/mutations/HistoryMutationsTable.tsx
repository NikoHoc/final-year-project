"use client";

import { useState } from "react";
import { Search, Clock, Filter } from "lucide-react";
import { StockMutation } from "@/types";
import { formatDateFull, formatDateTime } from "@/utils/format";

interface HistoryMutationsTableProps {
  data: StockMutation[];
  isLoading: boolean;

  activeShortcut: "bulan_ini" | "semua" | "custom";

  startDate: string;
  endDate: string;

  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;

  onApplyFilter: () => void;

  onShortcutChange: (
    type: "bulan_ini" | "semua"
  ) => void;
}

export default function HistoryMutationsTable({ data, isLoading, activeShortcut, startDate, endDate, onStartDateChange, onEndDateChange, onApplyFilter, onShortcutChange }: HistoryMutationsTableProps) {
  const [search, setSearch] = useState("");
  const filtered = data.filter(m => m.item_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
            <Clock size={20} /> Riwayat Mutasi
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-semibold">
            {activeShortcut === "semua" 
              ? "Menampilkan semua riwayat settlement yang tercatat." 
              : `Menampilkan data periode: ${startDate ? formatDateFull(startDate) : '-'} s/d ${endDate ? formatDateFull(endDate) : '-'}`
            }
          </p>
        </div>
        <div>
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                onClick={() => onShortcutChange("bulan_ini")}
                className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeShortcut === "bulan_ini" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Bulan Ini
              </button>

              <button
                onClick={() => onShortcutChange("semua")}
                className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeShortcut === "semua" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Semua
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
              />

              <button 
                onClick={onApplyFilter}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors shadow-sm flex justify-between items-center gap-2 font-semibold"
                title="Terapkan Filter"
              >
                <Filter size={18} />
                Tampilkan
              </button>
            </div>
          </div>
          {/* <div className="relative w-full mt-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari riwayat..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-gray-400 transition-all text-sm"
            />
          </div> */}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-400 uppercase">
              <th className="px-4 py-4">No</th>
              <th className="px-4 py-4">Tgl Request</th>
              <th className="px-4 py-4">Peminta</th>
              <th className="px-4 py-4">Nama Barang</th>
              <th className="px-4 py-4">Jml Diminta</th>
              <th className="px-4 py-4">Keterangan</th>
              <th className="px-4 py-4">Penyedia</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Jml Kirim</th>
              <th className="px-4 py-4">Alasan Penolakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
               <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">Memuat riwayat...</td></tr>
            ) : filtered.length === 0 ? (
               <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">Tidak ada riwayat.</td></tr>
            ) : (
              filtered.map((m, idx) => {
                const isPartial = m.status === 'completed' && m.sent_quantity! < m.requested_quantity;
                return (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group text-sm">
                    <td className="px-4 py-4">{idx + 1}</td>
                    <td className="px-4 py-4 font-medium">{formatDateTime(m.created_at)}</td>
                    <td className="px-4 py-4 font-medium">{m.requester?.name}</td>
                    <td className="px-4 py-4 font-bold text-blue-700">{m.item_name}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {m.requested_quantity} {m.unit}
                      </span>
                    </td>
                    <td className="px-4 py-4 italic max-w-30">{m.requester_notes || "-"}</td>
                    <td className="px-4 py-4 font-medium">{m.provider?.name}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md 
                        ${m.status === 'completed' && !isPartial ? 'bg-green-50 text-green-600' 
                        : m.status === 'completed' && isPartial ? 'bg-orange-50 text-orange-600' 
                        : 'bg-red-50 text-red-600'}`}>
                        {m.status === 'completed' ? (isPartial ? 'Parsial' : 'Selesai') : 'Ditolak'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {m.status === 'completed' ? (
                        <span className={`text-xs font-bold px-2 py-1 rounded-md inline-block ${
                          isPartial ? 'text-orange-600 bg-orange-50' : 'text-green-700 bg-green-50'
                        }`}>
                          {m.sent_quantity} {m.unit}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-bold">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-bold text-red-500 italic max-w-37.5">
                      {m.rejection_reason || "-"}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}