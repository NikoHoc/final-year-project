import { Menu } from "@/types";
import { Edit2, Trash2, ImageIcon } from "lucide-react";
import { formatRupiah } from "@/utils/format";
import Image from "next/image";

interface MenuCardProps {
  menu: Menu;
  onEdit?: (menu: Menu) => void;
  onDelete?: (menu: Menu) => void;
  onClick?: () => void;
}

export default function MenuCard({ menu, onEdit, onDelete, onClick }: MenuCardProps) {
  return (
    <div onClick={onClick} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative h-40 w-full bg-gray-100">
        {menu.image_url ? (
          <Image 
            src={menu.image_url} 
            alt={menu.name} 
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon size={40} />
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{menu.name}</h3>
            {menu.categories?.name && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md mt-1">
                {menu.categories.name}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-blue-600">{formatRupiah(menu.price)}</p>
            {menu.half_price ? (
              <p className="text-xs text-gray-500 mt-1 font-medium">
                1/2 Porsi: {formatRupiah(menu.half_price)}
              </p>
            ) : null}
          </div>
        </div>
        
        {menu.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-1 flex-1">{menu.description}</p>
        )}

        {(onEdit || onDelete) && (
          <div className="mt-4 flex gap-2 justify-end pt-3 border-t border-gray-100">
            {onEdit && (
              <button 
                onClick={() => onEdit(menu)}
                className="cursor-pointer p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                title="Edit Menu"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(menu)}
                className="cursor-pointer p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                title="Hapus Menu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}