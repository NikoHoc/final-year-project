"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useTransaction } from "@/hooks/useTransaction";
import { supabaseRealtime } from "@/config/supabaseClient";
import { Transaction, TransactionItem, CartItem } from "@/types";
import { formatRupiah, formatDateTime } from "@/utils/format";
import { Smartphone, Printer, Clock } from "lucide-react";
import CheckoutOrderModal from "@/components/orders/waiter/CheckoutOrderModal"; // Impor modal checker Anda
import toast from "react-hot-toast";

// 💡 KOMPONEN KARTU KITCHEN TICKET ONLINE
const WaiterOnlineCard = ({ transaction, onOpenModal }: { transaction: Transaction, onOpenModal: (t: Transaction) => void }) => {
  const { fetchTransactionById } = useTransaction();
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTransactionById(transaction.id).then((data) => {
      if (isMounted && data?.items) setItems(data.items);
      if (isMounted) setIsLoadingItems(false);
    });
    return () => { isMounted = false; };
  }, [transaction.id, fetchTransactionById]);

  return (
    <div className="bg-white p-5 rounded-3xl border border-green-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
      
      <div className="pl-2">
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
          <span className="text-xs font-black text-gray-400">#{transaction.id.slice(0, 8)}</span>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md uppercase">
            {transaction.order_status}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-base font-black text-gray-800">{transaction.customer_name || "Pelanggan Aplikasi"}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <Clock size={12}/> {formatDateTime(transaction.created_at)}
          </p>
        </div>

        {/* Daftar Menu Ringkas */}
        <div className="bg-gray-50 p-3 rounded-2xl mb-4 max-h-40 overflow-y-auto">
          {isLoadingItems ? (
            <div className="text-center text-xs text-gray-400 animate-pulse py-2">Membaca menu...</div>
          ) : items.length > 0 ? (
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item.id} className="flex justify-between text-sm border-b border-gray-100/50 pb-1 last:border-none">
                  <span className="font-black text-gray-800">{item.quantity}x {item.menu?.name}</span>
                  {item.notes && <p className="text-[11px] text-red-500 font-medium block mt-0.5">Catatan: {item.notes}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-xs text-gray-400">Menu kosong</div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 pl-2">
        <button 
          onClick={() => onOpenModal({ ...transaction, items })} // Lempar data beserta item ter-load
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-all cursor-pointer shadow-blue-100"
        >
          <Printer size={14} /> Buka Struk Checker
        </button>
      </div>
    </div>
  );
};

export default function PelayanOnlineTransactionsPage() {
  const { user, isLoadingSession } = useSession();
  const { fetchAllTransactions } = useTransaction();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 State Pengatur CheckoutOrderModal Bawaan Anda
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCartItems, setModalCartItems] = useState<CartItem[]>([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const loadData = useCallback(async (silent = false) => {
    if (!user?.depot_id) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchAllTransactions(user.depot_id);
      setTransactions(data.filter(t => t.type === 'online'));
    } catch (error) {
      console.error("Gagal mengambil data transaksi online pelayan:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [user?.depot_id, fetchAllTransactions]);

  useEffect(() => {
    if (isLoadingSession || !user?.depot_id) return;
    loadData(false);

    const channel = supabaseRealtime
      .channel(`pelayan-online-realtime-${user.depot_id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `depot_id=eq.${user.depot_id}` },
        () => { loadData(true); }
      )
      .subscribe();

    return () => { supabaseRealtime.removeChannel(channel); };
  }, [user?.depot_id, isLoadingSession, loadData]);

  // 💡 JEMBATAN MAPPING DATA: Mengubah TransactionItem database menjadi format CartItem Kompatibel Modal
  const handleOpenPrintModal = (t: Transaction & { items?: TransactionItem[] }) => {
    if (!t.items || t.items.length === 0) {
      toast.error("Detail item pesanan belum siap, silakan tunggu sesaat.");
      return;
    }

    const mappedCartItems: CartItem[] = t.items.map((item) => ({
      id: item.id,
      menu_id: item.menu_id,
      quantity: item.quantity,
      price: Number(item.price),
      is_half_portion: item.is_half_portion || false,
      note: item.notes || "",
      is_saved: true,               // 💡 Dipaksa true agar lolos filter `cartItems.filter(item => item.is_saved)` di dalam modal Anda
      batch_number: item.batch_number || 1, // Jika pesanan online masuk sekaligus, default batch 1
      menu: {
        id: item.menu?.id || item.menu_id,
        name: item.menu?.name || "Menu Tak Dikenal",
        price: Number(item.menu?.price || item.price),
        image_url: item.menu?.image_url || null,
        category_id: item.menu?.category_id || 0,
        category: item.menu?.category || { id: 0, name: "Lainnya" }
      }
    }));

    setSelectedCustomerName(t.customer_name || "Pelanggan Aplikasi");
    setSelectedTxId(`ONLINE #${t.id.slice(0, 8)}`); // Memanfaatkan string ID pendek untuk judul tabel meja di struk
    setModalCartItems(mappedCartItems);
    setIsModalOpen(true);
  };

  const activeCookingOrders = transactions.filter(
    (t) => t.payment_status === "paid" && ["confirmed", "cooking", "ready"].includes(t.order_status)
  );

  const historyOnlineOrders = transactions.filter(
    (t) => ["completed", "cancelled"].includes(t.order_status)
  );

  if (isLoading) return <div className="h-64 flex items-center justify-center animate-pulse text-gray-400">Menyiapkan Order Tiket Dapur...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Order Aplikasi</h1>
          <p className="text-gray-500 text-sm">Pantau pesanan online yang sudah lunas dibayar dan buka lembar manifes untuk dikirim ke juru masak dapur.</p>
        </div>
      </div>

      {/* ANTRIAN SIAP MASAK */}
      <div className="space-y-4">
        <h2 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest text-green-600">
          <div className="w-1.5 h-5 bg-green-500 rounded-full animate-pulse"></div>
          Antrean Siap Masak ({activeCookingOrders.length})
        </h2>
        {activeCookingOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeCookingOrders.map(t => (
              <WaiterOnlineCard key={t.id} transaction={t} onOpenModal={handleOpenPrintModal} />
            ))}
          </div>
        ) : (
          <div className="py-12 bg-white border border-gray-100 rounded-3xl text-center text-gray-400 shadow-sm font-medium text-sm">
            Belum ada pesanan dari aplikasi yang siap dimasak saat ini.
          </div>
        )}
      </div>

      {/* TABEL RIWAYAT SELESAI */}
      <div className="space-y-4 pt-6 border-t border-gray-200 border-dashed">
        <h2 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest text-gray-400">
          <div className="w-1.5 h-5 bg-gray-400 rounded-full"></div>
          Riwayat Penyelesaian Pesanan Online
        </h2>
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 pl-6">ID Nota</th>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Nama Pelanggan</th>
                  <th className="p-4">Total Belanja</th>
                  <th className="p-4">Pembayaran</th>
                  <th className="p-4 pr-6">Status Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                {historyOnlineOrders.length > 0 ? (
                  historyOnlineOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-6 font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</td>
                      <td className="p-4 text-xs text-gray-500">{formatDateTime(order.created_at)}</td>
                      <td className="p-4 font-bold text-gray-800">{order.customer_name || "Pelanggan Online"}</td>
                      <td className="p-4 text-blue-600 font-black">{formatRupiah(order.grand_total)}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200 uppercase">
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="p-4 pr-6">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                          order.order_status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {order.order_status === "completed" ? "Selesai Disajikan" : "Dibatalkan / Tolak"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-xs text-gray-400">Belum ada rekaman riwayat transaksi online hari ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 💡 IMPLEMENTASI MODAL CHECKER BAWAAN PROYEK ANDA */}
      <CheckoutOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cartItems={modalCartItems}
        tableId={selectedTxId}           // Berisi id nota pendek (Misal: "ONLINE #c8e15ccf")
        customerName={selectedCustomerName} // Berisi nama pembeli online
      />
    </div>
  );
}