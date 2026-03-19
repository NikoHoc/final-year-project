"use client";

import { useState, useEffect } from "react";
import { Store, Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { useDepots } from "@/hooks/useDepot";
import { useCategories } from "@/hooks/useCategories";
import { useMenus } from "@/hooks/useMenus";
import { Category, Menu } from "@/types";
import CategoryFormModal from "@/components/menus/CategoryFormModal";
import MenuFormModal from "@/components/menus/MenuFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import MenuCard from "@/components/menus/MenuCard";

export default function MenusPage() {
  const { depots, isLoading: isDepotLoading } = useDepots();
  const {
    categories,
    isLoading: isCategoryLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const {
    menus,
    isLoading: isMenuLoading,
    fetchMenus,
    createMenu,
    updateMenu,
    deleteMenu,
  } = useMenus();

  const [selectedDepotId, setSelectedDepotId] = useState<number | "">("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);

  // load depot
  useEffect(() => {
    if (depots.length > 0 && selectedDepotId === "") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDepotId(depots[0].id);
    }
  }, [depots, selectedDepotId]);

  // load category dari depot yang dipilih
  useEffect(() => {
    if (selectedDepotId !== "") {
      fetchCategories(Number(selectedDepotId));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveCategoryId(null);
    }
  }, [selectedDepotId, fetchCategories]);

  // load menu dari kategori yang dipilih
  useEffect(() => {
    if (selectedDepotId && activeCategoryId) {
      fetchMenus(Number(selectedDepotId), activeCategoryId);
    }
  }, [selectedDepotId, activeCategoryId, fetchMenus]);

  const handleCategorySubmit = async (name: string) => {
    if (!selectedDepotId) return false;

    if (selectedCategory) {
      return await updateCategory(
        selectedCategory.id,
        Number(selectedDepotId),
        name,
      );
    } else {
      return await createCategory(Number(selectedDepotId), name);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete || !selectedDepotId) return;
    await deleteCategory(categoryToDelete.id, Number(selectedDepotId));
    setCategoryToDelete(null);
    if (activeCategoryId === categoryToDelete.id) setActiveCategoryId(null);
  };

  const handleMenuSubmit = async (formData: FormData) => {
    if (!selectedDepotId || !activeCategoryId) return false;

    formData.append("depot_id", selectedDepotId.toString());
    formData.append("category_id", activeCategoryId.toString());

    if (selectedMenu) {
      return await updateMenu(
        selectedMenu.id,
        Number(selectedDepotId),
        activeCategoryId,
        formData,
      );
    } else {
      return await createMenu(
        Number(selectedDepotId),
        activeCategoryId,
        formData,
      );
    }
  };

  const handleConfirmDeleteMenu = async () => {
    if (!menuToDelete || !selectedDepotId || !activeCategoryId) return;
    await deleteMenu(
      menuToDelete.id,
      Number(selectedDepotId),
      activeCategoryId,
    );
    setMenuToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Menu & Kategori
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola daftar menu dan kategori khusus untuk masing-masing cabang.
          </p>
        </div>

        <div className="relative min-w-62.5">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Store size={18} />
          </div>
          <select
            value={selectedDepotId}
            onChange={(e) => setSelectedDepotId(Number(e.target.value))}
            disabled={isDepotLoading || depots.length === 0}
            className="w-full pl-10 pr-8 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer font-semibold text-blue-900 shadow-sm disabled:opacity-50"
          >
            {isDepotLoading ? (
              <option value="">Memuat cabang...</option>
            ) : depots.length === 0 ? (
              <option value="">Belum ada cabang</option>
            ) : (
              depots.map((depot) => (
                <option key={depot.id} value={depot.id}>
                  {depot.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedDepotId && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-fit">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-semibold text-gray-800">Kategori Menu</h2>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="p-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                title="Tambah Kategori"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="p-2">
              {isCategoryLoading ? (
                <div className="p-4 text-center text-sm text-gray-400 animate-pulse">
                  Memuat...
                </div>
              ) : categories.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400 italic">
                  Belum ada kategori.
                </div>
              ) : (
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      onClick={() => setActiveCategoryId(category.id)}
                      className={`flex items-center justify-between p-3 rounded-lg group transition-colors cursor-pointer border ${
                        activeCategoryId === category.id
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50 border-transparent"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${activeCategoryId === category.id ? "text-blue-700" : "text-gray-700"}`}
                      >
                        {category.name}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(category);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryToDelete(category);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-md"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-100">
            {!activeCategoryId ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <Store size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800">
                  Pilih Kategori
                </h3>
                <p className="text-gray-500 text-sm mt-1 max-w-sm">
                  Klik salah satu kategori di sebelah kiri untuk melihat dan
                  menambahkan menu makanan di dalamnya.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {categories.find((c) => c.id === activeCategoryId)?.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Kelola daftar makanan/minuman untuk kategori ini.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMenu(null);
                      setIsMenuModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus size={18} /> Tambah Menu
                  </button>
                </div>

                <div className="p-6 bg-gray-50/30 flex-1">
                  {isMenuLoading ? (
                    <div className="flex items-center justify-center h-32 text-gray-400 animate-pulse">
                      Memuat menu...
                    </div>
                  ) : menus.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                      <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-3">
                        <ImageIcon size={24} />
                      </div>
                      <p className="text-gray-500 font-medium">
                        Belum ada menu pada kategori
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Klik tombol Tambah Menu di atas.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {menus.map((menu) => (
                        <MenuCard
                          key={menu.id}
                          menu={menu}
                          actionButtons={
                            <>
                              <button
                                onClick={() => {
                                  setSelectedMenu(menu);
                                  setIsMenuModalOpen(true);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Pencil size={14} /> Edit
                              </button>
                              <button
                                onClick={() => setMenuToDelete(menu)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Trash2 size={14} /> Hapus
                              </button>
                            </>
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        initialData={selectedCategory}
        onSubmit={handleCategorySubmit}
      />
      <ConfirmModal
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDeleteCategory}
        title="Hapus Kategori?"
        message={`Semua menu di dalamnya akan kehilangan kategori ini. Lanjutkan?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />

      <MenuFormModal
        isOpen={isMenuModalOpen}
        onClose={() => {
          setIsMenuModalOpen(false);
          setSelectedMenu(null);
        }}
        initialData={selectedMenu}
        onSubmit={handleMenuSubmit}
      />
      <ConfirmModal
        isOpen={menuToDelete !== null}
        onClose={() => setMenuToDelete(null)}
        onConfirm={handleConfirmDeleteMenu}
        title="Hapus Menu Permanen?"
        message={`Apakah Anda yakin ingin menghapus "${menuToDelete?.name}" beserta fotonya dari sistem?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}
