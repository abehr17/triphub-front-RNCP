import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { X } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [modalInfo, setModalInfo] = useState(false);
  const [modalDeleteAccount, setModalDeleteAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false); // État pour suivre si l'utilisateur est en train de changer de mot de passe
  const [inputValue1, setInputValue1] = useState(""); // Ancien mot de passe
  const [inputValue2, setInputValue2] = useState(""); // Nouveau mot de passe
  const [inputValue3, setInputValue3] = useState(""); // Confirmer le nouveau mot de passe
  const [isPasswordVisible1, setIsPasswordVisible1] = useState(false);
  const [isPasswordVisible2, setIsPasswordVisible2] = useState(false);
  const [isPasswordVisible3, setIsPasswordVisible3] = useState(false);

  // récupérer données utilisateurs
  const user = useSelector((state) => state.user.value.user);

  useEffect(() => {
    // Vérifie si l'utilisateur est défini
    if (user) {
    }
  }, [user]);

  // Affiche la modal au clic sur "Informations Personnelles"
  const handlePersonalInfoPress = () => {
    setModalInfo(true);
    setIsChangingPassword(false); // la modif du mot de passe n'est pas activée lorsqu'on ouvre la modal
  };

  // Affiche la modal au clic sur "Supprimer compte"
  const handleDeleteAccountModal = () => {
    setModalDeleteAccount(true);
  };

  // Rend le password invisible
  const togglePasswordVisibility1 = () => {
    setIsPasswordVisible1(!isPasswordVisible1);
  };

  const togglePasswordVisibility2 = () => {
    setIsPasswordVisible2(!isPasswordVisible2);
  };

  const togglePasswordVisibility3 = () => {
    setIsPasswordVisible3(!isPasswordVisible3);
  };

  // Ferme la modal
  const closeModal = () => {
    setModalInfo(false);
    setModalDeleteAccount(false);
    setIsChangingPassword(false);
  };

  // Vérifie le user
  const handleUpdatePassword = async () => {
    if (!user.token) {
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour le mot de passe: Utilisateur non défini."
      );
      return;
    }

    // Vérifie que les deux password correspondent
    if (inputValue2 !== inputValue3) {
      Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/updatePassword`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: user.token,
            oldPassword: inputValue1,
            newPassword: inputValue2,
          }),
        }
      );

      const data = await response.json();
      if (data.result) {
        Alert.alert("Succès", "Mot de passe mis à jour avec succès.");
        setInputValue1("");
        setInputValue2("");
        setInputValue3("");
      } else {
        Alert.alert(
          "Erreur",
          `Erreur lors de la mise à jour du mot de passe: ${data.error}`
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  //gérer la suppression de compte
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/deleteAccount`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: user.token,
          }),
        }
      );

      const data = await response.json();
      if (data.result) {
        // Afficher un message de confirmation
        Alert.alert("Succès", "Votre compte a été supprimé avec succès.");

        navigation.navigate("Landing");
      } else {
        // Afficher un message d'erreur si la suppression échoue
        Alert.alert(
          "Erreur",
          `Erreur lors de la suppression du compte: ${data.error}`
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  // Fonction pour afficher la modal de suppression de compte
  const handleDeleteAccountSure = () => {
    // Affiche une popup de confirmation pour que l'utilisateur confirme la suppression de son compte
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        {
          text: "Annuler",
          onPress: () => console.log("Annulation de la suppression du compte"),
          style: "cancel",
        },
        { text: "Supprimer", onPress: handleDeleteAccount },
      ]
    );
  };

  // Modifie la couleur à l'appui sur le bouton
  const logPress = (pressType) => {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réglages</Text>
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => {
            logPress("onPress");
            handlePersonalInfoPress(); //
          }}
          onPressIn={() => logPress("onPressIn")}
          onPressOut={() => logPress("onPressOut")}
          onLongPress={() => logPress("onLongPress")}
          style={({ pressed }) => [
            styles.buttonInfo,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>Informations Personnelles</Text>
        </Pressable>
        <View>
          <Pressable
            onPress={() => {
              logPress("onPress");
              handleDeleteAccountModal(); //
            }}
            onPressIn={() => logPress("onPressIn")}
            onPressOut={() => logPress("onPressOut")}
            onLongPress={() => logPress("onLongPress")}
            style={({ pressed }) => [
              styles.deleteButton,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Text style={styles.buttonText}>Supprimer mon compte</Text>
          </Pressable>
        </View>
      </View>

      {/* Modal pour les informations personnelles */}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalInfo}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <Pressable onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalContent}>
              {/* Contenu de la modal */}
              <View style={styles.modalHeader}>
                <Pressable onPress={closeModal}>
                  <X size={25} strokeWidth={4} color="black" />
                </Pressable>
              </View>
              <View>
                <Text style={styles.titleModal}>Informations personnelles</Text>
                <Text style={styles.textModal}>Username : {user.username}</Text>
                <Text style={styles.textModal}>Email : {user.email}</Text>
                <Pressable
                  onPress={() => {
                    logPress("onPress");
                    setIsChangingPassword(!isChangingPassword); //Inverse l'état de modification du mot de passe
                  }}
                  onPressIn={() => logPress("onPressIn")}
                  onPressOut={() => logPress("onPressOut")}
                  onLongPress={() => logPress("onLongPress")}
                  style={({ pressed }) => [
                    styles.buttonModal,
                    { opacity: pressed ? 0.5 : 1 }, // Réduit l'opacité lorsqu'il est pressé
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {isChangingPassword
                      ? "Annuler"
                      : "Modifier le mot de passe"}
                  </Text>
                </Pressable>
                {isChangingPassword && (
                  <>
                    <View style={styles.inputContainer}>
                      <TextInput
                        onChangeText={(text) => setInputValue1(text)}
                        value={inputValue1}
                        placeholder="Ancien mot de passe"
                        placeholderTextColor="grey"
                        secureTextEntry={!isPasswordVisible1}
                        style={styles.input}
                      />

                      <Pressable
                        onPress={() => {
                          logPress("onPress");
                          togglePasswordVisibility1();
                        }}
                        onPressIn={() => logPress("onPressIn")}
                        onPressOut={() => logPress("onPressOut")}
                        onLongPress={() => logPress("onLongPress")}
                        style={({ pressed }) => [
                          styles.eyeIconContainer,
                          { opacity: pressed ? 0.5 : 1 },
                        ]}
                      >
                        <FontAwesome5
                          name={isPasswordVisible1 ? "eye-slash" : "eye"}
                          size={14}
                          color="grey"
                        />
                      </Pressable>
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        onChangeText={(text) => setInputValue2(text)}
                        value={inputValue2}
                        placeholder="Nouveau mot de passe"
                        placeholderTextColor="grey"
                        secureTextEntry={!isPasswordVisible2}
                      />
                      <Pressable
                        onPress={togglePasswordVisibility2}
                        style={styles.eyeIconContainer}
                      >
                        <FontAwesome5
                          name={isPasswordVisible2 ? "eye-slash" : "eye"}
                          size={14}
                          color="grey"
                        />
                      </Pressable>
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        onChangeText={(text) => setInputValue3(text)}
                        value={inputValue3}
                        placeholder="Confirmer le nouveau mot de passe"
                        placeholderTextColor="grey"
                        secureTextEntry={!isPasswordVisible3}
                      />
                      <Pressable
                        onPress={togglePasswordVisibility3}
                        style={styles.eyeIconContainer}
                      >
                        <FontAwesome5
                          name={isPasswordVisible3 ? "eye-slash" : "eye"}
                          size={14}
                          color="grey"
                        />
                      </Pressable>
                    </View>

                    <Pressable
                      onPress={() => {
                        logPress("onPress");
                        handleUpdatePassword();
                      }}
                      onPressIn={() => logPress("onPressIn")}
                      onPressOut={() => logPress("onPressOut")}
                      onLongPress={() => logPress("onLongPress")}
                      style={({ pressed }) => [
                        styles.buttonModal,
                        { opacity: pressed ? 0.5 : 1 },
                      ]}
                    >
                      <Text style={styles.buttonText}>Mettre à jour</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal pour supprimer son compte */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalDeleteAccount}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Contenu de la modal */}
            <View style={styles.modalHeader}>
              <Pressable onPress={closeModal}>
                <X size={25} strokeWidth={4} color="black" />
              </Pressable>
            </View>
            <View>
              <Text style={styles.titleModal}>Supprimer son compte</Text>
              <Text style={styles.textModalAccount}>
                Êtes-vous sûr de vouloir supprimer votre compte ?
              </Text>

              <Pressable
                onPress={() => {
                  logPress("onPress");
                  handleDeleteAccountSure();
                }}
                onPressIn={() => logPress("onPressIn")}
                onPressOut={() => logPress("onPressOut")}
                onLongPress={() => logPress("onLongPress")}
                style={({ pressed }) => [
                  styles.buttonModalAccount,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
                <Text style={styles.buttonText}>Oui</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  logPress("onPress");
                  closeModal();
                }}
                onPressIn={() => logPress("onPressIn")}
                onPressOut={() => logPress("onPressOut")}
                onLongPress={() => logPress("onLongPress")}
                style={({ pressed }) => [
                  styles.buttonModalAccount,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
                <Text style={styles.buttonText}>Non</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 40,
    textAlign: "center",
    fontSize: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    padding: 30,
    marginBottom: "10%",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 20,
  },
  buttonInfo: {
    margin: "10%",
    backgroundColor: "#F2A65A",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "8%",
    alignSelf: "center",
    width: "100%",
    elevation: 5, // ombre pour Android
    shadowColor: "#000", // ombre pour iOS
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  deleteButton: {
    margin: "10%",
    backgroundColor: "#C10000",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "8%",
    alignSelf: "center",
    width: "100%",
    elevation: 5, // ombre pour Android
    shadowColor: "#000", // ombre pour iOS
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond semi-transparent
    borderWidth: 2,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 350,
    height: 650,
    padding: 20,
    marginTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end", // Pour aligner l'icône à droite
    padding: "5%",
  },
  titleModal: {
    alignSelf: "center",
    fontSize: 20,
    paddingHorizontal: 5,
    fontWeight: "bold",
  },
  textModal: {
    fontSize: 15,
    marginTop: 20,
    padding: 10,
    borderColor: "#CCCCCC", // Couleur de la bordure
    borderRadius: 15,
    borderWidth: 1,
  },
  buttonModal: {
    alignSelf: "center",
    marginTop: 30,
    backgroundColor: "#F2A65A",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    alignSelf: "center",
    width: 240,
    elevation: 5, // ombre pour Android
    shadowColor: "#000", // ombre pour iOS
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2F4F5",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 30,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  eyeIconContainer: {
    padding: 10,
  },
  buttonModalAccount: {
    backgroundColor: "#F2A65A",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    alignSelf: "center",
    width: "100%",
    marginTop: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  textModalAccount: {
    fontSize: 15,
    marginTop: "5%",
    padding: "5%",
    alignSelf: "center",
    textAlign: "center",
  },
});
