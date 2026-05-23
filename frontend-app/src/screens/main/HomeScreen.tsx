import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDepots } from '@/hooks/useDepots';
import DepotCard from '@/components/depots/DepotCard';

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const { depots, isLoading, refetch } = useDepots();

  return (
    <View className="flex-1 bg-white">
      <View 
        className="rounded-b-[32px] bg-bakso-primary px-6 pb-6 shadow-sm" 
        style={{ paddingTop: insets.top + 20 }}
      >
        <Text className="text-md font-bold text-bakso-secondary uppercase tracking-widest">
          DEPOT BAKSO ASLI BALIKPAPAN
        </Text>
        <Text className="text-sm font-bold text-bakso-secondary tracking-widest italic">
          Sejak 1983
        </Text>
        <Text className="text-3xl font-black text-white mt-4" numberOfLines={1}>
          {user ? `Halo, ${user.username || user.full_name}` : 'Selamat Datang !'}
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-6" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#DC2626']} />
        }
      >
        <Text className="text-lg font-black text-bakso-text mb-4 px-2">Pilih Cabang Terdekat</Text>
        {isLoading && depots.length === 0 ? (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator size="large" color="#DC2626" />
            <Text className="text-sm text-bakso-muted mt-4">Mencari cabang terdekat...</Text>
          </View>
        ) : depots.length === 0 ? (
          <View className="py-10 items-center justify-center">
            <Text className="text-sm text-bakso-muted">Belum ada cabang yang terdaftar.</Text>
          </View>
        ) : (
          depots.map((depot, index) => (
            <DepotCard 
              key={depot.id} 
              depot={depot} 
              isClosest={index === 0}
            />
          ))
        )}

      </ScrollView>
    </View>
  );
}