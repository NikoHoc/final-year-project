"use client";

import { useState } from "react";
import { User } from "@/types";
import { Pencil, Trash2, ArrowUpDown, Shield, Store, MonitorSmartphone } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

interface UserTableProps {
  data: User[];
  isLoading: boolean;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

export default function UserTable({ data, isLoading, onEditClick, onDeleteClick }: UserTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columnHelper = createColumnHelper<User>();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200"><Shield size={12}/> Admin</span>;
      case "kasir": return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"><MonitorSmartphone size={12}/> Kasir</span>;
      case "pelayan": return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200"><Store size={12}/> Pelayan</span>;
      case "pelanggan": return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium border border-pink-200">Pelanggan</span>;
      default: return <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-medium border border-gray-200">{role}</span>;
    }
  };

  const columns = [
    columnHelper.display({
      id: "no",
      header: "No",
      cell: (info) => <span className="text-gray-500">{info.row.index + 1}</span>,
    }),
    columnHelper.accessor("full_name", {
      header: ({ column }) => (
        <button 
          className="flex items-center gap-2 hover:text-blue-600 transition-colors font-semibold outline-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Informasi User <ArrowUpDown size={14} />
        </button>
      ),
      cell: (info) => {
        const user = info.row.original;
        return (
          <div>
            <div className="font-semibold text-gray-800">{user.full_name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{user.username} • {user.phone_number}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: () => <span className="font-semibold">Peran (Role)</span>,
      cell: (info) => getRoleBadge(info.getValue()),
    }),
    columnHelper.accessor("depot_id", {
      header: () => <span className="font-semibold">Penempatan Cabang</span>,
      cell: (info) => {
        const user = info.row.original;
        if (user.role === "admin") return <span className="text-gray-500 font-medium italic">Global (Pusat)</span>;
        if (user.role === "pelanggan") return <span className="text-gray-400 italic">-</span>;
        return <span className="font-medium text-gray-800">{user.depots?.name || "-"}</span>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-center font-semibold">Aksi</div>,
      cell: (info) => {
        const user = info.row.original;

        if (user.role === "admin") {
          return (
            <div className="text-center">
              <span className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded border border-gray-100">
                Aksi Terkunci
              </span>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center gap-2">
            <button 
              title="Edit Data" 
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              onClick={() => onEditClick(user)}
            >
              <Pencil size={18} />
            </button>
            <button 
              title="Hapus Data" 
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              onClick={() => onDeleteClick(user)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">Memuat data users...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">Belum ada data user ditemukan.</td></tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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