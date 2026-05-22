import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MapPin, Clock } from 'lucide-react-native';

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);

  return (
    <View className="flex-1 bg-white">
      <View 
        className="rounded-b-[32px] bg-bakso-primary px-6 pb-6 shadow-sm" 
        style={{ paddingTop: insets.top + 20 }}
      >
        <Text className="text-sm font-bold text-bakso-secondary uppercase tracking-widest">
          DEPOT BAKSO ASLI BALIKPAPAN
        </Text>
        <Text className="text-xs font-bold text-bakso-secondary tracking-widest italic">
          Sejak 1983
        </Text>
        <Text className="text-3xl font-black text-white mt-4" numberOfLines={1}>
          {user ? `Hello, ${user.full_name || user.username}` : 'Welcome !'}
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-6" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-lg font-black text-bakso-text mb-4 px-2">Pilih Cabang Terdekat</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('DepotMenu', { depotId: 1, depotName: 'Cabang Jemursari' })}
          className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm"
        >
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-bold text-bakso-text mb-1">Cabang Jemursari</Text>
              <View className="flex-row items-start">
                <MapPin size={12} color="#9CA3AF" style={{ marginTop: 2, marginRight: 4 }} />
                <Text className="text-xs text-bakso-muted flex-1 leading-relaxed">
                  Jl. Raya Jemursari No. 123, Surabaya
                </Text>
              </View>
            </View>
            
            {/* Status Buka/Tutup */}
            <View className="bg-green-50 px-2 py-1 rounded-md border border-green-100">
              <Text className="text-[10px] font-bold text-green-600 uppercase">BUKA</Text>
            </View>
          </View>

          <View className="flex-row items-center border-t border-gray-50 pt-3 mt-1">
            <Clock size={12} color="#F59E0B" />
            <Text className="text-xs font-bold text-bakso-secondary ml-1.5">
              Jarak: Menghitung lokasi...
            </Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}