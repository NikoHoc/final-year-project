"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useTransaction } from "@/hooks/useTransaction";
import { supabaseRealtime } from "@/config/supabaseClient";
import { Transaction, TransactionItem } from "@/types";
import { formatRupiah, formatDateTime } from "@/utils/format";
import { Smartphone, Check, X, Clock, AlertCircle, RefreshCw, Receipt } from "lucide-react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

// 💡 KOMPONEN KARTU PINTAR: Mengambil detail item-nya sendiri
const OnlineOrderCard = ({ transaction, onAction }: { transaction: Transaction, onAction?: (action: 'accept' | 'reject', t: Transaction) => void }) => {
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
    <div className={`bg-white p-5 rounded-3xl border shadow-sm flex flex-col justify-between transition-all ${
      transaction.order_status === "pending" ? "border-amber-200 bg-amber-50/20" : 
      transaction.payment_status === "paid" ? "border-green-200 bg-green-50/20" : "border-gray-100"
    }`}>
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
          <span className="text-xs font-black text-gray-500">#{transaction.id.slice(0, 8)}</span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border ${
            transaction.order_status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" : 
            transaction.payment_status === "paid" ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-50 text-blue-600 border-blue-200"
          }`}>
            {transaction.order_status === "pending" ? "MEMBUTUHKAN PERSETUJUAN" : 
             transaction.payment_status === "paid" ? `DIBAYAR - ${transaction.order_status}` : "MENUNGGU PEMBAYARAN"}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase">Pelanggan</p>
          <p className="text-base font-black text-gray-800">{transaction.customer_name || "Guest Online"}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Clock size={12}/> {formatDateTime(transaction.created_at)}</p>
        </div>

        {/* List Item Pesanan */}
        <div className="bg-gray-50 p-3 rounded-xl mb-4 max-h-32 overflow-y-auto">
          {isLoadingItems ? (
            <div className="text-center text-xs text-gray-400 animate-pulse">Memuat pesanan...</div>
          ) : items.length > 0 ? (
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">{item.quantity}x {item.menu?.name}</span>
                  <span className="text-gray-500">{formatRupiah(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          ) : (
             <div className="text-center text-xs text-gray-400">Tidak ada detail item</div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Tagihan</p>
          <p className="text-lg font-black text-blue-600">{formatRupiah(transaction.grand_total)}</p>
        </div>
      </div>

      {transaction.order_status === "pending" && onAction && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
          <button onClick={() => onAction('reject', transaction)} className="flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 cursor-pointer">
            <X size={14} /> Tolak
          </button>
          <button onClick={() => onAction('accept', transaction)} className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm cursor-pointer">
            <Check size={14} /> Terima
          </button>
        </div>
      )}
    </div>
  );
};

export default function OnlineTransactionsPage() {
  const { user, isLoadingSession } = useSession();
  const { fetchAllTransactions, updateStatus } = useTransaction(); // Pastikan Anda punya fungsi updateStatus di hooks Anda
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modals
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadData = useCallback(async (silent = false) => {
    if (!user?.depot_id) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchAllTransactions(user.depot_id);
      // Filter hanya tipe online
      setTransactions(data.filter(t => t.type === 'online'));
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [user?.depot_id, fetchAllTransactions]);

  useEffect(() => {
    if (isLoadingSession || !user?.depot_id) return;
    loadData(false);

    const channel = supabaseRealtime
      .channel(`online-transactions-owner-${user.depot_id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `depot_id=eq.${user.depot_id}` },
        () => { loadData(true); } // Silent refresh saat ada order baru/dibayar
      )
      .subscribe();

    return () => { supabaseRealtime.removeChannel(channel); };
  }, [user?.depot_id, isLoadingSession, loadData]);

  // Handler Aksi
  const handleActionClick = (action: 'accept' | 'reject', t: Transaction) => {
    setSelectedTx(t);
    if (action === 'accept') setIsAcceptModalOpen(true);
    else setIsRejectModalOpen(true);
  };

  const submitAccept = async () => {
    if (!selectedTx) return;
    try {
      await updateStatus(selectedTx.id, { order_status: 'confirmed' });
      toast.success("Pesanan Diterima! Menunggu pembayaran pelanggan.");
      setIsAcceptModalOpen(false);
      loadData(true);
    } catch (error) { toast.error("Gagal memproses pesanan."); }
  };

  const submitReject = async () => {
    if (!selectedTx || !rejectReason) return toast.error("Alasan wajib diisi!");
    try {
      // 💡 Membatalkan pesanan
      await updateStatus(selectedTx.id, { order_status: 'cancelled', rejection_reason: rejectReason });
      toast.success("Pesanan berhasil ditolak.");
      setIsRejectModalOpen(false);
      setRejectReason("");
      loadData(true);
    } catch (error) { toast.error("Gagal menolak pesanan."); }
  };

  // 💡 PEMISAHAN SECTION
  const pendingOrders = transactions.filter(t => t.order_status === "pending");
  const activeOrders = transactions.filter(t => ["confirmed", "cooking", "ready"].includes(t.order_status));
  const historyOrders = transactions.filter(t => ["completed", "cancelled"].includes(t.order_status));

  if (isLoading) return <div className="h-64 flex items-center justify-center animate-pulse text-gray-400">Memuat Data Online...</div>;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><Smartphone size={24} /></div>
        <div>
          <h1 className="text-2xl font-black text-gray-800">Manajemen Pesanan Online</h1>
          <p className="text-sm text-gray-500 font-medium">Setujui pesanan aplikasi agar pelanggan bisa melakukan pembayaran.</p>
        </div>
      </div>

      {/* SECTION 1: MENUNGGU PERSETUJUAN */}
      <div className="space-y-4">
        <h2 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-amber-500 rounded-full"></div>
          Perlu Persetujuan ({pendingOrders.length})
        </h2>
        {pendingOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pendingOrders.map(t => <OnlineOrderCard key={t.id} transaction={t} onAction={handleActionClick} />)}
          </div>
        ) : (
          <div className="py-12 bg-white border border-gray-100 rounded-3xl text-center text-gray-400 shadow-sm">
            Tidak ada pesanan baru yang menunggu persetujuan.
          </div>
        )}
      </div>

      {/* SECTION 2: SEDANG DIPROSES / MENUNGGU PEMBAYARAN */}
      <div className="space-y-4 pt-4 border-t border-gray-200 border-dashed">
        <h2 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
          Pesanan Berjalan ({activeOrders.length})
        </h2>
        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {activeOrders.map(t => <OnlineOrderCard key={t.id} transaction={t} />)}
          </div>
        ) : (
          <div className="py-8 bg-gray-50 rounded-2xl text-center text-sm font-medium text-gray-400 border border-gray-100">
            Belum ada pesanan aktif.
          </div>
        )}
      </div>

      {/* SECTION 3: RIWAYAT BISA DIBUAT BERUPA TABEL NANTINYA (Sama spt HistoryMutationsTable) */}

      {/* MODAL TERIMA */}
      <Modal isOpen={isAcceptModalOpen} onClose={() => setIsAcceptModalOpen(false)} title="Terima Pesanan">
        <div className="space-y-4">
          <p className="text-gray-600 font-medium">Apakah Anda yakin menerima pesanan ini? Pelanggan akan diarahkan ke Midtrans untuk menyelesaikan pembayaran sejumlah <b>{selectedTx && formatRupiah(selectedTx.grand_total)}</b>.</p>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsAcceptModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Batal</button>
            <button onClick={submitAccept} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md">Ya, Terima</button>
          </div>
        </div>
      </Modal>

      {/* MODAL TOLAK */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Tolak Pesanan">
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700">Alasan Penolakan (Akan dibaca pelanggan):</label>
          <textarea 
            value={rejectReason} 
            onChange={(e) => setRejectReason(e.target.value)} 
            placeholder="Contoh: Maaf, ayam goreng baru saja habis..."
            className="w-full p-4 bg-gray-50 border rounded-2xl focus:border-red-500 outline-none min-h-[120px]"
          />
          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsRejectModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Batal</button>
            <button onClick={submitReject} disabled={!rejectReason} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md disabled:bg-red-300">Konfirmasi Tolak</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}