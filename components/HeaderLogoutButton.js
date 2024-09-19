import React from "react";
import { useNavigation } from "@react-navigation/native";
import { LogOut } from "lucide-react-native";
import {
  Pressable,
  View,
  Modal,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../reducers/users";

export default function HeaderLogoutButton() {
  const navigation = useNavigation();
  const dispatch = useDispatch()

  const [modalLogoutVisible, setModalLogoutVisible] = useState(false);
  const handleLogout = () => {
    setModalLogoutVisible(true);
  };

  return (
    <View>
      <Pressable>
        <LogOut
          color="#F58549"
          strokeWidth={2}
          onPress={() => handleLogout()}
        />
      </Pressable>
      <Modal
        title="Logout Modal"
        visible={modalLogoutVisible}
        animationType="fade"
        transparent
      >
        <View className="flex-1 justify-center items-center">
          <TouchableWithoutFeedback
            onPress={() => setModalLogoutVisible(false)}
          >
            <View
              title="Background opaque"
              className="bg-slate-400 absolute top-0 left-0 w-full h-full opacity-50"
            ></View>
          </TouchableWithoutFeedback>

          <View
            title="Centered view"
            className="bg-white w-5/6 h-3/6 pt-20 items-center"
          >
            <Text className="text-2xl mb-3 text-center">
              Êtes-vous sûr(e) de vouloir vous déconnecter ?
            </Text>
            <Text className="mb-5 text-center">
              Si vous n'avez pas d'accès à internet vous ne pourrez plus
              utiliser l'application.
            </Text>
            <Pressable
              className="bg-[#F2A65A] w-40 h-12 items-center justify-center rounded-xl shadow-xl shadow-black mb-3"
              onPress={() => {navigation.navigate("Landing"); dispatch(logout())}}
            >
              <Text className="text-white text-lg">Oui</Text>
            </Pressable>
            <Pressable
              className="bg-[#F2A65A] w-40 h-12 items-center justify-center rounded-xl shadow-xl shadow-black mb-3"
              onPress={() => setModalLogoutVisible(false)}
            >
              <Text className="text-white text-lg">Non</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
