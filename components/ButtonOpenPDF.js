import React, { useState, useEffect } from "react";
import { Pressable, Alert, Platform } from "react-native";
import * as Print from "expo-print";
import { Eye } from "lucide-react-native";
import { FileSystem } from "expo";
import { useNavigation } from "@react-navigation/native";

export default function ButtonOpenPDF({ fileName, url }) {
  const navigation = useNavigation();

  const handleOpenPDFAndroid = async () => {
    const urlAndroid = `${url}`;
    console.log("urlAndroid", urlAndroid);
    try {
      await Print.printAsync({
        uri: urlAndroid,
      });
    } catch (error) {
      console.error("Erreur lors de l'impression:", error);
      Alert.alert(
        "Erreur",
        "Impossible d'imprimer le document. Veuillez réessayer."
      );
    }
  };

  return (
    <>
      {Platform.OS === "android" ? (
        <Pressable onPress={handleOpenPDFAndroid}>
          <Eye color="#4A90E2" size={24} />
        </Pressable>
      ) : (
        <Pressable
          onPress={() =>
            navigation.navigate("ViewDocuments", {
              url: url,
              fileName: fileName,
            })
          }
        >
          <Eye color="#4A90E2" size={24} />
        </Pressable>
      )}
    </>
  );
}
