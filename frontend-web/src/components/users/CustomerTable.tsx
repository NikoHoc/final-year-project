"use client";

import { useState } from "react";
import { User } from "@/types";
import { Search, Pencil, Trash2, ArrowUpDown, User as UserIcon, Calendar, ReceiptText } from "lucide-react";
import { formatDateTime } from "@/utils/format";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";

interface CustomerTableProps {
  data: User[];
  isLoading: boolean;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

export default function CustomerTable({ data, isLoading, onEditClick, onDeleteClick }: CustomerTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const columnHelper = createColumnHelper<User>();

  const columns = [
    columnHelper.display({
      id: "no",
      header: "No",
      cell: (info) => (
        <span className="font-medium text-gray-500">{info.row.index + 1}</span>
      ),
    }),

    columnHelper.accessor("email", {
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-2 hover:text-gray-700 whitespace-nowrap">
          Email <ArrowUpDown size={14} />
        </button>
      ),
      cell: (info) => (
        <span className="text-gray-600">{info.getValue() || "-"}</span>
      ),
    }),

    columnHelper.accessor("phone_number", {
      header: "No. Telepon",
      cell: (info) => (
        <span className="text-gray-600 font-medium whitespace-nowrap">{info.getValue() || "-"}</span>
      ),
    }),

    columnHelper.accessor("full_name", {
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-2 hover:text-gray-700">
          Pelanggan <ArrowUpDown size={14} />
        </button>
      ),
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 whitespace-nowrap">{info.getValue() || "Tanpa Nama"}</span>
          <span className="text-xs text-gray-500 font-medium mt-0.5">
            @{info.row.original.username || "username"}
          </span>
        </div>
      ),
    }),

    columnHelper.display({
      id: "total_transactions",
      header: "Jumlah Transaksi",
      cell: () => (
        <div className="flex items-center gap-1.5 font-bold text-blue-600 bg-blue-50/50 px-2.5 py-1 rounded-md w-fit border border-blue-100 text-xs">
          <ReceiptText size={12} />
          <span>0</span>
        </div>
      ),
    }),

    columnHelper.accessor("created_at", {
      header: "Tanggal Bergabung",
      cell: (info) => {
        const dateStr = info.getValue();
        return (
          <div className="flex items-center gap-2 text-gray-600 font-medium whitespace-nowrap">
            <Calendar size={14} className="text-gray-400" />
            <span>{dateStr ? formatDateTime(dateStr) : "-"}</span>
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "actions",
      header: "Aksi",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditClick(info.row.original)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Pelanggan"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDeleteClick(info.row.original)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus Pelanggan"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Daftar Pelanggan</h2>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cari data..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow shadow-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-225">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-bold">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4 whitespace-nowrap">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Memuat data pelanggan...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <UserIcon size={48} className="mb-4 text-gray-200" />
                    <p className="text-base font-semibold text-gray-600">Belum ada data pelanggan</p>
                    <p className="text-sm mt-1">Data pelanggan yang terdaftar akan muncul di sini.</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}