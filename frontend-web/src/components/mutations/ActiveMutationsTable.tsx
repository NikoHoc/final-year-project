"use client";

import { useState } from "react";
import { Search, Pencil, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { StockMutation } from "@/types";
import { formatDateTime } from "@/utils/format";
import { useStock } from "@/hooks/useStock";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";

interface Props {
  data: StockMutation[];
  isLoading: boolean;
  depotId: number | null;
  onRefresh: () => void;
  onEdit?: (m: StockMutation) => void;
  readOnly?: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function ActiveMutationsTable({ data, isLoading, depotId, onRefresh, onEdit, readOnly, title, description, icon }: Props) {
  const { deleteMutation, processMutation } = useStock();
  const [search, setSearch] = useState("");
  const [targetDelete, setTargetDelete] = useState<StockMutation | null>(null);
  const [targetAccept, setTargetAccept] = useState<StockMutation | null>(null);
  const [targetReject, setTargetReject] = useState<StockMutation | null>(null);

  const [sentQty, setSentQty] = useState<number>(0);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = data.filter(m => m.item_name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    if (targetDelete) {
      await deleteMutation(targetDelete.id);
      setTargetDelete(null);
      onRefresh();
    }
  };

  const handleAcceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetAccept) {
      await processMutation(targetAccept.id, { status: "completed", sent_quantity: sentQty });
      setTargetAccept(null);
      onRefresh();
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetReject) {
      await processMutation(targetReject.id, { status: "rejected", rejection_reason: rejectReason });
      setTargetReject(null);
      setRejectReason("");
      onRefresh();
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-2">
          <div>
            <h2 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
              {icon}
              <span>{title}</span>
            </h2>
            {description && (
              <p className="text-xs text-gray-500 mt-1 font-semibold">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari permintaan..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm"
          />
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
              {readOnly ? <th className="px-4 py-4">Status</th> : <th className="px-4 py-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
               <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Memuat data...</td></tr>
            ) : filtered.length === 0 ? (
               <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Tidak ada permintaan aktif.</td></tr>
            ) : (
              filtered.map((m, idx) => (
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
                  <td className="px-4 py-4 italic max-w-37.5">{m.requester_notes || "-"}</td>
                  <td className="px-4 py-4 font-medium">{m.provider?.name}</td>
                  {readOnly ? (
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider">
                        <Clock size={12} /> Pending
                      </span>
                    </td>
                  ) : (
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {m.requester_id === depotId ? (
                          <>
                            {onEdit && <button onClick={() => onEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Pencil size={18}/></button>}
                            <button onClick={() => setTargetDelete(m)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setTargetAccept(m); setSentQty(m.requested_quantity); }} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 shadow-sm"><CheckCircle size={14}/> Terima</button>
                            <button onClick={() => setTargetReject(m)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-bold border border-red-100"><XCircle size={14}/> Tolak</button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal isOpen={!!targetDelete} onClose={() => setTargetDelete(null)} onConfirm={handleDelete} title="Batalkan Permintaan?" message={`Hapus permintaan ${targetDelete?.item_name}?`} type="danger" />
      
      <Modal isOpen={!!targetAccept} onClose={() => setTargetAccept(null)} title="Konfirmasi Pengiriman">
        <form onSubmit={handleAcceptSubmit} className="space-y-4">
          <p className="text-sm">Berapa banyak <b>{targetAccept?.item_name}</b> yang Anda kirim ke <b>{targetAccept?.requester?.name}?</b></p>
          <div className="space-y-2">
            <input type="number" step="0.01" required max={targetAccept?.requested_quantity} value={sentQty} onChange={e => setSentQty(parseFloat(e.target.value))} className="w-full p-4 border rounded-2xl text-center text-2xl font-black focus:border-green-500 outline-none bg-gray-50" />
            <p className="text-center text-xs text-gray-400">Maksimal: {targetAccept?.requested_quantity} {targetAccept?.unit}</p>
          </div>
          <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700">Konfirmasi Terima</button>
        </form>
      </Modal>

      <Modal isOpen={!!targetReject} onClose={() => setTargetReject(null)} title="Tolak Permintaan">
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Alasan Penolakan:</label>
            <textarea required value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-red-500 min-h-25" placeholder="Contoh: Stok di depot kami sedang kosong..." />
          </div>
          <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700">Tolak Sekarang</button>
        </form>
      </Modal>
    </div>
  );
}