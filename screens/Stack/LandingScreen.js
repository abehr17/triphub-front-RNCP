import React, { useState} from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Plane } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Animatable from "react-native-animatable";
import { Video } from "expo-av";
import { Bar } from "react-native-progress";
import { useSelector } from "react-redux";

export default function LandingScreen() {
  const logo = require("../../assets/triphublogofinal.png");
  const [buttonText, setButtonText] = useState("Commencer l'aventure !");
  const [buttonColor, setButtonColor] = useState("#fff");
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [planePosition, setPlanePosition] = useState(0);
  const navigation = useNavigation();
  const token = useSelector((state) => state.user.value.user.token)

  //Navigation vers login
  function handleNavigateToLogin() {
    if(token) {
      navigation.navigate('Home')
    }
    else {
      navigation.navigate("Login");
    }
  }

  // au clic, changement d'état du bouton
  const handlePress = () => {
    setShowProgressBar(true);
    setButtonText("L'aventure commence !");
    setButtonColor("#EEC170");
    animateProgress();
    setTimeout(() => {
      handleNavigateToLogin();
    }, 3000);
    setTimeout(() => {
      setButtonText("Commencer l'aventure !");
      setButtonColor("#FFF");
      setShowProgressBar(false);
    }, 4000);
  };

  // permet au bouton d'être animé
  const glowAnimation = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.1, { duration: 900, easing: Easing.linear }),
            withTiming(1.2, { duration: 900, easing: Easing.linear }),
            withTiming(1, { duration: 1800, easing: Easing.linear })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  const planeAnimation = useAnimatedStyle(() => ({
    transform: [{ translateX: planePosition }],
  }));

  const animateProgress = () => {
    setProgress(0); // Réinitialiser la progression
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 0.01; // Augmenter la progression
      setProgress(progressValue);
      setPlanePosition(progressValue * 300); // Mettre à jour la position de l'avion en fonction de la progression
      if (progressValue >= 1) {
        clearInterval(interval);
      }
    }, 10); // Intervalle de mise à jour de la progression
  };

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <Video
          source={require("../../assets/paysage.mp4")}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          isLooping
          rate={0.9}
          shouldPlay
        />
      </View>
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Animatable.Image
            animation="fadeIn"
            duration={1000}
            delay={500}
            style={styles.logo}
            source={logo}
          />
          {/* <Animatable.Text
    animation="fadeIn"
    duration={1000}
    delay={1000}
    style={[styles.title]} // Appliquer la police
  >
    TripHub
  </Animatable.Text> */}

          {showProgressBar && (
            <View style={styles.progressBar}>
              <Bar
                progress={progress}
                width={300}
                color="#EEC170"
                unfilledColor="transparent"
              />
              <View
                style={[StyleSheet.absoluteFill, styles.progressBarOutline]}
              />
              {/* Icône de l'avion */}
              <Animated.View style={[styles.planeIcon, planeAnimation]}>
                <Plane size={24} color="#FFF" />
              </Animated.View>
            </View>
          )}
        </View>

        <Text style={styles.textLeft}>Explorez le monde</Text>
        <Text style={styles.textRight}>avec Triphub à vos côtés.</Text>
      </View>

      <Animated.View
        animation="fadeIn"
        duration={1000}
        style={[styles.button, styles.glowContainer, glowAnimation]}
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.5 : 1, backgroundColor: buttonColor },
          ]}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    position: "relative",
    backgroundColor: "#fff",
  },
  background: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "110%",
    zIndex: -2,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    opacity: 0.9,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 165, 0, 0.2)", // Orange avec +50% d'opacité
  },
  content: {
    flex: 1,
    padding: "7%",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 270,
    height: 270,
    resizeMode: "contain",
  },
  text: {
    fontWeight: "bold",
    fontSize: 25,
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: 400,
    top: "20%",
  },
  title: {
    fontSize: 55,
    fontWeight: "bold",
    color: "#FF8E34",
    marginTop: -65,
    marginRight: -15,
    textShadowColor: "rgba(125, 69, 0, 0.8)", // Couleur de l'ombre
    textShadowOffset: { width: 3, height: 3 }, // Décalage de l'ombre
    textShadowRadius: 1, // Rayon de l'ombre
  },
  textLeft: {
    color: "#fff",
    textShadowColor: "rgba(125, 69, 0, 0.8)",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
    fontWeight: "bold",
    fontSize: 22,
    textAlign: "left",
    position: "absolute",
    margin: 10,
    bottom: "50%",
    width: "auto",
    left: 0,
  },
  textRight: {
    color: "#fff",
    textShadowColor: "rgba(125, 69, 0, 0.8)",
    textShadowOffset: { width: 4, height: 3 },
    textShadowRadius: 1,
    fontWeight: "bold",
    fontSize: 22,
    margin: 10,
    textAlign: "right",
    position: "absolute",
    bottom: "45%",
    width: "150%",
    right: 0,
  },
  button: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    bottom: "33%",
    width: "auto",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
  glowContainer: {
    borderRadius: 20,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  progressBar: {
    top: "140%",
    margin: "5%",
    color: "#585123",
    borderColor: "black",
  },
  progressBarOutline: {
    borderWidth: 1, // Largeur de la bordure
    borderColor: "#585123", // Couleur de la bordure
    borderRadius: 5, // Rayon des coins pour arrondir la bordure
  },
  planeIcon: {
    position: "absolute",
    top: 10,
    left: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    height: 24,
  },
});
