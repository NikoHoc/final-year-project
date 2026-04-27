"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AlertCircle } from "lucide-react";

import { useTables } from "@/hooks/useTables";
import { transactionService } from "@/services/transactionService";
import { depotService } from "@/services/depotService";
import { User, Transaction, Depot } from "@/types";
import TableList from "@/components/tables/TableList";

export default function PelayanDashboard() {
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
        console.error("Gagal memuat data dashboard pelayan", error);
      }
    }
    setIsLoading(false);
  }, [fetchTables]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
  }, [loadDashboardData]);

  const handleTableClick = (tableId: number) => {
    const activeTx = activeTransactions.find(t => t.table_id === tableId);
    
    if (activeTx) {
      router.push(`/pelayan/pesanan/${activeTx.id}`);
    } else {
      router.push(`/pelayan/pesanan/new?table_id=${tableId}`);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 animate-pulse text-gray-400">Memuat Radar Meja Pelayan...</div>;
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between items-start gap-2">
        <h1 className="text-2xl font-bold text-blue-600">List Meja Depot</h1>
        <p className="text-gray-500 text-sm">
          Pilih meja untuk mencatat pesanan pelanggan. (Status Depot: <span className={depot.is_open ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{depot.is_open ? "BUKA" : "TUTUP"}</span>)
        </p>
      </div>

      {!depot.is_open && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center font-medium flex items-center justify-center gap-2">
          <AlertCircle size={20} /> Depot sedang ditutup. Tidak bisa menambah pesanan baru.
        </div>
      )}

      <TableList 
        role="pelayan"
        tables={tables}
        activeTransactions={activeTransactions}
        isDepotOpen={depot.is_open ?? false}
        onTableClick={handleTableClick}
      />
    </div>
  );
}