// Importation des composants nécessaires depuis React et React Native
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
  FlatList,
  Modal,
} from "react-native";
import { ChevronLeft, ChevronDown } from "lucide-react-native"; // Icône pour revenir en arrière
import { useNavigation } from "@react-navigation/native"; // Navigation
import { Calendar, LocaleConfig } from "react-native-calendars"; // Calendrier
import countriesData from "../../pays.json"; // Données des pays
import { Alert } from "react-native"; // Ajouter en haut du fichier
import { useDispatch, useSelector } from "react-redux";
import { addTrip, initTrips } from "../../reducers/users";

// Configuration locale pour le calendrier en français
LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNamesShort: [
    "Janv.",
    "Févr.",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
  dayNames: [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ],
  dayNamesShort: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
  today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = "fr";

export default function CreateTripScreen() {
  const navigation = useNavigation();
  // État pour le formulaire, les suggestions, le chargement, l'affichage du calendrier et la recherche
  const [formData, setFormData] = useState({
    title: "",
    autocompleteInput: "",
    startDate: "",
    endDate: "",
    isSelecting: true,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    error: null,
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useDispatch();

  const token = useSelector((state) => state.user.value.user.token);

  // Fonction pour créer le voyage
  const createTrip = async () => {
    try {
      setLoadingState({ ...loadingState, isLoading: true });
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/trips/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            country: formData.autocompleteInput,
            start_at: formData.startDate,
            end_at: formData.endDate,
            token: token,
          }),
        }
      );

      const result = await response.json();
      if (response.status === 200) {
        Alert.alert("Succès", "Voyage créé avec succès");

        // Supposons que `result` contient le voyage créé retourné par le serveur
        // Ajustez cette partie selon la structure réelle de votre réponse serveur
        dispatch(initTrips(result.data)); // Utilisez directement l'objet voyage retourné si la structure correspond

        // Naviguer l'utilisateur vers un autre écran si nécessaire
        navigation.navigate("Home");
      } else {
        throw new Error(
          result.message || "Erreur lors de la création du voyage"
        );
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoadingState({ isLoading: false, error: null });
    }
  };

  // Modification de la fonction handleCreateTrip pour utiliser createTrip
  const handleCreateTrip = () => {
    // Vérification des données nécessaires
    if (
      !formData.title ||
      !formData.autocompleteInput ||
      !formData.startDate ||
      !formData.endDate
    ) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires");
      return;
    }
    createTrip();
  };

  // Mise à jour des données du formulaire
  const updateFormData = (key, value) => {
    setFormData((currentFormData) => ({ ...currentFormData, [key]: value }));
  };

  // Mise à jour des suggestions de pays basée sur l'entrée de l'utilisateur
  const updateSuggestions = (text) => {
    updateFormData("autocompleteInput", text);
    setIsSearching(!!text);
    if (!text) {
      setSuggestions([]);
      return;
    }
    // Filtrer les pays basés sur le texte entré
    setSuggestions(
      countriesData.pays.filter((country) =>
        country.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  // Gestion de la sélection des jours dans le calendrier
  const onDayPress = (day) => {
    const { startDate, isSelecting } = formData;
    if (isSelecting || day.dateString < startDate) {
      updateFormData("startDate", day.dateString);
      updateFormData("endDate", "");
      updateFormData("isSelecting", false);
    } else {
      updateFormData("endDate", day.dateString);
      updateFormData("isSelecting", true);
    }
  };

  // Génération des dates marquées pour le calendrier
  const generateMarkedDates = () => {
    const { startDate, endDate } = formData;
    let markedDates = {};
    let currentDate = startDate;
    if (startDate)
      markedDates[startDate] = {
        startingDay: true,
        color: "green",
        textColor: "white",
      };
    while (currentDate < endDate) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      currentDate = nextDate.toISOString().split("T")[0];
      if (currentDate <= endDate) {
        markedDates[currentDate] =
          currentDate === endDate
            ? { endingDay: true, color: "green", textColor: "white" }
            : { color: "green", textColor: "white" };
      }
    }
    return markedDates;
  };

  // Sélection d'un pays dans la liste
  const handleCountrySelect = (item) => {
    updateFormData("autocompleteInput", item);
    setSuggestions([]);
    setIsSearching(false);
    Keyboard.dismiss(); // Ferme le clavier
  };

  // Validation des dates sélectionnées (placeholder, logique à implémenter)
  const handleValidateDates = () => {
    console.log("Dates sélectionnées :", formData.startDate, formData.endDate);
    setShowCalendar(false);
  };

  // Interface utilisateur
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Créer un nouveau voyage</Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) => updateFormData("title", text)}
            placeholder="Ajoute un Titre à ton voyage"
            style={styles.input}
          />
          <TextInput
            value={formData.autocompleteInput}
            onChangeText={updateSuggestions}
            placeholder="Choisis le pays"
            style={styles.inputList}
          />
          {loadingState.isLoading && <Text>Chargement...</Text>}
          {loadingState.error && <Text>Erreur: {loadingState.error}</Text>}
          <FlatList
            data={suggestions}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleCountrySelect(item)}
                style={({ pressed }) => [
                  styles.suggestionItem,
                  pressed && styles.suggestionItemPressed,
                ]}
              >
                <Text style={styles.suggestionItemText}>{item}</Text>
              </Pressable>
            )}
            keyExtractor={(item) => item}
            style={styles.suggestionsList}
          />
          {!isSearching && (
            <Pressable
              style={styles.button}
              onPress={() => setShowCalendar(true)}
            >
              <Text style={styles.buttonText}>Sélectionner les dates</Text>
            </Pressable>
          )}
          {!isSearching && (
            <Pressable
              style={styles.createTripButton}
              onPress={handleCreateTrip}
            >
              <Text style={styles.createTripButtonText}>Créer le voyage</Text>
            </Pressable>
          )}
        </View>
      </TouchableWithoutFeedback>
      <Modal visible={showCalendar} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Sélectionnez vos dates</Text>
          </View>
          <Calendar
            onDayPress={onDayPress}
            markingType={"period"}
            markedDates={generateMarkedDates()}
            enableSwipeMonths={true}
            style={styles.calendarStyle}
          />
          <Pressable
            style={styles.validateButton}
            onPress={handleValidateDates}
          >
            <Text style={styles.validateButtonText}>Valider</Text>
          </Pressable>
          <Pressable
            style={styles.closeButton}
            onPress={() => setShowCalendar(false)}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </Pressable>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  pressable: {
    padding: 20,
    backgroundColor: "#fff",
  },
  arrow: {
    color: "black",
    marginLeft: 10,
    marginTop: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    width: "80%",
    maxWidth: 500,
    marginTop: 20,
  },
  input: {
    backgroundColor: "#F2F4F5",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 40,
    width: "100%",
  },
  inputList: {
    backgroundColor: "#F2F4F5",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 2,
    width: "100%",
  },
  suggestionsList: {
    Height: 400,
  },
  button: {
    backgroundColor: "#F2A65A",
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
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
  suggestionItem: {
    backgroundColor: "#EEC170",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionItemPressed: {
    backgroundColor: "#E2E8F0",
  },
  suggestionItemText: {
    color: "#334155",
    fontSize: 16,
  },
  suggestionsList: {
    maxHeight: 200,
    width: "100%",
  },
  calendarStyle: {
    paddingTop: -20,
    width: 320,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "gray",
    height: 400,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F4F5",
  },
  modalHeader: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderText: {
    color: "#F2A65A",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#F2A65A",
    borderRadius: 15,
    padding: 12,
    width: "60%",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  createTripButton: {
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
  createTripButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  validateButton: {
    backgroundColor: "#F2A65A",
    borderRadius: 15,
    padding: 12,
    width: "60%",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginTop: 20,
  },
  validateButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
