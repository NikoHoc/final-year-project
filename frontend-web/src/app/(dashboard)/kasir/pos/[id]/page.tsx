"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  Banknote,
  ChefHat,
} from "lucide-react";
import { useDepots } from "@/hooks/useDepot";
import { useCart } from "@/hooks/useCart";
import { transactionService } from "@/services/transactionService";
import { User, Menu, TransactionItem, Category, DepotMenuResponse } from "@/types";
import { formatRupiah } from "@/utils/format";
import toast from "react-hot-toast";

export default function PosPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const transactionId = params.id as string;
  const initialTableId = searchParams.get("table_id");
  const orderType = searchParams.get("type") || "onsite";

  const [depotId, setDepotId] = useState<number | null>(null);
  const [tableId, setTableId] = useState<string | null>(initialTableId);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getDepotMenus } = useDepots();
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [localMenus, setLocalMenus] = useState<DepotMenuResponse[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    cartItems, setCartItems, setUseTax,
    addItem, removeItem, updateQuantity, updateNote,
    toggleHalfPortion, totals,
  } = useCart();

  useEffect(() => {
    setUseTax(true);
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const user: User = JSON.parse(userCookie);
      setDepotId(user.depot_id || null);
      setUserId(user.id || null);
    }
  }, [setUseTax]);

  useEffect(() => {
    const loadData = async () => {
      if (!depotId) return;
      
      try {
        const data: DepotMenuResponse[] = await getDepotMenus(depotId);
        
        if (!data || data.length === 0) {
          console.error("Data dari API kosong atau bukan array:", data);
          return;
        }

        setLocalMenus(data);

        const uniqueCats: {id: number, name: string}[] = [];
        const seenIds = new Set();

        data.forEach((menu) => {
          if (menu.categories && !seenIds.has(menu.categories.id)) {
            seenIds.add(menu.categories.id);
            uniqueCats.push({
              id: menu.categories.id,
              name: menu.categories.name
            });
          }
        });

        setLocalCategories(uniqueCats);

        setActiveCategoryId((prev) => (prev === null && uniqueCats.length > 0 ? uniqueCats[0].id : prev));
      } catch (error) {
        toast.error("Gagal memuat daftar menu");
        console.error("Gagal memuat menu:", error);
      }
    };

    loadData();
  }, [depotId, getDepotMenus, activeCategoryId]);

  // load transaksi jika ada
  useEffect(() => {
    const loadExistingTransaction = async () => {
      if (transactionId !== "new") {
        try {
          const transaction = await transactionService.getById(transactionId);
          if (transaction.table_id) setTableId(transaction.table_id.toString());

          const loadedCart =
            transaction.transaction_items?.map((item: TransactionItem) => ({
              unique_id: item.id.toString(),
              menu_id: item.menu_id,
              quantity: item.quantity,
              is_half_portion: item.is_half_portion,
              note: item.note || "",
              is_saved: true,
              menu: {
                ...item.menus,
                id: item.menu_id,
                price: item.price_at_time,
                half_price: item.price_at_time,
              } as Menu,
            })) || [];

          setCartItems(loadedCart);
        } catch (error) {
          console.log("Error mengambil data transaksi lama:", error);
          toast.error("Gagal memuat data transaksi lama");
        }
      }
    };
    loadExistingTransaction();
  }, [transactionId, setCartItems]);

  const filteredMenus = useMemo(() => {
    return localMenus.filter((menu) => {
      if (!menu.is_available) return false;

      if (searchQuery) {
        return menu.name.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return Number(menu.categories.id) === Number(activeCategoryId);
    });
  }, [localMenus, activeCategoryId, searchQuery]);

  const handleSimpanPesanan = async () => {
    if (!depotId || cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      if (transactionId === "new") {
        const itemsPayload = cartItems.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          is_half_portion: item.is_half_portion,
          note: item.note,
        }));

        const response = await transactionService.create({
          user_id: userId,
          depot_id: depotId,
          type: orderType as "onsite" | "online" | "takeaway",
          table_id: tableId ? parseInt(tableId) : null,
          use_tax: true,
          items: itemsPayload,
        });

        toast.success("Pesanan berhasil dikirim ke dapur!");

        const newTxId = response?.data?.transaction?.id;

        if (newTxId) {
          router.push(`/kasir/pos/${newTxId}`);
        } else {
          router.push("/kasir");
        }
      } else {
        const newItemsOnly = cartItems.filter((item) => item.is_saved !== true);

        if (newItemsOnly.length > 0) {
          const newPayload = newItemsOnly.map((item) => ({
            menu_id: item.menu_id,
            quantity: item.quantity,
            is_half_portion: item.is_half_portion,
            note: item.note,
          }));

          await transactionService.addItems(transactionId, newPayload);
          toast.success("Pesanan tambahan dikirim!");

          window.location.reload();
        }
      }
    } catch (error) {
      toast.error("Gagal memproses pesanan");
      console.error("Gagal memproses pesanan: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-4">
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <button
            onClick={() => router.push("/kasir")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        {!searchQuery && localCategories.length > 0 && (
          <div className="flex overflow-x-auto hide-scrollbar gap-2 p-3 border-b border-gray-100 shrink-0">
            {localCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategoryId === category.id ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenus.length > 0 ? (
              filteredMenus.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => addItem(menu)}
                  className="flex flex-col text-left bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="relative w-full aspect-video bg-gray-100">
                    {menu.image_url ? (
                      <Image src={menu.image_url} alt={menu.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{menu.name}</h3>
                    <p className="text-blue-600 font-semibold text-sm mt-1">{formatRupiah(menu.price)}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-gray-400">
                Menu tidak ditemukan
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-100 xl:w-112.5 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div className="p-4 bg-gray-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-bold text-lg">
              Pesanan #{tableId ? `Meja ${tableId}` : "Takeaway"}
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              {orderType === "onsite" ? "Dine-in" : "Bungkus"}
            </p>
          </div>
          <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-medium border border-gray-700">
            {transactionId === "new" ? "Draf Baru" : "Sedang Berjalan"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p>Keranjang masih kosong</p>
              <p className="text-xs mt-1">
                Klik menu di sebelah kiri untuk menambah
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.unique_id}
                className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-800 truncate">
                    {item.menu.name}
                  </h4>
                  <p className="text-blue-600 font-semibold text-sm">
                    {formatRupiah(
                      item.is_half_portion && item.menu.half_price
                        ? item.menu.half_price
                        : item.menu.price,
                    )}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <Edit3 size={14} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder={
                        item.is_saved ? "Catatan terkunci" : "Tambah catatan..."
                      }
                      value={item.note || ""}
                      onChange={(e) =>
                        updateNote(item.unique_id, e.target.value)
                      }
                      disabled={item.is_saved}
                      className={`flex-1 text-xs border-b outline-none pb-1 bg-transparent ${
                        item.is_saved
                          ? "border-transparent text-gray-400 cursor-not-allowed"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  {item.menu.half_price && (
                    <button
                      onClick={() => toggleHalfPortion(item.unique_id)}
                      disabled={item.is_saved}
                      className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-blue-600"
                    >
                      {item.is_half_portion ? (
                        <CheckSquare size={14} className="text-blue-600" />
                      ) : (
                        <Square size={14} />
                      )}
                      Porsi 1/2
                    </button>
                  )}
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.unique_id)}
                    disabled={item.is_saved}
                    className={`p-1 ${
                      item.is_saved
                        ? "text-gray-200 cursor-not-allowed"
                        : "text-red-400 hover:text-red-600"
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.unique_id, -1)}
                      disabled={item.is_saved}
                      className={`w-6 h-6 flex items-center justify-center rounded shadow-sm ${
                        item.is_saved
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      <Minus size={14} />
                    </button>

                    <span
                      className={`w-6 text-center text-sm font-bold ${item.is_saved ? "text-gray-400" : "text-gray-800"}`}
                    >
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.unique_id, 1)}
                      disabled={item.is_saved}
                      className={`w-6 h-6 flex items-center justify-center rounded shadow-sm ${
                        item.is_saved
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">
                {formatRupiah(totals.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between group opacity-70">
              <div className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  // checked={useTax}
                  // onChange={(e) => setUseTax(e.target.checked)}
                  checked={true}
                  readOnly
                  className="w-4 h-4 rounded text-blue-600 cursor-not-allowed"
                  title="PPN 10%"
                />
                <span>Pajak (10%)</span>
              </div>
              <span className="font-semibold">{formatRupiah(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-900 pt-2 border-t border-gray-200 mt-2">
              <span className="font-bold text-base">Total Bayar</span>
              <span className="font-black text-xl text-blue-600">
                {formatRupiah(totals.grandTotal)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSimpanPesanan}
              disabled={cartItems.length === 0 || isProcessing}
              className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all"
            >
              <ChefHat size={18} /> Simpan
            </button>
            <button
              disabled={cartItems.length === 0 || isProcessing}
              className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-md shadow-blue-200"
            >
              <Banknote size={18} /> Bayar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
