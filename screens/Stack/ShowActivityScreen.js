import { SafeAreaView, ScrollView, View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as Notifications from "expo-notifications";
import moment from "moment";
import "moment/locale/fr";
moment.locale("fr");
import { SquarePen, MapPin } from "lucide-react-native";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { selectDay } from "../../reducers/users";

export default function ShowActivityScreen({ navigation }) {
  const activity = useSelector((state) => state.user.value.selectedActivity);
  const selectedDay = useSelector((state) => state.user.value.selectedDay.day);
  const selectedDate = useSelector(
    (state) => state.user.value.selectedDay.date
  );

  const [isConnected, setIsConnected] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const addNotification = async (minBeforeActivity) => {
    const notificationTime = moment(activity.content.plannedAt).subtract(
      minBeforeActivity,
      "minutes"
    );

    if (moment().isAfter(notificationTime)) {
      alert("L'heure de l'activité est déjà passée");
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to send notifications denied");
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Rappel",
        body: `Rappel pour l'activité ${activity.content.title} à ${moment(
          activity.content.plannedAt
        ).format("LT")}`,
      },
      trigger: notificationTime.toDate(),
    });
  };

  const notes = activity.content.notes.map((note, index) => (
    <View
      key={index}
      style={{
        backgroundColor: "#F7F7F7",
        padding: 10,
        borderRadius: 15,
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
    >
      <Text style={{ fontStyle: "italic", fontSize: 15 }}>• {note}</Text>
    </View>
  ));

  const handleEditActivity = () => {
    dispatch(selectDay({ day: selectedDay, date: selectedDate }));
    navigation.navigate("EditActivity");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F4F5" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 10,
          alignItems: "center",
          paddingTop: 30,
        }}
      >
        <View
          style={{
            width: "90%",
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          {isConnected ? (
            <Pressable
              onPress={handleEditActivity}
              disabled={!isConnected}
              style={{
                alignSelf: "flex-end",
                padding: 10,
                borderRadius: 25,
                backgroundColor: isConnected ? "#F2A65A" : "#BABABA",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <SquarePen
                size={20}
                color={isConnected ? "#FFF" : "#595959"}
                strokeWidth={3}
              />
            </Pressable>
          ) : (
            <Pressable
              className="absolute top-4 right-4 p-2 rounded-full bg-[#BABABA]"
              onPress={() => handleEditActivity()}
              disabled={!isConnected}
            >
              <SquarePen size={20} color="#595959" strokeWidth={3} />
            </Pressable>
          )}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 24,
            }}
          >
            Votre Aventure
          </Text>
          <Text
            style={{
              fontSize: 40,
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            {activity.content.title}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <MapPin size={30} color="#000" />
            <Text style={{ fontSize: 20, marginLeft: 8 }}>
              {activity.content.address}
            </Text>
          </View>
          {activity.content.notes.length > 0 ? (
            <View
              style={{
                paddingHorizontal: 10,
                marginTop: 16,

                padding: 15,
                borderRadius: 15,
              }}
            >
              {notes}
            </View>
          ) : (
            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
                marginTop: 20,
                fontStyle: "italic",
              }}
            >
              Aucune note pour cette aventure.
            </Text>
          )}
          <View
            style={{
              marginTop: 20,
              backgroundColor: "#F7F7F7",
              borderRadius: 15,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <Text style={{ marginBottom: 16, fontWeight: "bold" }}>
              Ajouter un rappel pour l'aventure :
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <Pressable
                onPress={() => addNotification(5)}
                style={{
                  backgroundColor: "#F58549",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "500" }}>5 min</Text>
              </Pressable>
              <Pressable
                onPress={() => addNotification(30)}
                style={{
                  backgroundColor: "#F58549",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "500" }}>30 min</Text>
              </Pressable>
              <Pressable
                onPress={() => addNotification(60)}
                style={{
                  backgroundColor: "#F58549",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "500" }}>1 h</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
