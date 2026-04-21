"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Power } from "lucide-react";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { PaymentMethod } from "@/types";
import Modal from "@/components/ui/Modal";

export default function PaymentMethodsAdminPage() {
  const { methods, isLoading, fetchMethods, createMethod, updateMethod, deleteMethod } = usePaymentMethods();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Metode Pembayaran</h1>
          <p className="text-gray-500 text-sm">Kelola daftar metode pembayaran universal untuk semua cabang depot.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> Tambah Metode
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat data...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
              <tr>
                <th className="p-4 font-semibold">Nama Metode</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {methods.length === 0 ? (
                <tr><td colSpan={3} className="p-6 text-center text-gray-400">Belum ada data</td></tr>
              ) : (
                methods.map((method) => (
                  <tr key={method.id} className="hover:bg-gray-50/50 transition-colors">
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
        )}
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