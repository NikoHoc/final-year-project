import Image from "next/image";
import { ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { Menu } from "@/types";
import { formatRupiah } from "@/utils/format";

interface MenuCardProps {
  menu: Menu;
  actionButtons?: React.ReactNode; 
}

export default function MenuCard({ menu, actionButtons }: MenuCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="h-40 bg-gray-100 relative overflow-hidden">
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
        <div className="absolute top-3 right-3 z-10">
          {menu.is_available ? (
            <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold shadow-sm border border-green-200">
              <CheckCircle2 size={12} /> Tersedia
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-semibold shadow-sm border border-red-200">
              <XCircle size={12} /> Habis
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 truncate mb-1" title={menu.name}>{menu.name}</h3>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-blue-600 font-bold">{formatRupiah(menu.price)}</span>
          {menu.half_price && (
            <span className="text-xs text-gray-500 line-through mb-0.5">{formatRupiah(menu.half_price)} (1/2)</span>
          )}
        </div>
        {menu.description && <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{menu.description}</p>}
        
        {actionButtons && (
          <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
            {actionButtons}
          </div>
        )}
      </div>
    </div>
  );
}