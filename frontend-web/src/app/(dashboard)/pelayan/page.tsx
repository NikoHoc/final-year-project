"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { useTables } from "@/hooks/useTables";
import { Transaction } from "@/types";
import TableList from "@/components/tables/TableList";
import TakeawayCard from "@/components/orders/TakeawayCard";
import { useTransaction } from "@/hooks/useTransaction";
import { useSession } from "@/contexts/SessionContext";
import { supabaseRealtime } from "@/config/supabaseClient";

export default function PelayanDashboard() {
  const router = useRouter();
  const { tables, fetchTables } = useTables();
  const { fetchAllTransactions } = useTransaction();
  const { user, depot, isLoadingSession } = useSession();
  
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async (silent = false) => {
    if (!user?.depot_id) return;
    
    if (!silent) setIsLoading(true); 
      
    try {
      await fetchTables(user.depot_id);
      const activeData = await fetchAllTransactions(user.depot_id, 'active');
      setActiveTransactions(activeData);
    } catch (error) {
      console.error("Gagal memuat data dashboard", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [user?.depot_id, fetchAllTransactions, fetchTables]);

  useEffect(() => {
    if (isLoadingSession || !user?.depot_id) return;

    loadDashboardData(false);

    const transactionChannel = supabaseRealtime
      .channel(`onsite-transactions-waiter-${user.depot_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `depot_id=eq.${user.depot_id}`
        },
        (payload) => {
          console.log("WAITER onsite-transactions data updated: ", payload);
          loadDashboardData(true);
        }
      )
      .subscribe();

    return () => {
      supabaseRealtime.removeChannel(transactionChannel);
    };
  }, [isLoadingSession, user?.depot_id, loadDashboardData]);

  const diningTransactions = activeTransactions.filter((t) => t.type === "dining");
  const takeawayTransactions = activeTransactions.filter((t) => t.type === "takeaway");

  const handleTableClick = (tableId: number) => {
    const activeTx = diningTransactions.find(t => t.table_id === tableId);
    
    if (activeTx) {
      router.push(`/pelayan/pesanan/${activeTx.id}?type=dining`);
    } else {
      router.push(`/pelayan/pesanan/new?table_id=${tableId}&type=dining`);
    }
  };

  if (isLoadingSession || isLoading) {
    return (
      <div className="flex justify-center items-center h-64 animate-pulse text-gray-400 font-bold">
        Memuat Radar Meja Pelayan...
      </div>
    );
  }

  if (!depot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p>Akun pelayan ini tidak terikat pada cabang manapun.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Waiter</h1>
          <p className="text-gray-500 text-sm">
            Pilih meja untuk mencatat pesanan pelanggan. (Status Depot: <span className={depot.is_open ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{depot.is_open ? "BUKA" : "TUTUP"}</span>)
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => router.push(`/pelayan/pesanan/new?type=takeaway`)}
            disabled={!depot.is_open}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-bold transition-all shadow-sm"
          >
            <ShoppingBag size={18} /> Takeaway
          </button>
        </div>
      </div>

      {!depot.is_open && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center font-medium flex items-center justify-center gap-2">
          <AlertCircle size={20} /> Depot sedang ditutup. Tidak bisa menambah pesanan baru.
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-gray-800 rounded-full"></div>
          DINE - IN
        </h3>
        <TableList 
          tables={tables} 
          activeTransactions={diningTransactions} 
          isDepotOpen={!!depot?.is_open}
          role="pelayan"
          onTableClick={handleTableClick}
        />
      </div>

      <div className="space-y-4 mt-10">
        <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
          Antrean Takeaway
        </h3>
        
        {takeawayTransactions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {takeawayTransactions.map((transaction) => (
              <TakeawayCard key={transaction.id} transaction={transaction} role="pelayan" isDepotOpen={!!depot?.is_open} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl py-12 flex flex-col items-center justify-center text-gray-400 shadow-sm">
            <ShoppingBag size={40} className="mb-3 text-gray-300" />
            <p className="text-sm font-bold text-gray-500">Tidak ada antrean</p>
            <p className="text-xs mt-1">Belum ada pesanan takeaway yang aktif saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}