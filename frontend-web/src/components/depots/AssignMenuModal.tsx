import React, { useState, useEffect, useMemo } from "react";
import Modal from "../ui/Modal";
import { Menu, Category } from "@/types";
import { Search } from "lucide-react";

interface AssignMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  depotName: string;
  allMenus: Menu[];
  allCategories: Category[];
  initialMenuIds: number[];
  onSave: (menuIds: number[]) => Promise<boolean>;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export default function AssignMenuModal({
  isOpen,
  onClose,
  depotName,
  allMenus,
  allCategories,
  initialMenuIds,
  onSave,
  maxWidth = "md",
}: AssignMenuModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialMenuIds);
      setSearchQuery("");
    }
  }, [isOpen, initialMenuIds]);

  const groupedMenus = useMemo(() => {
    const filtered = allMenus.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return allCategories
      .map((category) => ({
        ...category,
        menus: filtered.filter((menu) => menu.category_id === category.id),
      }))
      .filter((group) => group.menus.length > 0);
  }, [allMenus, allCategories, searchQuery]);

  const toggleMenu = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleCategory = (categoryMenus: Menu[]) => {
    const menuIds = categoryMenus.map((m) => m.id);
    const allSelected = menuIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !menuIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...menuIds])));
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      const success = await onSave(selectedIds);
      if (success) onClose();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={`Atur Menu: ${depotName}`} isOpen={isOpen} onClose={onClose} maxWidth={maxWidth}>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari menu..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
          {groupedMenus.map((group) => {
            const isCatSelected = group.menus.every((m) =>
              selectedIds.includes(m.id),
            );
            return (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <h3 className="font-bold text-gray-700">{group.name}</h3>
                  <button
                    onClick={() => toggleCategory(group.menus)}
                    className="text-xs text-blue-600 font-medium hover:underline"
                  >
                    {isCatSelected ? "Batal Pilih Semua" : "Pilih Semua"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                  {group.menus.map((menu) => (
                    <label
                      key={menu.id}
                      className="flex items-center gap-3 p-2 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.includes(menu.id)}
                        onChange={() => toggleMenu(menu.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {menu.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Rp {menu.price.toLocaleString()}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-500">
            {selectedIds.length} menu terpilih
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 rounded-md"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
