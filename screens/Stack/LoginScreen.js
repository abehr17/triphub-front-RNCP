import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
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
import { login } from "../../reducers/users";

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/;

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);


  const [email, setEmail] = useState(user.user.email);
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const backgroundImage = require("../../assets/background.png");
  const logo = require("../../assets/triphublogofinal.png");

  //console.log(user)
  async function handleSubmitSignIn() {
    if (!isEmailValid) {
      alert("Please enter a valid email address.");
      return;
    }
    
    if (email && password) {
      try {
        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/login`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        const data = await res.json();
        if (data.result === true) {
          //console.log('data:', data);
          dispatch(
            login({
              email: data.user.email,
              token: data.user.token,
              username: data.user.username,
            })
          );
          setPassword("");
          setEmail("");
          navigation.navigate("Home"); // Naviguer vers HomePage après la connexion réussie ?
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error(
          "Une erreur s'est produite lors de la connexion :",
          error
        );
        alert("Une erreur s'est produite lors de la connexion. Réessayez.");
      }
    } else {
      alert("E-mail ou mot de passe invalide.");
    }
  }

  const handleEmailChange = (text) => {
    setEmail(text);
    setIsEmailValid(EMAIL_REGEX.test(text));
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleNavigateToRegister = () => {
    navigation.navigate("Register");
  };

  const handlePress = () => {
    navigation.goBack();
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
              <Text style={styles.title}>Connexion</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  autoCapitalize="none"
                  value={email}
                  placeholder="Email"
                  onChangeText={handleEmailChange}
                  inputMode="email"
                  style={[
                    styles.input,
                    { color: isEmailValid ? "black" : "grey" },
                  ]}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    autoCapitalize="none"
                    value={password}
                    placeholder="Mot de passe"
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry={!isPasswordVisible}
                    style={styles.passwordInput}
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

              <View style={styles.buttonContainer}>
                <Pressable
                  onPress={handleSubmitSignIn}
                  style={({ pressed }) => [
                    styles.button,
                    {
                      backgroundColor: pressed ? "#F2A65A" : "#F2A65A",
                      opacity: pressed ? 0.5 : 1,
                    },
                  ]}
                >
                  <Text style={styles.buttonText}>Se connecter</Text>
                </Pressable>
              </View>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Pas encore de compte ?</Text>
                <Pressable
                  onPress={handleNavigateToRegister}
                  style={({ pressed }) => [
                    styles.registerButton,
                    {
                      backgroundColor: pressed ? "#F2A65A" : "#F2A65A",
                      opacity: pressed ? 0.5 : 1,
                    },
                  ]}
                >
                  <Text style={styles.registerButtonText}>S'inscrire</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    textAlign: "center",
    fontSize: 40,
    paddingRight: "10%",
    paddingLeft: "10%",
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    margin: 30, // Marge autour du conteneur
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    paddingTop: "50%",
    paddingBottom: "10%",
  },
  inputContainer: {
    width: "100%",
    maxWidth: 500,
    marginTop: 20,
  },
  input: {
    backgroundColor: "#F2F4F5",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: "#000",
    marginBottom: 20,
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
  eyeIconContainer: {
    padding: 10,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 30,
  },
  button: {
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
  or: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: "25%",
  },
  registerContainer: {
    marginTop: 20,
    flexDirection: "columns",
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    fontWeight: "bold",
    padding: 10,
  },
  registerButton: {
    backgroundColor: "#F2A65A",
    borderRadius: 15,
    marginTop: "10%",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
export default LoginScreen;
