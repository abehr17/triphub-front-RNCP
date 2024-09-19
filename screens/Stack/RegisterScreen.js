/**
 * Composant RegisterScreen
 *
 * Ce composant représente l'écran d'inscription où les utilisateurs peuvent créer un nouveau compte.
 * Il inclut des champs de saisie pour le nom d'utilisateur, l'e-mail, le mot de passe et la confirmation du mot de passe.
 * Les utilisateurs peuvent s'inscrire en fournissant les informations requises et en appuyant sur le bouton "S'inscrire".
 * De plus, les utilisateurs peuvent choisir de continuer avec l'authentification Google ou Facebook.
 * En cas d'erreurs lors de l'inscription, une modal d'alerte sera affichée avec des messages pertinents.
 */

import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  ImageBackground,
  Image,
} from "react-native";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { login } from "../../reducers/users"; // Import du composant Facebook et Google et Flèche de droite
import { useDispatch } from "react-redux";

const RegisterScreen = () => {
  // Variables d'état pour stocker la saisie utilisateur et gérer la visibilité de la modal d'alerte
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const dispatch = useDispatch();
  // Hook de navigation pour gérer les actions de navigation
  const navigation = useNavigation();

  // import du background et du logo
  const backgroundImage = require("../../assets/background.png");
  const logo = require("../../assets/triphublogofinal.png");

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  // Fonction pour gérer la navigation arrière
  const handlePress = () => {
    navigation.goBack();
  };

  // Fonction pour gérer l'inscription de l'utilisateur
  const handleRegister = () => {
    // Vérifier si tous les champs requis sont remplis
    if (!username || !email || !password || !confirmPassword) {
      setAlertMessage("Veuillez remplir tous les champs");
      setAlertVisible(true);
      return;
    }

    // Vérifier si les mots de passe correspondent
    if (password !== confirmPassword) {
      setAlertMessage("Les mots de passe ne correspondent pas");
      setAlertVisible(true);
      return;
    }

    // Vérifier si l'e-mail est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertMessage("Veuillez saisir une adresse e-mail valide");
      setAlertVisible(true);
      return;
    }

    // Préparer les données utilisateur pour les envoyer au serveur
    const userData = {
      username: username,
      email: email,
      password: password,
    };

    // Envoyer les données au backend via une requête fetch
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/register`;
    console.log(url);
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Gérer la réponse du serveur
        if (data.result) {
          // Réinitialiser les champs après une inscription réussie
          setUsername("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setAlertMessage("Inscription réussie!");
          setAlertVisible(true);
          // Naviguer vers la HomePage après une inscription réussie
          dispatch(
            login({
              email: data.user.email,
              token: data.user.token,
              username: data.user.username,
            })
          );
          navigation.navigate("Home");
        } else {
          // Gérer les erreurs d'inscription côté client
          if (data.error === "Email already exists.") {
            setAlertMessage("Cet email existe déjà.");
          } else if (data.error === "Username already exists.") {
            setAlertMessage("Ce nom d'utilisateur existe déjà.");
          } else {
            setAlertMessage("Une erreur s'est produite lors de l'inscription");
          }
          setAlertVisible(true);
        }
      })
      .catch((error) => {
        // Gérer les erreurs de requête
        console.error("Erreur lors de la requête :", error);
        setAlertMessage("Une erreur s'est produite lors de l'inscription");
        setAlertVisible(true);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />
          <View style={styles.backgroundContainer}>
            <View style={styles.container}>
              <View style={styles.logoContainer}>
                <Image source={logo} style={styles.logo} />
              </View>
              <Text style={styles.page}>Créer un compte</Text>
              {/* Champs de saisie pour le nom d'utilisateur, l'e-mail, le mot de passe et la confirmation du mot de passe */}

              <TextInput
                onChangeText={setUsername}
                value={username}
                placeholder="Nom d'utilisateur"
                style={styles.input}
                autoCapitalize="none"
              />
              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="E-mail"
                style={styles.input}
                autoCapitalize="none"
              />

              <View style={styles.inputContainer}>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={!isPasswordVisible}
                    placeholder="Mot de passe"
                    style={styles.passwordInput}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={togglePasswordVisibility}
                    style={styles.eyeIconContainer}
                  >
                    <FontAwesome5
                      name={isPasswordVisible ? "eye-slash" : "eye"}
                      size={14}
                      color="grey"
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry={!isConfirmPasswordVisible}
                    placeholder="Confirmer le mot de passe"
                    style={styles.passwordInput}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={toggleConfirmPasswordVisibility}
                    style={styles.eyeIconContainer}
                  >
                    <FontAwesome5
                      name={isConfirmPasswordVisible ? "eye-slash" : "eye"}
                      size={14}
                      color="grey"
                    />
                  </Pressable>
                </View>
              </View>
              {/* Bouton d'inscription */}

              <Pressable
                style={({ pressed }) => [
                  styles.button_register,
                  {
                    backgroundColor: pressed ? "#F2A65A" : "#F2A65A",
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
                onPress={handleRegister}
              >
                <Text style={styles.buttonText}>S'inscrire</Text>
              </Pressable>

              {/* Modal d'alerte pour afficher les messages d'inscription */}
              <Modal isVisible={isAlertVisible}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>{alertMessage}</Text>

                  <Pressable
                    style={({ pressed }) => [
                      styles.modalButton,
                      {
                        backgroundColor: pressed ? "#F2A65A" : "#F2A65A",
                        opacity: pressed ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => setAlertVisible(false)}
                  >
                    <Text style={styles.buttonText}>OK</Text>
                  </Pressable>
                </View>
              </Modal>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
// Styles pour le composant RegisterScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    textAlign: "center",
    fontSize: 40,
    paddingRight: "10%",
    paddingLeft: "10%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    margin: 30,
    borderRadius: 30,
  },
  page: {
    fontSize: 30,
    fontWeight: "bold",
    paddingTop: "50%",
    paddingBottom: "10%",
  },
  inputContainer: {
    width: "100%",
    maxWidth: 500,
  },
  input: {
    backgroundColor: "#F2F4F5",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 30,
    color: "#000",
    width: "100%",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F5",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 30,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  button_register: {
    marginTop: 30,
    backgroundColor: "#F2A65A",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    alignSelf: "center",
    width: "100%",
    elevation: 5,
    shadowColor: "#000",
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
    fontSize: 20,
  },
  eyeIconContainer: {
    margin: 10,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    color: "black",
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#F2A65A",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Fond blanc avec opacité
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 165, 0, 0.2)",
  },
  logoContainer: {
    position: "absolute",
    top: "2%",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 100,
    height: 100,
  },
});

export default RegisterScreen;
