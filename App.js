import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import user from "./reducers/users";
import LandingScreen from "./screens/Stack/LandingScreen";

import LoginScreen from "./screens/Stack/LoginScreen";
import RegisterScreen from "./screens/Stack/RegisterScreen";
import SettingsScreen from "./screens/Stack/SettingsScreen";
import AddActivityScreen from "./screens/Stack/AddActivityScreen";
import CreateTripScreen from "./screens/Stack/CreateTripScreen";
import ViewDocumentsScreen from "./screens/Stack/ViewDocumentsScreen";
import ShowActivityScreen from "./screens/Stack/ShowActivityScreen";
import EditActivityScreen from "./screens/Stack/EditActivityScreen";
import MapScreen from "./screens/Stack/MapScreen";
import HomeScreen from "./screens/Stack/HomeScreen";
import TripScreen from "./screens/TabNavigator/TripScreen";
import HelpScreen from "./screens/TabNavigator/HelpScreen";
import DocumentsScreen from "./screens/TabNavigator/DocumentsScreen";
import { FileText, Plane, LifeBuoy } from "lucide-react-native";
import HeaderSettingsButton from "./components/HeaderSettingsButton";
import HeaderLogoutButton from "./components/HeaderLogoutButton";
import HeaderHomeButton from "./components/HeaderHomeButton";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistStore, persistReducer } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

//Ligne à commenter ou dé-commenter si besoin de vider le cache au reload de l'app
//AsyncStorage.clear()

const reducers = combineReducers({user})
const persistConfig = {
  key: 'TripHub',
  storage: AsyncStorage
}
const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false})
})
const persistor = persistStore(store)

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconComponent;
          if (route.name === "Trip") {
            iconComponent = <Plane stroke={color} size={size} />;
          } else if (route.name === "Docs") {
            iconComponent = <FileText stroke={color} size={size} />;
          } else if (route.name === "Help") {
            iconComponent = <LifeBuoy stroke={color} size={size} />;
          }
          return iconComponent;
        },
        tabBarActiveTintColor: "#F58549",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        headerTitle: "",
        headerShown: true,
        headerTintColor: "#F58549",
        headerRight: () => <HeaderSettingsButton onTabNavigator={true} />,
        headerLeft: () => <HeaderHomeButton onTabNavigator={true} />,
      })}
    >
      <Tab.Screen name="Trip" component={TripScreen} />
      <Tab.Screen name="Docs" component={DocumentsScreen} />
      <Tab.Screen name="Help" component={HelpScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              headerBackTitleVisible: false,
              headerTitle: "",
            }}
          >
            <Stack.Screen name="Landing" component={LandingScreen} />

            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: true,
                headerTintColor: "#F58549",
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerShown: true,
                headerTintColor: "#F58549",
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                headerTintColor: "#F58549",
              }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: true,
                headerTintColor: "#F58549",
                headerRight: () => <HeaderSettingsButton />,
                headerLeft: () => <HeaderLogoutButton />,
              }}
            />
            <Stack.Screen
              name="AddActivity"
              component={AddActivityScreen}
              options={{
                headerShown: true,
                headerTintColor: "#F58549",
              }}
            />
            <Stack.Screen
              name="CreateTrip"
              component={CreateTripScreen}
              options={{
                headerShown: true,
                headerTintColor: "#F58549",
              }}
            />
            <Stack.Screen
              name="ViewDocuments"
              component={ViewDocumentsScreen}
              options={{
                headerShown: true,
                headerTintColor: "#F58549",
              }}
            />
            <Stack.Screen
              name="ShowActivity"
              component={ShowActivityScreen}
              options={{
                headerShown: true,
                headerTintColor: "#F58549",
              }}
            />
            <Stack.Screen
              name="Map"
              component={MapScreen}
              options={{
                headerShown: true,
                headerTintColor: "#F58549",
              }}
            />
            <Stack.Screen
              name="EditActivity"
              component={EditActivityScreen}
              options={{
                headerShown: true,
                headerTintColor: "#F58549",
              }}
            />
            <Stack.Screen
              name="TabNavigator"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
