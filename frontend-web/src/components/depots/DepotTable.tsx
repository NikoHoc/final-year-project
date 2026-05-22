"use client";

import { useState } from "react";
import { Depot } from "@/types";
import { Search, Pencil, Trash2, CreditCard, AlertCircle, CheckCircle2, ArrowUpDown, Power, List, Crown } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";

interface DepotTableProps {
  data: Depot[];
  isLoading: boolean;
  onOperasionalClick: (depot: Depot) => void;
  onDeleteClick: (depot: Depot) => void;
  onEditClick: (depot: Depot) => void;
  onSetupPaymentClick: (depot: Depot) => void;
  onAssignMenu: (depot: Depot) => void;
}

export default function DepotTable({ data, isLoading, onOperasionalClick, onDeleteClick, onEditClick, onSetupPaymentClick, onAssignMenu }: DepotTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columnHelper = createColumnHelper<Depot>();

  const columns = [
    columnHelper.display({
      id: "no",
      header: "No",
      cell: (info) => <span className="text-gray-500">{info.row.index + 1}</span>,
    }),
    columnHelper.display({
      id: "info",
      header: "Cabang & Status",
      cell: (info) => (
        <div>
          <p className="font-bold text-gray-800">{info.row.original.name}</p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${info.row.original.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {info.row.original.is_open ? 'BUKA' : 'TUTUP'}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("owner_name", {
      header: "Owner Cabang",
      cell: (info) => {
        const ownerName = info.getValue(); 

        return ownerName ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-yellow-50/50 border border-yellow-200/60 px-2.5 py-1.5 rounded-xl w-fit">
            <Crown size={14} className="text-yellow-500 fill-yellow-500/20" />
            {ownerName}
          </span>
        ) : (
          <span className="inline-block text-[11px] font-semibold text-gray-400 italic bg-gray-50/80 px-2.5 py-1.5 rounded-xl border border-dashed border-gray-200">
            Belum Ada Owner
          </span>
        );
      },
    }),
    columnHelper.accessor("address", {
      header: () => <span className="font-semibold">Alamat</span>,
      cell: (info) => <span className="text-gray-600">{info.getValue() || "-"}</span>,
    }),
    columnHelper.accessor("phone_number", {
      header: () => <span className="font-semibold">Nomor WA</span>,
      cell: (info) => <span className="line-clamp-1 text-gray-600">{info.getValue() || "-"}</span>,
    }),
    columnHelper.accessor((row) => `${row.shift1_start?.slice(0, 5)}-${row.shift1_end?.slice(0, 5)}`, {
      header: "Jam Operasional",
      cell: (info) => (
        <div className="text-xs text-center">
          <p>{info.row.original.shift1_start?.slice(0,5)} - {info.row.original.shift1_end?.slice(0,5)}</p>
          <p>{info.row.original.shift2_start?.slice(0,5)} - {info.row.original.shift2_end?.slice(0,5)}</p>
        </div>
      ),
    }),
    columnHelper.accessor("payment_configs", {
      header: () => <div className="text-center font-semibold">Status Midtrans</div>,
      cell: (info) => {
        const isRegistered = info.getValue(); 
        return (
          <div className="flex justify-center">
            {isRegistered ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-200">
                <CheckCircle2 size={14} /> Terdaftar
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-200">
                <AlertCircle size={14} /> Belum Daftar
              </span>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-center font-semibold">Aksi</div>,
      cell: (info) => {
        const depot = info.row.original;
        const isRegistered = depot.payment_configs;
        const isOpen = depot.is_open;

        return (
          <div className="flex items-center justify-center gap-2">
            <button 
              title={isOpen ? "Tutup Depot" : "Buka Depot"} 
              className={`p-2 rounded-lg transition-colors border border-transparent ${
                isOpen ? "text-gray-400 hover:bg-gray-100" : "text-blue-600 hover:bg-blue-100"
              }`}
              onClick={() => onOperasionalClick(depot)} 
            >
              <Power size={18} />
            </button>
            <button 
              title={isRegistered ? "Edit Kredensial Midtrans" : "Daftar Kredensial Midtrans"} 
              className={`p-2 rounded-lg transition-colors border border-transparent ${
                isRegistered 
                  ? "text-emerald-600 hover:bg-emerald-100 hover:border-emerald-200"
                  : "text-amber-600 hover:bg-amber-100 hover:border-amber-200"
              }`}
              onClick={() => onSetupPaymentClick(depot)}
            >
              <CreditCard size={18} />
            </button>
            <button
              onClick={() => onAssignMenu(depot)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Atur Menu Depot"
            >
              <List className="h-4 w-4" />
            </button>
            <button 
              title="Edit Depot" 
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              onClick={() => onEditClick(depot)}
            >
              <Pencil size={18} />
            </button>
            <button 
              title="Hapus Depot" 
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              onClick={() => onDeleteClick(depot)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      },
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Daftar Depot</h2>
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
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4">
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
                  <div className="flex justify-center mb-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                  Belum ada data depot cabang.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
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