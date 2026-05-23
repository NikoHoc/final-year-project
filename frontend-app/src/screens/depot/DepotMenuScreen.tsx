import React, { useState, useMemo, useContext } from 'react';
import { View, Text, SectionList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search } from 'lucide-react-native';
import { AuthContext } from '@/context/AuthContext';
import { useMenus } from '@/hooks/useMenus';
import MenuCard from '@/components/menus/MenuCard';
import LoginReminderModal from '@/components/auth/LoginReminderModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useDepotDetail } from '@/hooks/useDepotDetail';
import DepotInfoCard from '@/components/depots/DepotInfoCard';

export default function DepotMenuScreen() {
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const { depotId, depotName } = route.params;
  
  const { user } = useContext(AuthContext);
  const { menus, categories, isLoading: isMenusLoading, refetch: refetchMenus } = useMenus(depotId);
  const { depot, isLoading: isDepotLoading } = useDepotDetail(depotId);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Semua');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const filteredData = useMemo(() => {
    let filteredMenu = menus.filter(menu => {
      const categoryName = menu.categories?.name || 'Lainnya';
      
      const matchesSearch = menu.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCat === 'Semua' || (categoryName === selectedCat);
      
      return matchesSearch && matchesCat;
    });

    const groups = filteredMenu.reduce((acc: any, menu: any) => {
      const catName = menu.categories?.name || 'Lainnya';
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(menu);
      return acc;
    }, {});

    return Object.keys(groups).map(title => ({
      title,
      data: groups[title]
    }));
  }, [menus, search, selectedCat]);

  if (isDepotLoading) return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator className="mt-10" size="large" color="#DC2626" />
        <Text className="text-gray-400">Memuat data depot</Text>
    </View>
  )

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-gray-800 ml-2" numberOfLines={1}>{depotName}</Text>
      </View>

      <View className="px-4 py-3 bg-white z-10 shadow-sm">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-3">
          <Search size={18} color="#9CA3AF" />
          <TextInput placeholder="Cari menu favorit..." className="flex-1 ml-2 text-sm" value={search} onChangeText={setSearch} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setSelectedCat('Semua')} className={`px-5 py-2 rounded-xl mr-2 ${selectedCat === 'Semua' ? 'bg-bakso-primary' : 'bg-gray-100'}`}>
            <Text className={`font-bold text-sm ${selectedCat === 'Semua' ? 'text-white' : 'text-gray-600'}`}>Semua</Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity key={c.id} onPress={() => setSelectedCat(c.name)} className={`px-5 py-2 rounded-xl mr-2 ${selectedCat === c.name ? 'bg-bakso-primary' : 'bg-gray-100'}`}>
              <Text className={`font-bold text-sm ${selectedCat === c.name ? 'text-white' : 'text-gray-600'}`}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isMenusLoading ? (
        <ActivityIndicator className="mt-10" size="large" color="#DC2626" />
      ) : (
        <SectionList
          sections={filteredData}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
          refreshControl={
            <RefreshControl 
              refreshing={isMenusLoading} 
              onRefresh={refetchMenus} 
              colors={['#DC2626']}
            />
          }
          ListHeaderComponent={<DepotInfoCard depot={depot} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text className="text-base font-black text-gray-800 bg-white py-3">{title}</Text>
          )}
          renderItem={({ item }) => (
            <MenuCard 
              menu={item} 
              isDepotOpen={depot?.is_open ?? false}
              onPress={() => !user ? setShowLoginModal(true) : console.log("Add to Cart:", item.id)} 
            />
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-10">Menu tidak ditemukan.</Text>
          }
        />
      )}

      <LoginReminderModal 
        visible={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </View>
  );
}