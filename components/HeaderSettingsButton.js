import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Settings } from "lucide-react-native";
import { Pressable } from "react-native";
export default function HeaderSettingsButton({ onTabNavigator = false }) {
  const navigation = useNavigation();

  return (
    <Pressable>
      <Settings
        color="#F58549"
        strokeWidth={2}
        onPress={() => navigation.navigate("Settings")}
        style={{ marginRight: onTabNavigator ? 10 : 0 }}
      />
    </Pressable>
  );
}
