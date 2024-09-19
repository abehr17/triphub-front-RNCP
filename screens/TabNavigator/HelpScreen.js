import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  ScrollView,
} from "react-native";
import { ChevronLeft, Phone, Map } from "lucide-react-native";
import { useSelector } from "react-redux";

export default function HelpScreen({ navigation }) {
  const sosInfos = useSelector((state) => state.user.value);
  
  const handlePress = () => {
    navigation.goBack();
  };
  const { trips, selectedTripId} = useSelector((state) => state.user.value);

  const selectedTrip = trips.filter((trip) => trip._id === selectedTripId);
  

  const handleCallPress = () => {
    const emergencyNumber =
      selectedTrip[0].sos_infos.emergency_number;
    Linking.openURL(`tel:${emergencyNumber}`);
  };


  return (
    <ScrollView>
      <View>
          <View style={styles.container}>
          <Text style={styles.title}>Informations Pays</Text>

          {/* Affichage du numéro d'urgence du pays */}

          <View>
            <Text style={styles.nameText}>Numéro d'urgence</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoText}>
                <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 15 }}>{selectedTrip[0].sos_infos.emergency_number}</Text>
                <Pressable onPress={handleCallPress}>
                  <Phone style={styles.icon} />
                </Pressable>
              </View>
            </View>

            {/* Affichage des informations sur l'ambassade */}
            <Text style={styles.nameText}>
          Ambassade
          
        </Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoText}>
                <Text>
                <Text style={{ fontWeight: 'bold', color: 'black' }}>Adresse: </Text>{selectedTrip[0].sos_infos.embassy.address}
                </Text>
              </View>
              <View style={styles.infoText}>
                <Text>
                <Text style={{ fontWeight: 'bold', color: 'black' }}>Téléphone: </Text>{selectedTrip[0].sos_infos.embassy.phone}
                </Text>
              </View>
              <View style={styles.infoText}>
                <Text><Text style={{ fontWeight: 'bold', color: 'black' }}>Email: </Text>{selectedTrip[0].sos_infos.embassy.email}</Text>
              </View>
            </View>
            <View style={styles.mapButtonContainer}>
            <Pressable 
            style={styles.mapButton} 
            onPress={() => navigation.navigate('Map')}>
            <Map size={24} color="white" />
            <Text style={styles.mapButtonText}> Voir sur la carte</Text>
          </Pressable>
          </View>

            {/* Affichage des informations sur le consulat */}
            <Text style={styles.nameText}>Consulat(s)</Text>
            {selectedTrip[0].sos_infos.consulate.map((consulate, index) => (
              <View key={index} style={styles.infoContainer}>
                <View style={styles.infoText}>
                  <Text><Text style={{ fontWeight: 'bold', color: 'black' }}>Adresse: </Text>{consulate.address}</Text>
                </View>
                <View style={styles.infoText}>
                  <Text><Text style={{ fontWeight: 'bold', color: 'black' }}>Téléphone: </Text>{consulate.phone}</Text>
                </View>
                <View style={styles.infoText}>
                  <Text><Text style={{ fontWeight: 'bold', color: 'black' }}>Email: </Text>{consulate.email}</Text>
                </View>
                <View style={styles.infoText}>
                  <Text><Text style={{ fontWeight: 'bold', color: 'black' }}>Numéro: </Text>{consulate.phone}</Text>
                </View>
              </View>
            ))}
            <View style={styles.mapButtonContainer}>
            <Pressable 
            style={styles.mapButton} 
            onPress={() => navigation.navigate('Map')}>
            <Map size={24} color="white" />
            <Text style={styles.mapButtonText}> Voir sur la carte</Text>
          </Pressable>
          </View>

            {/* Affichage des contacts utiles */}
                    <Text style={styles.nameText}>Contacts utiles</Text>
        {/* <View style={styles.infoContainer}> */}
          <View style={styles.infoContainer2}>
            <Text style={{ fontWeight: 'bold', color: 'black' }}>Police : </Text>
            <Text>{selectedTrip[0].sos_infos.police_number}</Text>
            <Pressable onPress={() => Linking.openURL(`tel:${selectedTrip[0].sos_infos.police_number}`)}>
              <Phone style={styles.icon} />
            </Pressable>
          </View>
          <View style={styles.infoContainer2}>
            <Text style={{ fontWeight: 'bold', color: 'black' }}>Urgences : </Text>
            <Text>{selectedTrip[0].sos_infos.emergency_number}</Text>
            <Pressable onPress={() => Linking.openURL(`tel:${selectedTrip[0].sos_infos.emergency_number}`)}>
              <Phone style={styles.icon} />
            </Pressable>
          </View>
          <View style={styles.infoContainer2}>
            <Text style={{ fontWeight: 'bold', color: 'black' }}>Pompiers : </Text>
            <Text>{selectedTrip[0].sos_infos.firefighter_number}</Text>
            <Pressable onPress={() => Linking.openURL(`tel:${selectedTrip[0].sos_infos.firefighter_number}`)}>
              <Phone style={styles.icon} />
            </Pressable>
          </View>
        {/* </View> */}

          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pressableContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    paddingTop: 20,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#EEC170', // Bleu par défaut pour le lien, vous pouvez ajuster selon vos besoins
  },
  pressableContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    paddingTop: 20,
  },
  container: {
    margin: 20,
    backgroundColor: "#F2F4F5"
  },
  arrow: {
    color: "black",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    alignItems: "center",
    textAlign: "center",
  },
  nameText: {
    textAlign: "center",
    fontWeight: "bold",
    paddingLeft: 0,
    marginTop: 40,
    marginBottom: 10,
    fontSize: 20
  },
  icon: {
    fontSize: 24,
    marginLeft: 10,
    color: "green",
  },
  infoContainer: {
    backgroundColor: "#EEC170",
    borderRadius: 15,
    marginVertical: 5,
    padding: 20,
    margin: 10,
    flexWrap: "wrap", // Ajout de flexWrap pour permettre au contenu de passer à la ligne
    flexDirection: "column",
  },
  infoText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 3,
  },
  pressableContainer: {
    backgroundColor: "#EEC170", // Utilisez votre couleur primaire
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20, // Bords arrondis pour un look moderne
    shadowColor: "#000", // Ombre pour iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Élévation pour Android (effet d'ombre)
    alignSelf: 'center', // Centrer le bouton dans le conteneur
    marginTop: 20, // Espacement en haut pour séparer du contenu au-dessus
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white', // Texte blanc pour contraster avec le fond bleu
    fontSize: 16, // Taille de la police adaptée
    textAlign: 'center', // Centrer le texte si le bouton devient plus large
  },
  mapButton: {
    flexDirection: 'column',
    width: "60%",
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEC170', // Adapté à votre palette de couleurs
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginTop: 10,
    marginLeft: 0, // Pour espacer du texte "Ambassade" ou "Consulat(s)"
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  mapButtonText: {
    color: 'white',
    marginLeft: 5, // Espacer l'icône du texte
    fontWeight: 'bold',
  },
  mapButtonContainer: {
    alignItems: 'center'
  },
  contactInfoUtiles: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10
  },
  infoContainer2: {
    backgroundColor: "#EEC170",
    borderRadius: 15,
    marginVertical: 5,
    padding: 20,
    margin: 10,
    flexWrap: "wrap", // Ajout de flexWrap pour permettre au contenu de passer à la ligne
    flexDirection: "column",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    marginVertical: 10
  }
});
