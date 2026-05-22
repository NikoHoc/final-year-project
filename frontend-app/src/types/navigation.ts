import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Pesanan: undefined; 
  Profile: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<BottomTabParamList>;
  Login: undefined;
  Register: undefined;
  DepotMenu: { 
    depotId: number; 
    depotName: string; 
  };
  Cart: {
    depotId: number;
  };
};