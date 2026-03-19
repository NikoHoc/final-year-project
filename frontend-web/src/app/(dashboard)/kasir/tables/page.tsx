"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Plus, Pencil, Trash2, AlertCircle, LayoutGrid } from "lucide-react";
import { useTables } from "@/hooks/useTables";
import { Table, User } from "@/types";

import TableFormModal from "@/components/tables/TableFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function KasirTablesPage() {
  const {
    tables,
    isLoading,
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
  } = useTables();
  const [depotId, setDepotId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const user: User = JSON.parse(userCookie);
        if (user.depot_id) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDepotId(user.depot_id);
          fetchTables(user.depot_id);
        }
      } catch (error) {
        console.error("Gagal membaca cookie user", error);
      }
    }
  }, [fetchTables]);

  const handleSubmit = async (tableNumber: string) => {
    if (!depotId) return false;
    if (selectedTable) {
      return await updateTable(selectedTable.id, depotId, {
        table_number: tableNumber,
      });
    } else {
      return await createTable(depotId, tableNumber);
    }
  };

  const handleConfirmDelete = async () => {
    if (!tableToDelete || !depotId) return;
    await deleteTable(tableToDelete.id, depotId);
    setTableToDelete(null);
  };

  if (!depotId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Akses Ditolak</h2>
        <p>Akun kasir ini tidak terikat pada cabang (Depot) manapun.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Meja</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola daftar master data meja untuk cabang ini.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTable(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Meja
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse">
            Memuat data meja...
          </div>
        ) : tables.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <LayoutGrid size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Belum Ada Meja</h3>
            <p className="text-gray-500 max-w-sm mt-2 mb-6">
              Tambahkan data meja terlebih dahulu untuk digunakan di sistem POS.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-sm text-gray-500">
                  <th className="py-4 px-6 font-medium w-16 text-center">No</th>
                  <th className="py-4 px-6 font-medium">Nama / Nomor Meja</th>
                  <th className="py-4 px-6 font-medium">Status Saat Ini</th>
                  <th className="py-4 px-6 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tables.map((table, index) => (
                  <tr
                    key={table.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-6 text-center text-gray-500">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {table.table_number}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          table.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {table.status === "Available" ? "Kosong" : table.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedTable(table);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Meja"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setTableToDelete(table)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Meja"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TableFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTable(null);
        }}
        initialData={selectedTable}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={tableToDelete !== null}
        onClose={() => setTableToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Meja?"
        message={`Apakah Anda yakin ingin menghapus meja "${tableToDelete?.table_number}"?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}
