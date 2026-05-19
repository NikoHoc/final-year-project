"use client";

import { useRef } from "react";
import { X, Calendar, User, Printer  } from "lucide-react";
import { formatRupiah, formatDateTime } from "@/utils/format";
import { DailySettlement, SettlementSummary, Expense, Depot } from "@/types";
import { printSettlementHTML } from "@/utils/printHandler";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settlement: DailySettlement | null;
  summary: SettlementSummary | null;
  expenses: Expense[];
  depot: Depot | null;
  role?: "kasir" | "owner" | "admin";
}

export default function ReportSettlementPrintModal({ isOpen, onClose, settlement, summary, expenses, depot, role = "owner" }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
      if (printContent) {
        printSettlementHTML(printContent, `CLOSING_REPORT_${settlement?.id || "SUMMARY"}`);
      }
  };

  const isOwnerOrAdmin = role === "owner" || role === "admin";
  if (!isOpen || !settlement || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-4xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0 z-20">
          <div>
            <h2 className="text-lg font-black text-gray-800">Cetak Laporan Settlement</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {settlement.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-2xl transition-all text-sm font-bold shadow-sm"
            >
              <Printer size={18} /> Cetak Laporan
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50">

          <div className="w-full lg:w-[55%] flex flex-col bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Informasi Penutupan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3 border border-gray-100">
                <Calendar className="text-blue-500" size={20} />
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Tanggal Buku</div>
                  <div className="text-sm font-black text-gray-800">{formatDateTime(settlement.settlement_date)}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3 border border-gray-100">
                <User className="text-purple-500" size={20} />
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Dibuat Oleh</div>
                  <div className="text-sm font-black text-gray-800 uppercase">{settlement.creator?.full_name || "Kasir"}</div>
                </div>
              </div>
            </div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pt-4">Rincian Saldo Masuk</h3>
            <div className="space-y-2">
              {summary.payment_methods?.map((pm, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold text-gray-700 uppercase">{pm.method_name} ({pm.transaction_count} Trx)</span>
                  </div>
                  <span className="text-sm font-black text-gray-800">{formatRupiah(pm.total_net_amount)}</span>
                </div>
              ))}
            </div>
            {isOwnerOrAdmin && (
              <>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pt-4">Rincian Pengeluaran ({expenses.length})</h3>
                <div className="space-y-2">
                  {expenses.length > 0 ? (
                    expenses.map((exp) => (
                      <div key={exp.id} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex justify-between items-center">
                        <div>
                          <div className="text-xs font-bold text-gray-800 uppercase">{exp.item_name}</div>
                          {exp.note && <div className="text-[10px] text-gray-400 mt-0.5 normal-case"># {exp.note}</div>}
                        </div>
                        <span className="text-sm font-black text-red-500">{formatRupiah(exp.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center text-xs font-bold text-gray-400 uppercase">
                      Tidak ada pengeluaran operasional
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="w-full lg:w-[45%] bg-gray-100 p-6 flex flex-col items-center overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 shrink-0">Preview Nota Closing</h3>
            <div ref={printRef} className="w-full max-w-[320px] bg-white shadow-xl p-6 rounded-sm mb-6 flex flex-col text-gray-900 text-xs shrink-0 select-none">
              <div className="text-center space-y-1">
                <h4 className="font-black text-sm uppercase tracking-wide">{depot?.name || "DEPOT KITA"}</h4>
                <p className="text-[10px] text-gray-600 uppercase font-medium">{depot?.address || "Alamat tidak tersedia"}</p>
                <p className="text-[10px] text-gray-600 font-medium">TELP: {depot?.phone_number || "-"}</p>
              </div>

              <div className="border-b border-dashed border-gray-400 my-4"></div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between"><span>LAPORAN:</span><span className="font-bold uppercase">CLOSING REPORT</span></div>
                <div className="flex justify-between"><span>ID SETTLE:</span><span className="font-bold uppercase">SET-{settlement.id.slice(-6).toUpperCase()}</span></div>
                <div className="flex justify-between"><span>TANGGAL:</span><span className="font-bold">{formatDateTime(settlement.settlement_date)}</span></div>
                <div className="flex justify-between"><span>DIBUAT OLEH:</span><span className="font-bold uppercase">{settlement.creator?.full_name || "SYSTEM"}</span></div>
              </div>

              <div className="border-b border-dashed border-gray-400 my-4"></div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between"><span>TOTAL TRANSAKSI</span><span className="font-bold">{summary.total_transactions} TRX</span></div>
                <div className="flex justify-between"><span>SUBTOTAL AMOUNT</span><span className="font-bold">{formatRupiah(summary.subtotal_amount)}</span></div>
                <div className="flex justify-between"><span>TAX AMOUNT</span><span className="font-bold">{formatRupiah(summary.tax_amount)}</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-1 font-black">
                  <span>GRAND TOTAL</span>
                  <span>{formatRupiah(summary.grand_total)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-gray-400 my-4"></div>

              <div className="space-y-1.5 text-[11px]">
                <p className="font-black uppercase text-[10px] tracking-wider mb-1 text-gray-500">*** BREAKDOWN PEMASUKAN ***</p>
                {summary.payment_methods?.map((pm, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="uppercase">{pm.method_name} ({pm.transaction_count}x)</span>
                    <span className="font-bold">{formatRupiah(pm.total_net_amount)}</span>
                  </div>
                ))}
              </div>

              {isOwnerOrAdmin && (
                <>
                <div className="border-b border-dashed border-gray-400 my-4"></div>

                <div className="space-y-1.5 text-[11px]">
                  <p className="font-black uppercase text-[10px] tracking-wider mb-1 text-gray-500">*** RINCIAN PENGELUARAN ***</p>
                  {expenses.length > 0 ? (
                    expenses.map((exp, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <span className="uppercase flex-1 pr-2 truncate">{exp.item_name}</span>
                        <span className="font-bold text-red-600 shrink-0">({formatRupiah(exp.amount)})</span>
                      </div>
                    ))
                  ) : (
                    <p className="italic text-gray-400 text-[10px] text-center">TIDAK ADA PENGELUARAN</p>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-1 font-black text-red-600 mt-1">
                    <span>TOTAL EXPENSES</span>
                    <span>({formatRupiah(summary.total_expenses)})</span>
                  </div>
                </div>
                <div className="border-b border-dashed border-gray-400 my-4"></div>

                <div className="text-center py-2 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">ESTIMASI BERSIH</p>
                  <p className="text-sm font-black text-purple-600 mt-0.5">{formatRupiah(summary.net_income)}</p>
                </div>
                </>
              )}
              <div className="text-center mt-8 pt-4 border-t border-dashed border-gray-300 text-[9px] text-gray-400 uppercase font-bold tracking-widest">
                *** END OF CLOSING REPORT ***
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}