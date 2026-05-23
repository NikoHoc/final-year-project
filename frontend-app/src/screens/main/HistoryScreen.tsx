import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import LoginReminder from '../../components/auth/LoginReminder';
import { ClipboardList, Clock, CheckCircle2, XCircle } from 'lucide-react-native';

type FilterStatus = 'Semua' | 'Berjalan' | 'Selesai' | 'Dibatalkan';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('Semua');

  const filterTabs: FilterStatus[] = ['Semua', 'Berjalan', 'Selesai', 'Dibatalkan'];

  const mockOrders = [
    { id: 'TRX-98231', depotName: 'Cabang Jemursari', date: 'Hari ini, 12:40', total: 45000, itemsCount: 3, status: 'Berjalan' },
    { id: 'TRX-97110', depotName: 'Cabang Jemursari', date: '21 Mei 2026', total: 62000, itemsCount: 4, status: 'Selesai' },
    { id: 'TRX-96004', depotName: 'Cabang Ahmad Yani', date: '18 Mei 2026', total: 24000, itemsCount: 1, status: 'Dibatalkan' },
  ];

  const filteredOrders = activeFilter === 'Semua' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === activeFilter);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Berjalan': return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', icon: <Clock size={12} color="#D97706" /> };
      case 'Selesai': return { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', icon: <CheckCircle2 size={12} color="#16A34A" /> };
      default: return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', icon: <XCircle size={12} color="#DC2626" /> };
    }
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      
      <View className="bg-white border-b border-gray-100 px-6 py-5 shadow-sm">
        <Text className="text-2xl font-black text-gray-800">Pesanan Saya</Text>
      </View>

      {!user ? (
        <View className="flex-1">
          <LoginReminder message="Silakan login untuk memantau status pesanan aktif dan riwayat transaksi Anda." />
        </View>
      ) : (
        <>
          <View className="bg-white py-3 border-b border-gray-100">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
              {filterTabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveFilter(tab)}
                  className={`mr-2.5 px-5 py-2.5 rounded-xl border ${activeFilter === tab ? 'bg-bakso-primary border-bakso-primary' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`font-bold text-xs ${activeFilter === tab ? 'text-white' : 'text-gray-500'}`}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {filteredOrders.length === 0 ? (
              <View className="items-center justify-center py-20">
                <ClipboardList size={48} color="#D1D5DB" />
                <Text className="text-gray-400 font-bold mt-4">Tidak ada pesanan ditemukan</Text>
              </View>
            ) : (
              filteredOrders.map((order) => {
                const badge = getStatusBadgeStyle(order.status);
                return (
                  <View key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
                    <View className="flex-row justify-between items-center border-b border-gray-50 pb-3 mb-3">
                      <View>
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-wider">{order.id}</Text>
                        <Text className="text-sm font-medium text-gray-400 mt-0.5">{order.date}</Text>
                      </View>
                      
                      <View className={`flex-row items-center px-2.5 py-1 rounded-lg border ${badge.bg} ${badge.border}`}>
                        {badge.icon}
                        <Text className={`text-[10px] font-black uppercase ml-1 ${badge.text}`}>{order.status}</Text>
                      </View>
                    </View>

                    <View className="mb-2">
                      <Text className="text-base font-black text-gray-800">{order.depotName}</Text>
                      <Text className="text-xs text-gray-400 mt-1">{order.itemsCount} Menu Hidangan</Text>
                    </View>

                    <View className="flex-row justify-between items-center pt-3 border-t border-gray-50 mt-2">
                      <Text className="text-xs font-bold text-gray-400 uppercase">Total Transaksi</Text>
                      <Text className="text-base font-black text-bakso-primary">Rp {order.total.toLocaleString('id-ID')}</Text>
                    </View>

                  </View>
                );
              })
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}