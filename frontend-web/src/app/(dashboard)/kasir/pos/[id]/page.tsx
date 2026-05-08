"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import { useDepots } from "@/hooks/useDepot";
import { useCart } from "@/hooks/useCart";
import { transactionService } from "@/services/transactionService";
import {
  User,
  TransactionItem,
  Category,
  DepotMenuResponse,
} from "@/types";
import toast from "react-hot-toast";
import CheckoutPaymentModal from "@/components/orders/cashier/CheckoutPaymentModal";
import MenuCategorySection from "@/components/menus/MenuCategorySection";
import OrderCart from "@/components/orders/OrderCart";
import { TransactionPayment } from "@/types";

export default function PosPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const transactionId = params.id as string;
  const initialType = searchParams.get("type") || "onsite";
  const [orderType, setOrderType] = useState<string>(initialType);
  const [tableId, setTableId] = useState<string | null>(searchParams.get("table_id"));

  const [depotId, setDepotId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getDepotMenus, isLoading } = useDepots();
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [localMenus, setLocalMenus] = useState<DepotMenuResponse[]>([]);

  const [existingPayments, setExistingPayments] = useState<TransactionPayment[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const {
    cartItems,
    setCartItems,
    setUseTax,
    addItem,
    removeItem,
    updateQuantity,
    updateNote,
    toggleHalfPortion,
    totals,
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

        const uniqueCats: { id: number; name: string }[] = [];
        const seenIds = new Set();

        data.forEach((menu) => {
          if (menu.categories && !seenIds.has(menu.categories.id)) {
            seenIds.add(menu.categories.id);
            uniqueCats.push({
              id: menu.categories.id,
              name: menu.categories.name,
            });
          }
        });

        setLocalCategories(uniqueCats);
      } catch (error) {
        toast.error("Gagal memuat daftar menu");
        console.error("Gagal memuat menu:", error);
      }
    };

    loadData();
  }, [depotId, getDepotMenus]);

  // load transaksi jika ada
  const loadExistingTransaction = useCallback(async () => {
    if (transactionId === "new") return;

    try {
      const data = await transactionService.getById(transactionId);
      if (data) {
        setOrderType(data.type || "onsite");
        
        if (data.table_id) {
          setTableId(data.table_id.toString());
        } else {
          setTableId(null);
        }

        const mappedItems = (data.transaction_items || []).map((item: TransactionItem) => ({
            id: item.id,
            unique_id: item.id.toString(),
            menu_id: item.menu_id,
            quantity: item.quantity,
            quantity_paid: item.quantity_paid || 0,
            price_at_time: item.price_at_time,
            is_half_portion: item.is_half_portion,
            note: item.note,
            menu: item.menus!,
            is_saved: true,
            batch_number: item.batch_number,
            serve_status: item.serve_status || 'cooking',
        }));
        
        setCartItems(mappedItems);
        setExistingPayments(data.transaction_payments || []);
      }
    } catch (error) {
      console.error("Gagal memuat transaksi:", error);
      toast.error("Gagal memuat detail pesanan");
    }
  }, [transactionId, setCartItems]);

  useEffect(() => {
    loadExistingTransaction();
  }, [loadExistingTransaction]);

  const handlePaymentSuccess = () => {
    loadExistingTransaction();
  };

  const handleSimpanPesanan = async () => {
    if (!depotId || cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      const savedItems = cartItems.filter((item) => item.is_saved);

      const lastBatchNumber =
        savedItems.length > 0
          ? Math.max(...savedItems.map((item) => item.batch_number || 1))
          : 0;

      const nextBatchNumber = lastBatchNumber + 1;

      if (transactionId === "new") {
        const itemsPayload = cartItems.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          is_half_portion: item.is_half_portion,
          note: item.note,
          batch_number: 1,
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
            batch_number: nextBatchNumber,
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
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {tableId ? `Meja ${tableId} - ${orderType.toUpperCase()}` : `${orderType.toUpperCase()}`}
            </h1>
          </div>
        </div>

        <div className="md:col-span-8 h-full bg-white/50 p-4 border border-gray-100 overflow-hidden">
          <MenuCategorySection
            menus={localMenus}
            categories={localCategories}
            onMenuItemClick={addItem}
            isLoading={isLoading}
          />
        </div>
      </div>

      <OrderCart
        variant="kasir"
        cartItems={cartItems}
        tableId={tableId}
        orderType={orderType}
        isProcessing={isProcessing}
        totals={totals}
        onUpdateQuantity={updateQuantity}
        onUpdateNote={updateNote}
        onToggleHalf={toggleHalfPortion}
        onRemove={removeItem}
        onSave={handleSimpanPesanan}
        onCheckout={() => setIsPaymentModalOpen(true)}
      />

      <CheckoutPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        transactionId={transactionId}
        tableId={tableId || ""}
        cartItems={cartItems}
        existingPayments={existingPayments}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
