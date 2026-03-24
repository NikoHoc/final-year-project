"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ShoppingBag, Power, Coffee, AlertCircle, LayoutGrid } from "lucide-react";

import { useTables } from "@/hooks/useTables";
import { transactionService } from "@/services/transactionService";
import { depotService } from "@/services/depotService";
import { User, Transaction, Depot } from "@/types";
import toast from "react-hot-toast";

export default function KasirDashboard() {
  const router = useRouter();
  const { tables, fetchTables } = useTables();
  
  const [depot, setDepot] = useState<Depot | null>(null);
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const user: User = JSON.parse(userCookie);
        if (user.depot_id) {
          const depotData = await depotService.getById(user.depot_id);
          setDepot(depotData.data || depotData); 

          await fetchTables(user.depot_id);

          const allTransactions = await transactionService.getAll(user.depot_id);
          const active = allTransactions.filter(
            t => t.payment_status === "unpaid" && t.order_status !== "cancelled"
          );
          setActiveTransactions(active);
        }
      } catch (error) {
        console.error("Gagal memuat data dashboard", error);
      }
    }
    setIsLoading(false);
  }, [fetchTables]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
  }, [loadDashboardData]);

  const handleToggleDepotStatus = async () => {
    if (!depot) return;
    try {
      const newStatus = !depot.is_open;
      await depotService.toggleStatus(depot.id, newStatus);
      setDepot({ ...depot, is_open: newStatus });
      toast.success(newStatus ? "Depot BUKA, siap menerima pesanan!" : "Depot TUTUP.");
    } catch (error) {
      console.error("Gagal mengubah status depot:", error); 
      toast.error("Gagal mengubah status depot");
    }
  };

  const handleTableClick = (tableId: number) => {
    const activeTx = activeTransactions.find(t => t.table_id === tableId);
    
    if (activeTx) {
      router.push(`/kasir/pos/${activeTx.id}`);
    } else {
      router.push(`/kasir/pos/new?table_id=${tableId}&type=onsite`);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 animate-pulse text-gray-400">Memuat Dashboard Kasir...</div>;
  }

  if (!depot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p>Akun kasir ini tidak terikat pada cabang manapun.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard POS</h1>
          <p className="text-gray-500 text-sm mt-1">Pilih meja untuk Dine-in, atau klik Takeaway.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleToggleDepotStatus}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
              depot.is_open 
                ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200" 
                : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
            }`}
          >
            <Power size={18} /> {depot.is_open ? "DEPOT BUKA" : "DEPOT TUTUP"}
          </button>

          <button 
            onClick={() => router.push(`/kasir/pos/new?type=takeaway`)}
            disabled={!depot.is_open}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-bold transition-all shadow-sm"
          >
            <ShoppingBag size={18} /> Takeaway
          </button>
        </div>
      </div>

      {!depot.is_open && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center font-medium flex items-center justify-center gap-2">
          <AlertCircle size={20} /> Depot sedang ditutup. Buka depot untuk menerima pesanan baru.
        </div>
      )}

      {tables.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <LayoutGrid size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Belum Ada data meja</h3>
          <p className="text-gray-500 max-w-sm mt-2 mb-6">Tambahkan data meja terlebih dahulu untuk mulai menerima pesanan pelanggan secara Dine-in.</p>
          <button 
            onClick={() => router.push("/kasir/tables")} 
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Kelola Meja Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {tables.map((table) => {
            const activeTx = activeTransactions.find(t => t.table_id === table.id);
            const isOccupied = !!activeTx;

            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                disabled={!depot.is_open && !isOccupied} 
                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group ${
                  isOccupied 
                    ? "bg-yellow-50 border-yellow-400 shadow-md shadow-yellow-100/50 hover:bg-yellow-100" 
                    : "bg-white border-gray-100 hover:border-blue-400 hover:shadow-md" 
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
                  isOccupied ? "bg-yellow-200 text-yellow-800" : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                }`}>
                  <Coffee size={32} />
                </div>
                <span className="text-lg font-bold text-gray-800">{table.table_number}</span>
                
                <span className={`text-xs mt-1 font-semibold ${isOccupied ? "text-yellow-700" : "text-gray-400"}`}>
                  {isOccupied ? "Terisi (Belum Bayar)" : "Kosong"}
                </span>

                <div className={`absolute top-0 inset-x-0 h-1.5 rounded-t-xl ${isOccupied ? "bg-yellow-400" : "bg-green-400"}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}