"use client";

import { LayoutGrid, Soup } from "lucide-react";
import { Table, Transaction } from "@/types";

interface TableListProps {
  tables: Table[];
  activeTransactions: Transaction[];
  isDepotOpen: boolean;
  role: "owner" | "kasir" | "pelayan";
  onTableClick: (tableId: number) => void;
  onManageTables?: () => void;
}

export default function TableList({
  tables,
  activeTransactions,
  isDepotOpen,
  role,
  onTableClick,
  onManageTables,
}: TableListProps) {
  const activeTables = tables.filter((table) => {
    const hasActiveTx = activeTransactions.some((t) => t.table_id === table.id);
    return table.is_active || hasActiveTx;
  });
  
  const isOwnerOrCashier = role === "owner" || role === "kasir";

  if (tables.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <LayoutGrid size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Belum Ada data meja</h3>
        <p className="text-gray-500 max-w-sm mt-2 mb-6">
          {isOwnerOrCashier
            ? "Tambahkan data meja terlebih dahulu untuk mulai menerima pesanan pelanggan secara Dine-in." 
            : "Menunggu kasir atau admin menambahkan data meja cabang ini."}
        </p>
        {isOwnerOrCashier && onManageTables && (
          <button
            onClick={onManageTables}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Kelola Meja Sekarang
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {activeTables.map((table) => {
        const activeTx = activeTransactions.find((t) => t.table_id === table.id);
        const totalItems = activeTx?.transaction_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        const isOccupied = !!activeTx;

        return (
          <button
            key={table.id}
            onClick={() => onTableClick(table.id)}
            disabled={!isDepotOpen}
            className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group ${
              isOccupied
                ? "bg-yellow-50 border-yellow-400 shadow-md shadow-yellow-100/50 hover:bg-yellow-100"
                : "bg-white border-gray-100 hover:border-blue-400 hover:shadow-md"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
                isOccupied
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
              }`}
            >
              <Soup size={32} />
            </div>
            <span className="text-lg font-bold text-gray-800">
              {table.table_number}
            </span>

            <span
              className={`text-xs mt-1 font-semibold ${
                isOccupied ? "text-yellow-700" : "text-gray-400"
              }`}
            >
              {isOccupied ? `Terisi, ${totalItems} porsi` : "Kosong"}
            </span>

            <div
              className={`absolute top-0 inset-x-0 h-1.5 rounded-t-xl ${
                isOccupied ? "bg-yellow-400" : "bg-green-400"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}