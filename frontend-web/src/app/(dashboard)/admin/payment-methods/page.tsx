"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Power, Search } from "lucide-react";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { PaymentMethod } from "@/types";
import Modal from "@/components/ui/Modal";

export default function PaymentMethodsAdminPage() {
  const { methods, isLoading, fetchMethods, createMethod, updateMethod, deleteMethod } = usePaymentMethods();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const openModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      setName(method.name);
      setIsActive(method.is_active);
    } else {
      setEditingMethod(null);
      setName("");
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (editingMethod) {
      success = await updateMethod(editingMethod.id, { name, is_active: isActive });
    } else {
      success = await createMethod({ name, is_active: isActive });
    }
    
    if (success) setIsModalOpen(false);
  };

  const filteredMethods = methods.filter((method) => 
    method.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            Manajemen Metode Pembayaran
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Kelola daftar metode pembayaran universal untuk semua cabang depot.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={18} /> Metode
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-gray-800">Daftar Metode Pembayaran</h2>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari metode pembayaran..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
              <tr>
                <th className="p-4 font-semibold">No</th>
                <th className="p-4 font-semibold">Nama Metode</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredMethods.length === 0 ? ( 
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">Belum ada metode pembayaran ditemukan.</td></tr>
              ) : (
                filteredMethods.map((method, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{index+1}</td>
                    <td className="p-4 font-bold text-gray-800">{method.name}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full ${method.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {method.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => updateMethod(method.id, { is_active: !method.is_active })} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors" title="Toggle Status">
                          <Power size={16} />
                        </button>
                        <button onClick={() => openModal(method)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { if(confirm('Hapus metode ini?')) deleteMethod(method.id); }} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMethod ? "Edit Metode" : "Tambah Metode"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Metode</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Contoh: QRIS BCA"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              required 
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Metode ini aktif dan bisa digunakan Kasir</label>
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium">Batal</button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}