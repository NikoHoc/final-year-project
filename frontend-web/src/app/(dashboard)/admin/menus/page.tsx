"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useMenus } from "@/hooks/useMenus";
import { Category, Menu } from "@/types";
import CategoryFormModal from "@/components/menus/CategoryFormModal";
import MenuFormModal from "@/components/menus/MenuFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import MenuCard from "@/components/menus/MenuCard";

export default function AdminMenusPage() {
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { menus, fetchMenus, createMenu, updateMenu, deleteMenu } = useMenus();

  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchMenus();
  }, [fetchCategories, fetchMenus]);

  const handleSaveCategory = async (data: { name: string; type: "food" | "drink" | "other" }) => {
  if (editingCategory) {
    return await updateCategory(editingCategory.id, data);
  } else {
    return await createCategory(data);
  }
};

  const handleDeleteCategory = async () => {
    if (!catToDelete) return;
    const success = await deleteCategory(catToDelete.id);
    if (success) setCatToDelete(null);
  };

  const handleSaveMenu = async (formData: FormData) => {
    if (editingMenu) {
      return await updateMenu(editingMenu.id, formData);
    } else {
      return await createMenu(formData);
    }
  };

  const handleDeleteMenu = async () => {
    if (!menuToDelete) return;
    const success = await deleteMenu(menuToDelete.id);
    if (success) setMenuToDelete(null);
  };

  const filteredMenus = menus.filter((m) => {
    const matchCategory = selectedCategory === "all" || m.category_id === selectedCategory;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Data Menu</h1>
          <p className="text-gray-600 mt-1">Kelola semua daftar kategori dan menu pusat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Kategori</h2>
            <button
              onClick={() => { setEditingCategory(null); setIsCatModalOpen(true); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Tambah Kategori"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                selectedCategory === "all" ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((category) => (
              <div key={category.id} className={`group flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                  selectedCategory === category.id ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
                }`}
              >
                <button className="flex-1 text-left" onClick={() => setSelectedCategory(category.id)}>
                  {category.name}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingCategory(category); setIsCatModalOpen(true); }} className="p-1 text-gray-400 hover:text-blue-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setCatToDelete(category)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Daftar Menu</h2>
            <div className="flex gap-4 items-center">
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari nama menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <button
                onClick={() => { 
                  if (categories.length === 0) {
                    import("react-hot-toast").then((toast) => toast.default.error("Buat kategori terlebih dahulu!"));
                    return;
                  }
                  setEditingMenu(null); 
                  setIsMenuModalOpen(true); 
                }}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
                  categories.length === 0 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={categories.length === 0}
                title={categories.length === 0 ? "Buat kategori terlebih dahulu" : "Tambah Menu Baru"}
              >
                <Plus className="h-4 w-4" /> Tambah Menu
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onEdit={(m: Menu) => { setEditingMenu(m); setIsMenuModalOpen(true); }}
                onDelete={(m: Menu) => setMenuToDelete(m)}
              />
            ))}
            {filteredMenus.length === 0 && (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Belum ada menu di kategori ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CategoryFormModal
        isOpen={isCatModalOpen}
        onClose={() => { setIsCatModalOpen(false); setEditingCategory(null); }}
        onSubmit={handleSaveCategory}
        initialData={editingCategory}
      />
      
      <MenuFormModal
        isOpen={isMenuModalOpen}
        onClose={() => { setIsMenuModalOpen(false); setEditingMenu(null); }}
        onSubmit={handleSaveMenu}
        categories={categories}
        initialData={editingMenu}
      />

      <ConfirmModal
        isOpen={!!catToDelete}
        onClose={() => setCatToDelete(null)}
        onConfirm={handleDeleteCategory}
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori "${catToDelete?.name}"?`}
      />

      <ConfirmModal
        isOpen={!!menuToDelete}
        onClose={() => setMenuToDelete(null)}
        onConfirm={handleDeleteMenu}
        title="Hapus Menu"
        message={`Apakah Anda yakin ingin menghapus menu "${menuToDelete?.name}"?`}
      />
    </div>
  );
}