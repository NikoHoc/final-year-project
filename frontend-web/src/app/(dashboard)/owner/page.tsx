"use client";

import { useEffect, useState } from "react";
import { Store, Receipt, Layers, LayoutGrid, Inbox, Power, Activity, Utensils } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useSettlement } from "@/hooks/useSettlement";
import { useTransaction } from "@/hooks/useTransaction";
import { useDepots } from "@/hooks/useDepot";
import { useTables } from "@/hooks/useTables";
import { useStock } from "@/hooks/useStock";
import Link from "next/link";

export default function OwnerDashboard() {
  const { user, depot, isLoadingSession } = useSession();
  const { todayData, fetchTodaySummary } = useSettlement();
  const { toggleDepotStatus, getDepotMenus } = useDepots();
  const { fetchAllTransactions } = useTransaction();
  const { fetchTables } = useTables();
  const { fetchActiveMutations } = useStock();
  
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);
  const [pendingMutationCount, setPendingMutationCount] = useState(0);

  useEffect(() => {
    if (!isLoadingSession && user?.depot_id) {
      fetchTodaySummary(user.depot_id);
      
      fetchAllTransactions(user.depot_id, 'active').then((res) => {
        setActiveOrdersCount(res.length);
      });

      getDepotMenus(user.depot_id).then((res) => {
        setMenuCount(res.length);
      });

      fetchTables(user.depot_id).then((res) => {
        if (res) setTableCount(res.length);
      });

      fetchActiveMutations(user.depot_id).then((res) => {
        const needsApproval = res.filter((m) => m.provider_id === user.depot_id && m.status === 'pending');
        setPendingMutationCount(needsApproval.length);
      });
    }
  }, [isLoadingSession, user?.depot_id, fetchTodaySummary, fetchAllTransactions, getDepotMenus, fetchTables, fetchActiveMutations]);

  const handleToggleStatus = async () => {
    if (!depot) return;
    await toggleDepotStatus(depot.id, !depot.is_open);
    window.location.reload(); 
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            Selamat Datang, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Pantauan operasional hari ini untuk <span className="font-bold text-gray-700">{depot?.name || "Cabang Anda"}</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 p-2 pl-4 rounded-2xl border border-gray-200">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Status Depot</span>
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
              depot?.is_open ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <Power size={14} /> {depot?.is_open ? "Buka (Terima Pesanan)" : "Tutup (Jeda)"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Receipt size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transaksi Hari Ini</p>
            <p className="text-2xl font-black text-gray-800">{todayData?.summary.total_transactions || 0} <span className="text-[10px] font-bold text-gray-400">Nota</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Layers size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Menu Aktif</p>
            <p className="text-2xl font-black text-gray-800">{menuCount} <span className="text-[10px] font-bold text-gray-400">Item</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><LayoutGrid size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kapasitas Meja</p>
            <p className="text-2xl font-black text-gray-800">{tableCount} <span className="text-[10px] font-bold text-gray-400">Meja</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Utensils size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pesanan Aktif (Dapur)</p>
            <p className="text-2xl font-black text-gray-800">{activeOrdersCount} <span className="text-[10px] font-bold text-gray-400">Antrean</span></p>
          </div>
        </div>

        <div className={`bg-white p-5 rounded-3xl shadow-sm border transition-colors flex flex-col gap-3 ${pendingMutationCount > 0 ? 'border-red-300 bg-red-50/30' : 'border-gray-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pendingMutationCount > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
            <Inbox size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mutasi Masuk</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-gray-800">{pendingMutationCount}</p>
              {pendingMutationCount > 0 && (
                <span className="text-[9px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">Perlu Diproses!</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2"><Store size={18} className="text-blue-500"/> Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/owner/onsite-transactions" className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group flex flex-col gap-3">
            <span className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Store size={20} className="text-gray-700"/></span>
            <span className="text-sm font-bold text-gray-800">POS Kasir Utama</span>
          </Link>
          <Link href="/owner/reports" className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group flex flex-col gap-3">
            <span className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Activity size={20} className="text-gray-700"/></span>
            <span className="text-sm font-bold text-gray-800">Laporan Analitik</span>
          </Link>
          <Link href="/owner/mutations" className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group flex flex-col gap-3 relative">
            {pendingMutationCount > 0 && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>}
            <span className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Inbox size={20} className="text-gray-700"/></span>
            <span className="text-sm font-bold text-gray-800">Request Stok Masuk</span>
          </Link>
          <Link href="/owner/depots" className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group flex flex-col gap-3">
            <span className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Layers size={20} className="text-gray-700"/></span>
            <span className="text-sm font-bold text-gray-800">Pengaturan Cabang</span>
          </Link>
        </div>
      </div>
    </div>
  );
}