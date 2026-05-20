"use client";

export default function CashierOnlineTransaction() {
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            Transaksi Online
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Pantau pesanan online yang masuk dari aplikasi pelanggan
          </p>
        </div>
      </div>
    </div>
  );
}