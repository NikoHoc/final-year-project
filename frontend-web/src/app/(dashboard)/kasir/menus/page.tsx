"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { AlertCircle, Image as ImageIcon, Power, SearchX } from "lucide-react";

import { useCategories } from "@/hooks/useCategories";
import { useMenus } from "@/hooks/useMenus";
import { User, Menu } from "@/types";
import { formatRupiah } from "@/utils/format";

export default function KasirMenuAvailabilityPage() {
  const { categories, isLoading: isCategoryLoading, fetchCategories } = useCategories();
  const { menus, isLoading: isMenuLoading, fetchMenus, updateMenu } = useMenus();

  const [depotId, setDepotId] = useState<number | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const user: User = JSON.parse(userCookie);
        if (user.depot_id) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDepotId(user.depot_id);
          fetchCategories(user.depot_id);
        }
      } catch (error) {
        console.error("Gagal membaca cookie user", error);
      }
    }
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0 && activeCategoryId === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  useEffect(() => {
    if (depotId && activeCategoryId) {
      fetchMenus(depotId, activeCategoryId);
    }
  }, [depotId, activeCategoryId, fetchMenus]);

  const handleToggleAvailable = async (menu: Menu) => {
    if (!depotId || !activeCategoryId) return;

    setTogglingId(menu.id);

    const formData = new FormData();
    formData.append("name", menu.name);
    formData.append("price", menu.price.toString());
    if (menu.half_price)
      formData.append("half_price", menu.half_price.toString());
    formData.append("category_id", menu.category_id.toString());
    if (menu.description) formData.append("description", menu.description);

    formData.append("is_available", String(!menu.is_available));

    await updateMenu(menu.id, depotId, activeCategoryId, formData);

    setTogglingId(null);
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
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">Ketersediaan Menu</h1>
        <p className="text-gray-500 text-sm mt-1">
          Matikan menu yang bahan bakunya sedang habis agar tidak bisa dipesan.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 shrink-0">
        {isCategoryLoading ? (
          <div className="h-12 flex items-center px-4 text-gray-400 animate-pulse text-sm">
            Memuat kategori...
          </div>
        ) : categories.length === 0 ? (
          <div className="h-12 flex items-center px-4 text-gray-400 text-sm italic">
            Belum ada kategori di cabang ini.
          </div>
        ) : (
          <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategoryId === category.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {isMenuLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 animate-pulse">
            Memuat daftar menu...
          </div>
        ) : menus.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <SearchX size={48} className="mb-4 text-gray-300" />
            <p>Tidak ada menu di kategori ini.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className={`flex flex-col border rounded-2xl overflow-hidden transition-colors ${
                    menu.is_available
                      ? "border-gray-200 bg-white"
                      : "border-red-200 bg-red-50/30 opacity-75"
                  }`}
                >
                  <div className="flex items-center p-3 gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative shrink-0 border border-gray-200">
                      {menu.image_url ? (
                        <Image
                          src={menu.image_url}
                          alt={menu.name}
                          fill
                          unoptimized
                          className={`object-cover ${!menu.is_available && "grayscale"}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-bold truncate text-sm ${menu.is_available ? "text-gray-800" : "text-gray-500 line-through"}`}
                      >
                        {menu.name}
                      </h3>
                      <p className="text-blue-600 font-semibold text-sm">
                        {formatRupiah(menu.price)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 pt-0 mt-auto">
                    <button
                      onClick={() => handleToggleAvailable(menu)}
                      disabled={togglingId === menu.id}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        togglingId === menu.id
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : menu.is_available
                            ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 shadow-inner"
                      }`}
                    >
                      <Power size={16} />
                      {togglingId === menu.id
                        ? "Memproses..."
                        : menu.is_available
                          ? "TERSEDIA"
                          : "HABIS (NONAKTIF)"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
