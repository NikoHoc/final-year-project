"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Search, CheckCircle2, XCircle, Info } from "lucide-react";
import toast from "react-hot-toast";

import { useDepots } from "@/hooks/useDepot";
import { DepotMenuResponse, Category } from "@/types";
import { formatRupiah } from "@/utils/format";
import { useSession } from "@/contexts/SessionContext";

export default function KasirMenusPage() {
  const { user, isLoadingSession } = useSession();
  const { getDepotMenus, updateMenuStatus } = useDepots();

  const [localMenus, setLocalMenus] = useState<DepotMenuResponse[]>([]);
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!user?.depot_id) return;
      try {
        const data: DepotMenuResponse[] = await getDepotMenus(user.depot_id);
        if (!data || data.length === 0) return;

        setLocalMenus(data);

        const uniqueCats: Category[] = [];
        const seenIds = new Set();

        data.forEach((menu) => {
          if (menu.categories && !seenIds.has(menu.categories.id)) {
            seenIds.add(menu.categories.id);
            uniqueCats.push(menu.categories);
          }
        });

        setLocalCategories(uniqueCats);
        setActiveCategoryId((prev) =>
          prev === null && uniqueCats.length > 0 ? uniqueCats[0].id : prev,
        );
      } catch (error) {
        console.error("Error Client Side - gagal fetching depot menus:", error);
      }
      
    };
    if (!isLoadingSession && user?.depot_id) {
      loadData();
    }
  }, [isLoadingSession, user?.depot_id, getDepotMenus]);

  const handleToggleStatus = async (menuId: number, currentStatus: boolean) => {
    if (!user?.depot_id) return;
    const newStatus = !currentStatus;

    setLocalMenus((prev) =>
      prev.map((m) =>
        m.id === menuId ? { ...m, is_available: newStatus } : m,
      ),
    );

    try {
      await updateMenuStatus(user.depot_id, menuId, newStatus);
      toast.success(newStatus ? "Menu diaktifkan" : "Menu ditandai habis");
    } catch (error) {
      setLocalMenus((prev) =>
        prev.map((m) =>
          m.id === menuId ? { ...m, is_available: currentStatus } : m,
        ),
      );
      console.error("Error Client Side - gagal mengubah status menu:", error);
    }
  };

  const filteredMenus = useMemo(() => {
    const targetCategoryId =
      activeCategoryId !== null
        ? activeCategoryId
        : localCategories.length > 0
          ? localCategories[0].id
          : null;

    return localMenus.filter((menu) => {
      if (searchQuery) {
        return menu.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (targetCategoryId === null) return false;
      return Number(menu.categories?.id) === Number(targetCategoryId);
    });
  }, [localMenus, activeCategoryId, searchQuery, localCategories]);

  if (isLoadingSession) {
    return <div className="p-8 text-center animate-pulse text-gray-400">Memuat Sesi Kasir...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            Manajemen Stok Menu
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Atur ketersediaan menu di depot Anda hari ini
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {!searchQuery && localCategories.length > 0 && (
        <div className="flex overflow-x-auto hide-scrollbar gap-2 shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          {localCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`cursor-pointer whitespace-nowrap px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategoryId === category.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className={`bg-white rounded-2xl border-2 transition-all p-4 flex flex-col gap-4 ${
                menu.is_available
                  ? "border-transparent shadow-sm"
                  : "border-red-100 bg-red-50/30 opacity-80"
              }`}
            >
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {menu.image_url ? (
                    <Image
                      src={menu.image_url}
                      alt={menu.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <Info size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">
                    {menu.name}
                  </h3>
                  <p className="text-blue-600 font-bold text-sm">
                    {formatRupiah(menu.price)}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-md font-medium capitalize">
                    {menu.categories?.name}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500 line-clamp-2 italic h-8">
                {menu.description || "Tidak ada deskripsi menu."}
              </div>

              <button
                onClick={() => handleToggleStatus(menu.id, menu.is_available)}
                className={`cursor-pointer w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  menu.is_available
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100"
                }`}
              >
                {menu.is_available ? (
                  <>
                    <CheckCircle2 size={16} /> Tersedia
                  </>
                ) : (
                  <>
                    <XCircle size={16} /> Habis / Kosong
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {filteredMenus.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <Info size={40} className="mb-2 opacity-20" />
            <p>Tidak ada menu yang ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
