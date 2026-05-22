"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Store, ShieldCheck, Layers, Pencil, CheckCircle2, AlertCircle, X, Save, Loader2, Search } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useDepots } from "@/hooks/useDepot";
import { useMenus } from "@/hooks/useMenus";
import { useCategories } from "@/hooks/useCategories";
import { Depot } from "@/types";

import DepotFormModal from "@/components/depots/DepotFormModal";
import PaymentConfigModal from "@/components/depots/PaymentConfigModal";

export default function OwnerSettingsPage() {
  const { user, isLoadingSession } = useSession();
  
  const { fetchDepotById, updateDepot, setupPaymentConfig, getDepotMenus, assignDepotMenus } = useDepots();
  const { menus, fetchMenus } = useMenus();
  const { categories, fetchCategories } = useCategories();

  const [depotData, setDepotData] = useState<Depot | null>(null);
  const [initialMenuIds, setInitialMenuIds] = useState<number[]>([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDepotModalOpen, setIsDepotModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditMenuMode, setIsEditMenuMode] = useState(false);
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, [fetchMenus, fetchCategories]);

  const loadDepotData = useCallback(async () => {
    if (!user?.depot_id) return;
    setIsLoading(true);
    try {
      const [depotRes, depotMenusRes] = await Promise.all([
        fetchDepotById(user.depot_id),
        getDepotMenus(user.depot_id)
      ]);
      
      setDepotData(depotRes);
      
      const ids = depotMenusRes.map((m: { id: number }) => m.id);
      setInitialMenuIds(ids);
      setSelectedMenuIds(ids);

    } catch (error) {
      console.error("Gagal memuat pengaturan cabang:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.depot_id, fetchDepotById, getDepotMenus]);

  useEffect(() => {
    if (!isLoadingSession && user?.depot_id) {
      loadDepotData();
    }
  }, [isLoadingSession, user?.depot_id, loadDepotData]);

  const groupedMenus = useMemo(() => {
    if (!categories || !menus) return [];

    const lowerQuery = searchQuery.toLowerCase();
    const filteredMenus = menus.filter(m => m.name.toLowerCase().includes(lowerQuery));

    return categories
      .map((category) => ({
        ...category,
        menus: filteredMenus.filter((menu) => menu.category_id === category.id),
      }))
      .filter((category) => category.menus.length > 0);
  }, [categories, menus, searchQuery]);

  const toggleMenu = (menuId: number) => {
    if (!isEditMenuMode) return;
    setSelectedMenuIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const handleSaveMenus = async () => {
    if (!user?.depot_id) return;
    setIsSavingMenu(true);
    try {
      await assignDepotMenus(user.depot_id, selectedMenuIds);
      setInitialMenuIds(selectedMenuIds);
      setIsEditMenuMode(false);
    } catch (error) {
      console.error("Gagal menyimpan menu", error);
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleCancelEditMenu = () => {
    setSelectedMenuIds(initialMenuIds);
    setIsEditMenuMode(false);
  };

  const hasMenuChanges = JSON.stringify([...initialMenuIds].sort()) !== JSON.stringify([...selectedMenuIds].sort());
  const hasPaymentConfig = !!depotData?.payment_configs;

  if (isLoadingSession || isLoading) {
    return (
      <div className="h-100 flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium text-gray-500">Memuat panel kendali cabang...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Pengaturan Cabang</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Pusat kendali informasi operasional, gerbang pembayaran, dan ketersediaan menu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <Store size={20} className="text-blue-500" /> Profil Depot
              </h2>
              <button 
                onClick={() => setIsDepotModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              >
                <Pencil size={14} /> Edit Data
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Cabang</p>
                  <p className="text-base font-black text-gray-800">{depotData?.name}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status Sistem</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${depotData?.is_open ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {depotData?.is_open ? "Buka" : "Tutup"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">No. HP / Telepon</p>
                  <p className="text-sm font-bold text-gray-700">{depotData?.phone_number || "-"}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Jam Operasional</p>
                  <p className="text-sm font-medium text-gray-600 mt-1">
                    {depotData?.shift1_start?.slice(0,5)} - {depotData?.shift1_end?.slice(0,5)}
                  </p>
                  {(depotData?.shift2_start && depotData?.shift2_end) ? (
                    <p className="text-sm font-medium text-gray-600">
                    {depotData?.shift2_start?.slice(0,5)} - {depotData?.shift2_end?.slice(0,5)}
                  </p>
                  ) : '-'}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Lengkap</p>
                <p className="text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{depotData?.address}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Koordinat GPS (Latitude & Longitude)</p>
                  <p className="text-sm font-mono font-medium text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {depotData?.latitude && depotData?.longitude 
                      ? `${depotData.latitude}, ${depotData.longitude}` 
                      : "Belum dikonfigurasi"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tautan Google Maps</p>
                  {depotData?.map_url ? (
                    <a
                      href={depotData.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center gap-2 transition-colors h-11.5"
                    >
                      🗺️ Lihat Lokasi di Google Maps &rarr;
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-amber-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100 h-11.5 flex items-center">
                      Tautan belum disematkan
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                * Data koordinat spasial dan tautan di atas digunakan oleh sistem aplikasi mobile pelanggan untuk mengukur radius jarak pengantaran/pickup secara presisi serta menampilkan navigasi rute ke lokasi depot.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-500" /> Midtrans Gateway
              </h2>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              {hasPaymentConfig ? (
                <>
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 flex items-center justify-center rounded-full mb-3">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-sm font-black text-gray-800 mb-1">Kredensial Terkonfigurasi</h3>
                  <p className="text-xs text-gray-500 font-medium px-4 mb-4">
                    Gerbang pembayaran online (QRIS/Transfer) untuk cabang ini sudah aktif dan dienkripsi dengan aman.
                  </p>
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 shadow-sm"
                  >
                    <Pencil size={14} /> Ubah Kredensial
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-50 text-red-500 flex items-center justify-center rounded-full mb-3">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-sm font-black text-gray-800 mb-1">Belum Terkonfigurasi</h3>
                  <p className="text-xs text-gray-500 font-medium px-4 mb-4">
                    Pelanggan tidak bisa melakukan pembayaran online sampai kredensial Midtrans diatur.
                  </p>
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                  >
                    Setup Midtrans
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-4">
          <div>
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <Layers size={20} className="text-orange-500" /> Alokasi Menu Cabang
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Pilih menu dari pusat yang tersedia dan dijual di cabang Anda.
            </p>
          </div>
          {groupedMenus.length > 0 && (
            <div className="flex items-center gap-2">
              {!isEditMenuMode ? (
                <button
                  onClick={() => setIsEditMenuMode(true)}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-sm"
                >
                  <Pencil size={16} /> Edit Daftar Menu
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEditMenu}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all"
                  >
                    <X size={16} /> Batal
                  </button>
                  <button
                    onClick={handleSaveMenus}
                    disabled={!hasMenuChanges || isSavingMenu}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isSavingMenu ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Simpan Perubahan
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {categories.length > 0 && menus.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari menu berdasarkan nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        )}

        <div className={`transition-opacity ${!isEditMenuMode && groupedMenus.length > 0 ? 'opacity-70 grayscale-20' : 'opacity-100'}`}>
          {categories.length === 0 || menus.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <Layers size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-base font-bold text-gray-500">Belum ada data master menu dan kategori.</p>
              <p className="text-xs text-gray-400 mt-1">Silakan hubungi Admin Pusat untuk menambahkan menu ke dalam sistem.</p>
            </div>
          ) : groupedMenus.length === 0 && searchQuery !== "" ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-base font-bold text-gray-500">Menu tidak ditemukan</p>
              <p className="text-xs text-gray-400 mt-1">Pencarian untuk &quot;{searchQuery}&quot; tidak membuahkan hasil.</p>
            </div>
          ) : (
            <div className="max-h-112.5 overflow-y-auto pr-2 space-y-6">
              {groupedMenus.map((category) => (
                <div key={category.id} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-black text-gray-800 mb-3 uppercase tracking-wider">{category.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {category.menus.map((menu) => {
                      const isSelected = selectedMenuIds.includes(menu.id);
                      return (
                        <div 
                          key={menu.id} 
                          onClick={() => toggleMenu(menu.id)}
                          className={`relative flex items-center p-3 rounded-xl border transition-all ${
                            isEditMenuMode ? 'cursor-pointer' : 'cursor-default'
                          } ${
                            isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            readOnly
                            checked={isSelected}
                            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                              {menu.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DepotFormModal
        isOpen={isDepotModalOpen}
        onClose={() => setIsDepotModalOpen(false)}
        initialData={depotData}
        onSubmit={async (data) => {
          if (!user?.depot_id) return false;
          try {
            await updateDepot(user.depot_id, data);
            loadDepotData();
            return true;
          } catch {
            return false;
          }
        }}
      />

      <PaymentConfigModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        depot={depotData}
        onSubmit={async (data) => {
          if (!user?.depot_id) return false;
          try {
            await setupPaymentConfig(user.depot_id, data);
            loadDepotData();
            return true;
          } catch {
            return false;
          }
        }}
      />
    </div>
  );
}