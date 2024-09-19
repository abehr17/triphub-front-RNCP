import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Home } from "lucide-react-native";
import { Pressable } from "react-native";
export default function HeaderHomeButton({ onTabNavigator = false }) {
  const navigation = useNavigation();

  return (
    <Pressable>
      <Home
        color="#F58549"
        strokeWidth={2}
        onPress={() => navigation.navigate("Home")}
        style={{ marginLeft: onTabNavigator ? 10 : 0 }}
      />
    </Pressable>
  );
}
