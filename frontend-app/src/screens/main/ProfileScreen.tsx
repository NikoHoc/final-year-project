import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import LoginReminder from '../../components/auth/LoginReminder';
import { Mail, Phone, Calendar, ShoppingBag, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari akun pelanggan Anda?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Keluar", 
          style: "destructive",
          onPress: async () => {
            await logout();
            Alert.alert("Selesai", "Anda telah berhasil keluar.");
          }
        }
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Mei 2026";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="bg-white border-b border-gray-100 px-6 py-5 shadow-sm flex-row items-center justify-between">
        <Text className="text-2xl font-black text-gray-800">Profil Saya</Text>
      </View>
      {!user ? (
        <View className="flex-1">
          <LoginReminder message="Silahkan login untuk mengakses profil anda." />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-3xl p-6 items-center border border-gray-100 shadow-sm mb-4">
            <View className="w-20 h-20 bg-bakso-primary rounded-full items-center justify-center mb-3">
              <Text className="text-white text-3xl font-black">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <Text className="text-xl font-black text-gray-800">{user.full_name}</Text>
            <Text className="text-sm text-gray-400">@{user.username}</Text>
          </View>
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm items-center">
              <ShoppingBag size={20} color="#DC2626" className="mb-1" />
              <Text className="text-[10px] font-bold text-gray-400 uppercase">Total Pesanan</Text>
              <Text className="text-lg font-black text-gray-800 mt-0.5">
                {(user as any).total_transactions || 12}x
              </Text>
            </View>
            
            <View className="flex-index flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm items-center">
              <Calendar size={20} color="#F59E0B" className="mb-1" />
              <Text className="text-[10px] font-bold text-gray-400 uppercase">Bergabung Sejak</Text>
              <Text className="text-xs font-black text-gray-800 mt-2 text-center">
                {formatDate((user as any).created_at)}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4 mb-6">
            <Text className="text-sm font-black text-gray-400 uppercase tracking-wider mb-1">Informasi Akun</Text>
            
            <View className="flex-row items-center border-b border-gray-50 pb-3">
              <Mail size={16} color="#9CA3AF" />
              <View className="ml-4">
                <Text className="text-[10px] font-bold text-gray-400 uppercase">Alamat Email</Text>
                <Text className="text-sm font-semibold text-gray-700 mt-0.5">{user.email}</Text>
              </View>
            </View>

            <View className="flex-row items-center pb-1">
              <Phone size={16} color="#9CA3AF" />
              <View className="ml-4">
                <Text className="text-[10px] font-bold text-gray-400 uppercase">Nomor Handphone</Text>
                <Text className="text-sm font-semibold text-gray-700 mt-0.5">{user.phone_number || '-'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleLogout}
            className="w-full bg-red-50 border border-red-200 py-4 rounded-2xl flex-row justify-center items-center mb-10 active:bg-red-100"
          >
            <LogOut size={18} color="#DC2626" style={{ marginRight: 8 }} />
            <Text className="text-red-600 font-bold text-base">Keluar dari Akun</Text>
          </TouchableOpacity>

        </ScrollView>
      )}
    </View>
  );
}