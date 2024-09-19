import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
} from "react-native";
import { Trash2, Clock, PlaneTakeoff, BedDouble } from "lucide-react-native";
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useDispatch, useSelector } from "react-redux";
import { initTrips, selectTrip } from "../../reducers/users";
import moment from "moment";
import "moment/locale/fr";
moment.locale("fr");

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();

  const [modalInviteVisible, setModalInviteVisible] = useState(false);
  const [modalLogoutVisible, setModalLogoutVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(null);
  const [tempSelectedTrip, setTempSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.user.value);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    if (isConnected) {
      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/trips/getTrips/${user.user.token}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          dispatch(initTrips(data.data));
          setLoading(false);
        });
    }
    return () => unsubscribe();
  }, [isConnected]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const handleSelectTrip = (id) => {
    dispatch(selectTrip({ tripId: id }));
    navigation.navigate("TabNavigator");
  };

  const handleShowDeleteTrip = (tripId) => {
    setModalDeleteVisible(true);
  };

  const handleDeleteTrip = (tripId) => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/trips/delete/`;
    const bodyData = {
      tripId,
      token: user.user.token,
    };
    fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          Alert.alert("Erreur", data.error);
        } else {
          console.log("res data delete:", data.data.trips);
          dispatch(initTrips(data.data.trips));
        }

        setModalDeleteVisible(false);
      });
  };

  const trips = user.trips.map((data, i) => {
    const startDate = moment(data.start_at);
    const endDate = moment(data.end_at);

    return (
      <Pressable
        key={i}
        title="Trip"
        className="mb-6 w-full h-56 items-between rounded-2xl"
        onPress={() => handleSelectTrip(data._id)}
      >
        <Image
          source={
            data.background_url
              ? { uri: data.background_url }
              : require("../../assets/viet.png")
          }
          style={{ width: "100%", height: "100%" }}
          className="rounded-2xl "
        />
        <View className="absolute top-3 right-3">
          {isConnected ? (
            <Pressable
              title="Delete BTN"
              onPress={() => {
                handleShowDeleteTrip();
                setTempSelectedTrip(data._id);
              }}
              className="bg-[#F2A65A] p-2 rounded-full"
              disabled={!isConnected}
            >
              <View className="flex-row justify-center items-center">
                <Trash2 size={20} color={"white"} strokeWidth={3} />
              </View>
            </Pressable>
          ) : (
            <Pressable
              title="Delete BTN"
              onPress={() => {
                handleShowDeleteTrip();
                setTempSelectedTrip(data._id);
              }}
              className="bg-[#BABABA] p-2 rounded-full"
              disabled={!isConnected}
            >
              <View className="flex-row justify-center items-center">
                <Trash2 size={20} color={"#595959"} strokeWidth={3} />
              </View>
            </Pressable>
          )}
        </View>
        <View className="absolute bottom-2 left-2">
          <Text className="text-white font-bold text-3xl">{data.title}</Text>
          <View className="flex-row justify-start items-center">
            <PlaneTakeoff size={20} color={"white"} />
            <Text className="text-white font-bold text-base ml-1">
              {startDate.calendar()}
            </Text>
          </View>
          <View className="flex-row justify-start items-center">
            <Clock size={20} color={"white"} />
            <Text className="text-white font-bold text-base ml-1">
              {Math.ceil(
                (moment(endDate) - moment(startDate)) / (1000 * 60 * 60 * 24)
              ) + 1}{" "}
              jours
            </Text>
          </View>
          <View className="flex-row justify-start items-center">
            <BedDouble size={20} color={"white"} />
            <Text className="text-white font-bold text-base ml-1">
              {startDate.fromNow()}
            </Text>
          </View>
        </View>
        {/* <View title="Trip Content" className="flex-row mt-2 justify-center">
          <View title="Trip Infos">
            <Text
              title="Trip Title"
              className="text-lg font-bold"
              style={i % 2 === 0 ? { color: "white" } : { color: "black" }}
            >
              {data.title}
            </Text>
            <Text
              title="Start Date"
              style={i % 2 === 0 ? { color: "white" } : { color: "black" }}
            >
              {startDate.calendar()}
            </Text>
            <Text
              title="Trip length"
              style={i % 2 === 0 ? { color: "white" } : { color: "black" }}
            >
              {Math.ceil(
                (moment(endDate) - moment(startDate)) / (1000 * 60 * 60 * 24)
              ) + 1}{" "}
              jours
            </Text>
            <Text
              title="Departure In"
              className="text-xs"
              style={i % 2 === 0 ? { color: "white" } : { color: "black" }}
            >
              Départ {startDate.fromNow()}
            </Text>
          </View>
        </View> */}
      </Pressable>
    );
  });
  const handleJoinTrip = (link) => {
    if (!link) {
      setAlertMessage("Veuillez remplir le champ");
      setAlertVisible(true);
    } else {
      //lancer un fetch pour rejoindre le trip et vérifier que le lien est valide
      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/trips/join/${link}`;
      fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: user.user.token }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            Alert.alert("Erreur", data.error);
          } else {
            console.log("res data:", data);
            dispatch(initTrips(data.data));
          }
          setModalInviteVisible(false);
        });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Modal
        title="Invite Modal"
        visible={modalInviteVisible}
        animationType="fade"
        transparent
      >
        <View className="flex-1 justify-center items-center">
          <TouchableWithoutFeedback
            onPress={() => setModalInviteVisible(!modalInviteVisible)}
          >
            <View
              title="Background opaque"
              className="bg-slate-400 absolute top-0 left-0 w-full h-full opacity-50"
            ></View>
          </TouchableWithoutFeedback>

          <View
            title="Centered view"
            className="bg-white w-5/6 h-2/6 pt-20 items-center rounded-lg"
          >
            <TextInput
              placeholder="Code invitation"
              className="border-2 border-slate-300 rounded-md p-2 w-2/3 "
              onChangeText={setInvitationLink}
              value={invitationLink}
            ></TextInput>
            {isAlertVisible && (
              <Text className="text-red-700">{alertMessage}</Text>
            )}
            <Pressable
              title="Join"
              className="bg-[#F2A65A] w-2/3 items-center justify-center rounded-lg p-1 mb-3 mt-4"
              onPress={() => handleJoinTrip(invitationLink)}
            >
              <Text className="text-white text-lg font-bold">Rejoindre</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        title="Logout Modal"
        visible={modalLogoutVisible}
        animationType="fade"
        transparent
      >
        <View className="flex-1 justify-center items-center">
          <TouchableWithoutFeedback
            onPress={() => setModalInviteVisible(!modalInviteVisible)}
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
              onPress={() => navigation.navigate("Landing")}
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

      <Modal
        title="Delete Trip Modal"
        visible={modalDeleteVisible}
        animationType="fade"
        transparent
      >
        <View className="flex-1 justify-center items-center">
          <TouchableWithoutFeedback
            onPress={() => setModalDeleteVisible(!modalDeleteVisible)}
          >
            <View
              title="Background opaque"
              className="bg-slate-400 absolute top-0 left-0 w-full h-full opacity-50"
            ></View>
          </TouchableWithoutFeedback>

          <View
            title="Centered view"
            className="bg-white w-5/6 h-1/5 pt-6 items-center rounded-lg justify-center"
          >
            <Text className="text-xl mb-3 text-center">
              Êtes-vous sûr(e) de vouloir supprimer ce Voyage ?
            </Text>
            <View className="flex-row items-center">
              <Pressable
                className="bg-[#F2A65A]  w-1/3 p-2 items-center justify-center rounded-lg mr-1 mb-3"
                onPress={() => handleDeleteTrip(tempSelectedTrip)}
              >
                <Text className="text-white text-lg font-bold">Oui</Text>
              </Pressable>
              <Pressable
                className="bg-[#d1d1d0]  p-2 w-1/3 items-center justify-center rounded-lg ml-1 mb-3"
                onPress={() => setModalDeleteVisible(false)}
              >
                <Text className="text-white text-lg font-bold">Non</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Text className="text-3xl font-bold text-center mt-4">
        Bonjour {user.user.username}
      </Text>
      <View className="flex-row justify-around mt-4 px-5">
        <Pressable
          title="NewTrip"
          className="bg-[#F2A65A] items-center justify-center rounded-lg p-2"
          onPress={() => navigation.navigate("CreateTrip")}
          disabled={!isConnected}
          style={{ backgroundColor: isConnected ? "#F2A65A" : "#BABABA" }}
        >
          <Text
            className="text-white text-lg font-bold"
            style={{ color: isConnected ? "white" : "#595959" }}
          >
            Créer un voyage
          </Text>
        </Pressable>
        <Pressable
          title="JoinTrip"
          className="bg-[#242424] items-center justify-center  rounded-lg  p-2 "
          onPress={() => setModalInviteVisible(true)}
          disabled={!isConnected}
          style={{ backgroundColor: isConnected ? "#F0F3F4" : "#BABABA" }}
        >
          <Text
            className="text-lg font-medium"
            style={{ color: isConnected ? "#242424" : "#595959" }}
          >
            Rejoindre un voyage
          </Text>
        </Pressable>
      </View>
      <ScrollView className="mt-8 px-5">{trips}</ScrollView>
    </View>
  );
}
