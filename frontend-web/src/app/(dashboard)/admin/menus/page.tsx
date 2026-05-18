"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, Soup } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useMenus } from "@/hooks/useMenus";
import { Category, Menu } from "@/types";
import CategoryFormModal from "@/components/menus/CategoryFormModal";
import MenuFormModal from "@/components/menus/MenuFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import MenuCard from "@/components/menus/MenuCard";
import toast from "react-hot-toast";

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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            Manajemen Master Data Menu
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Kelola semua daftar kategori dan menu pusat.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:items-start lg:max-h-[calc(100vh-190px)]">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:min-h-50 lg:max-h-[calc(100vh-190px)] flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Kategori</h2>
            <button
              onClick={() => { setEditingCategory(null); setIsCatModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus size={16} /> Kategori
            </button>
          </div>
          <div className="space-y-1 flex-1 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedCategory === "all" 
                  ? "bg-blue-50 text-blue-700 border border-blue-100" 
                  : "text-gray-600 hover:bg-gray-50 border border-transparent"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((category) => (
              <div 
                key={category.id} 
                className={`group flex items-center justify-between px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedCategory === category.id 
                    ? "bg-blue-50 text-blue-700 border border-blue-100" 
                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                }`}
              >
                <button className="flex-1 text-left py-1" onClick={() => setSelectedCategory(category.id)}>
                  {category.name}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingCategory(category); setIsCatModalOpen(true); }} className="p-1 bg-white text-gray-400 hover:text-blue-600 rounded-md shadow-sm border border-gray-100">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => setCatToDelete(category)} className="p-1 bg-white text-gray-400 hover:text-red-600 rounded-md shadow-sm border border-gray-100">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:min-h-50 lg:max-h-[calc(100vh-190px)] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 mb-5 shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Daftar Menu</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari nama menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => { 
                  if (categories.length === 0) {
                    toast.error("Buat kategori dulu!")
                    return;
                  }
                  setEditingMenu(null); 
                  setIsMenuModalOpen(true); 
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  categories.length === 0 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-sm"
                }`}
                disabled={categories.length === 0}
              >
                <Plus size={16} /> Menu
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMenus.map((menu) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  onEdit={(m: Menu) => { setEditingMenu(m); setIsMenuModalOpen(true); }}
                  onDelete={(m: Menu) => setMenuToDelete(m)}
                />
              ))}
              {filteredMenus.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Soup size={40} className="text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium text-sm">Menu yang dicari tidak ditemukan.</p>
                </div>
              )}
            </div>
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