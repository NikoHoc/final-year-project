"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, UserRoundPlus } from "lucide-react";
import { useDepots } from "@/hooks/useDepot";
import { useCart } from "@/hooks/useCart";
import { Menu, TransactionItem, Category, DepotMenuResponse, AddItemsPayload } from "@/types";
import toast from "react-hot-toast";
import MenuCategorySection from "@/components/menus/MenuCategorySection";
import OrderCart from "@/components/orders/OrderCart";
import CheckoutOrderModal from "@/components/orders/waiter/CheckoutOrderModal";
import { useTransaction } from "@/hooks/useTransaction";
import { useSession } from "@/contexts/SessionContext";
import { useTables } from "@/hooks/useTables";
import { supabaseRealtime } from "@/config/supabaseClient";

export default function PelayanPesananPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const { user, isLoadingSession } = useSession();
  const { getDepotMenus } = useDepots();
  const { fetchTransactionById, createTransaction, addItems, updateCustomerName } = useTransaction();
  const { fetchTableById } = useTables();

  const transactionId = params.id as string;
  const initialType = searchParams.get("type") || "dining";
  const [orderType, setOrderType] = useState<string>(initialType);
  const [tableId, setTableId] = useState<string | null>(searchParams.get("table_id"));
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [initialCustomerName, setInitialCustomerName] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [localMenus, setLocalMenus] = useState<DepotMenuResponse[]>([]);

  const [isCheckoutOrderModalOpen, setCheckoutOrderModalOpen] = useState(false);

  const {
    cartItems,
    setCartItems,
    addItem,
    removeItem,
    updateQuantity,
    updateNote,
    toggleHalfPortion,
  } = useCart();

  useEffect(() => {
    const loadData = async () => {
      if (!user?.depot_id) return;
      
      setIsLoadingMenus(true);
      
      try {
        if (transactionId === "new" && tableId) {
          const tableData = await fetchTableById(tableId);
          if (tableData) setTableNumber(tableData.table_number);
        }

        const data: DepotMenuResponse[] = await getDepotMenus(user.depot_id);
        if (!data || data.length === 0) return;

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
        console.error("Error Client Side - Gagal memuat menu:", error);
      } finally {
        setIsLoadingMenus(false);
      }
    };

    if (!isLoadingSession && user?.depot_id) {
      loadData();
    }
  }, [isLoadingSession, user?.depot_id, getDepotMenus, tableId, fetchTableById, transactionId]);

  const loadExistingTransaction = useCallback(async (silent = false) => {
    if (transactionId === "new") return;

    if (!silent) setIsLoadingExisting(true);

    try {
      const transaction = await fetchTransactionById(transactionId);
      if (transaction) {
        setOrderType(transaction.type || "dining");
        setCustomerName(transaction.customer_name || "");
        setInitialCustomerName(transaction.customer_name || "");
        setTableId(transaction.table_id ? transaction.table_id.toString() : null);
        setTableNumber(transaction.tables?.table_number || transaction.table_id?.toString() || null);

        const loadedCart =
          transaction.transaction_items?.map((item: TransactionItem) => ({
            id: item.id,
            unique_id: item.id.toString(),
            menu_id: item.menu_id,
            quantity: item.quantity,
            is_half_portion: item.is_half_portion,
            note: item.note || "",
            is_saved: true,
            batch_number: item.batch_number,
            quantity_paid: item.quantity_paid || 0,
            price_at_time: item.price_at_time,
            created_at: item.created_at,
            serve_status: item.serve_status || 'cooking',
            menu: {
              ...item.menus,
              id: item.menu_id,
              price: item.price_at_time,
              half_price: item.price_at_time,
            } as Menu,
          })
        ) || [];
        setCartItems(loadedCart);
      }
    } catch (error) {
      console.error("Error Client Side - Gagal memuat detail transaksi:", error);
    } finally {
      if (!silent) setIsLoadingExisting(false);
    }
  }, [transactionId, fetchTransactionById, setCartItems]);

  useEffect(() => {
    if (transactionId === "new" || !transactionId) return;

    loadExistingTransaction(false);
    const posChannel = supabaseRealtime
      .channel(`pos-detail-waiter-${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_items',
          filter: `transaction_id=eq.${transactionId}`
        },
        (payload) => {
          console.log("WAITER - Item Pesanan diupdate:", payload);
          loadExistingTransaction(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', 
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${transactionId}` 
        },
        (payload) => {
          console.log("WAITER - Status Transaksi Berubah:", payload);
          loadExistingTransaction(true);
        }
      )
      .subscribe();
    return () => {
      supabaseRealtime.removeChannel(posChannel);
    };
  }, [transactionId, loadExistingTransaction]);

  const handleSimpanPesanan = async () => {
    if (!user?.depot_id || cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      const savedItems = cartItems.filter(item => item.is_saved);

      const lastBatchNumber = savedItems.length > 0 
      ? Math.max(...savedItems.map(item => item.batch_number || 1)) 
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

        const response = await createTransaction({
          user_id: user.id,
          depot_id: user.depot_id,
          type: orderType as "dining" | "online" | "takeaway",
          table_id: tableId ? parseInt(tableId) : null,
          use_tax: true,
          customer_name: customerName,
          items: itemsPayload,
        });

        toast.success("Pesanan berhasil dikirim ke dapur!");
        const newTxId = response?.data?.transaction?.id;
        if (newTxId) {
          router.push(`/pelayan/pesanan/${newTxId}`);
        } else {
          router.push("/pelayan");
        }
      } else {
        const newItemsOnly = cartItems.filter((item) => !item.is_saved);
        if (newItemsOnly.length > 0) {
          const newPayload : AddItemsPayload = {
            customer_name: customerName,
            items: newItemsOnly.map((item) => ({
              menu_id: item.menu_id,
              quantity: item.quantity,
              is_half_portion: item.is_half_portion,
              note: item.note,
              batch_number: nextBatchNumber,
            })),
          };

          await addItems(transactionId, newPayload);
            
          toast.success("Pesanan tambahan dikirim!");
          setTimeout(() => {
            loadExistingTransaction();
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error Client Side - Gagal memproses pesanan: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomerNameBlur = async () => {
    if (transactionId !== "new" && customerName !== initialCustomerName) {
      try {
        await updateCustomerName(transactionId, customerName);
        setInitialCustomerName(customerName);
        toast.success("Nama pelanggan berhasil diubah!");
      } catch {
        setCustomerName(initialCustomerName);
      }
    }
  };

  if (isLoadingSession) {
    return <div className="p-8 text-center animate-pulse text-gray-400 font-bold">Mempersiapkan Mesin Pesanan...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-4">
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/pelayan")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {tableId ? `Meja ${tableNumber || tableId} - ${orderType.toUpperCase()}` : `${orderType.toUpperCase()}`}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 w-full md:w-auto">
            <UserRoundPlus size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Nama Pelanggan (Opsional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={handleCustomerNameBlur}
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400 w-full md:w-48"
            />
          </div>
        </div>

        <div className="md:col-span-8 h-full bg-white/50 p-4 border border-gray-100 overflow-hidden">
          <MenuCategorySection
            menus={localMenus}
            categories={localCategories}
            onMenuItemClick={addItem}
            isLoading={isLoadingMenus}
          />
        </div>
      </div>

      <OrderCart
        variant="pelayan"
        cartItems={cartItems}
        isProcessing={isProcessing}
        onUpdateQuantity={updateQuantity}
        onUpdateNote={updateNote}
        onToggleHalf={toggleHalfPortion}
        onRemove={removeItem}
        onSave={handleSimpanPesanan}
        onCheckout={() => setCheckoutOrderModalOpen(true)}
        onRefresh={loadExistingTransaction}
      />

      <CheckoutOrderModal 
        isOpen={isCheckoutOrderModalOpen}
        onClose={() => setCheckoutOrderModalOpen(false)}
        cartItems={cartItems}
        tableId={tableNumber || tableId || ""}
        customerName={customerName}
      />
    </div>
  );
}
