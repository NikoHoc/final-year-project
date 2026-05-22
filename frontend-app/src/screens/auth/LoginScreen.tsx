import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { ArrowLeft, AtSign, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFormValid = email.trim() && password.trim() && !loading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-1 px-6"
          style={{ paddingTop: insets.top + 20, paddingBottom: 32 }}
        >
          <TouchableOpacity 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main', { screen: 'Home' })}
            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mb-6"
          >
            <ArrowLeft size={22} color="#374151" />
          </TouchableOpacity>
          <View className="flex-row items-center mb-10 gap-4">
            <View className="w-24 h-24 bg-bakso-background rounded-full items-center justify-center">
              <Image
                source={require('../../../assets/images/logo_sapi.png')}
                style={{ width: 72, height: 72, borderRadius: 16 }}
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-black text-gray-800 leading-tight mb-1">
                Selamat Datang!
              </Text>
              <Text className="text-sm text-gray-500 leading-snug">
                Login untuk melakukan pemesanan secara online.
              </Text>
            </View>
          </View>
          <View className="gap-4">
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
                Email
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <AtSign  size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="user@gmail.com"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-gray-800"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
                Password
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Lock size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Masukkan password"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-gray-800"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <Eye size={20} color="#9CA3AF" />
                  ) : (
                    <EyeOff size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mt-8">
            <TouchableOpacity
              className={`w-full py-4 rounded-2xl items-center shadow-sm ${
                isFormValid ? 'bg-bakso-primary' : 'bg-red-300'
              }`}
              disabled={!isFormValid}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Login</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500">Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="font-bold text-bakso-primary">Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}