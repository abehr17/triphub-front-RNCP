import React, { useEffect, useState } from "react";
import { View, Platform, Pressable } from "react-native";
import PDFReader from "rn-pdf-reader-js";
import * as FileSystem from "expo-file-system";
import PdfRendererView from "react-native-pdf-renderer";
import { ArrowLeft } from "lucide-react-native";
export default function ViewDocumentsScreen({ route, navigation }) {
  const { fileName } = route.params;
  const [pdfUri, setPdfUri] = useState(null);
  console.log("pdfURI", pdfUri);

  useEffect(() => {
    const loadPdfUri = async () => {
      try {
        const appDir = FileSystem.documentDirectory; // Dossier de l'application Expo
        const pdfUri = `${appDir}${fileName}`;
        setPdfUri(pdfUri);
      } catch (error) {
        console.error("Erreur lors du chargement du fichier PDF :", error);
      }
    };

    loadPdfUri();
  }, [fileName]);

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={{
          position: "absolute",
          top: Platform.OS === "ios" ? 80 : 20,
          right: 30,
          zIndex: 999,
          backgroundColor: "#EEC170",
          padding: 10,
          borderRadius: 50,
        }}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft color="white" strokeWidth={3} />
      </Pressable>
      {pdfUri && (
        <PDFReader
          source={{
            uri: pdfUri,
          }}
        />
      )}
    </View>
  );
}
