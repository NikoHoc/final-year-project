import { ChartData } from "@/types";
import { Trophy } from "lucide-react";

interface Props {
  data: ChartData[];
  isLoading?: boolean;
}

export default function TopMenuLeaderboard({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-[350px] w-full flex flex-col items-center justify-center">
        <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 mb-2">
          <Trophy size={18} className="text-yellow-500" /> Top 10 Menu Terlaris
        </h3>
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[350px] w-full flex flex-col items-center justify-center">
        <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 mb-2">
          <Trophy size={18} className="text-yellow-500" /> Top 10 Menu Terlaris
        </h3>
        <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-400 italic w-full border-2 border-dashed border-gray-100 rounded-3xl">
          Belum ada data penjualan menu
        </div>
      </div>
    );
  }

  // Cari nilai tertinggi untuk menghitung persentase lebar bar background
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="h-[350px] w-full flex flex-col">
      <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
        <Trophy size={18} className="text-yellow-500" /> Top 10 Menu Terlaris
      </h3>
      
      {/* Container dengan scroll internal jika menu banyak */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {data.map((item, index) => {
          const percentage = Math.max((item.value / maxValue) * 100, 5); // Minimal lebar 5%
          
          return (
            <div key={index} className="relative w-full h-10 bg-gray-50 rounded-xl overflow-hidden flex items-center z-0">
              {/* Latar Belakang Progress Bar */}
              <div 
                className="absolute top-0 left-0 h-full bg-yellow-100/60 z-[-1] transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
              
              {/* Konten Teks */}
              <div className="flex justify-between items-center w-full px-3 z-10">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`text-[10px] font-black w-4 text-center ${index < 3 ? 'text-yellow-600' : 'text-gray-400'}`}>
                    #{index + 1}
                  </span>
                  <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-black text-gray-800">
                  {item.value} <span className="text-[10px] text-gray-500 font-bold">Porsi</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}