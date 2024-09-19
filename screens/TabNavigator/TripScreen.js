//React Native
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteActivity,
  selectActivity,
  selectDay,
  initTrips,
} from "../../reducers/users";

//Lucide Icons
import {
  UserPlus,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  PlusCircle,
  Trash2,
  Copy,
  SquarePen,
  MapPin,
  CalendarClock,
  UsersRound,
  Clock,
} from "lucide-react-native";

//Moment
import moment from "moment";
import "moment/locale/fr";
import { useEffect, useState } from "react";
moment.locale("fr");

//Invite Modal Clipboard/Popover
import * as Clipboard from "expo-clipboard";
import Popover, { PopoverPlacement } from "react-native-popover-view";
import { Calendar } from "react-native-calendars";

import * as ImagePicker from "expo-image-picker";
import NetInfo from "@react-native-community/netinfo";

export default function TripScreen({ navigation, route }) {
  const [activityPresent, setActivityPresent] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [activityForDay, setActivityForDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalInviteVisible, setModalInviteVisible] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
  const [tripTimestamps, setTripTimestamps] = useState([]);
  const [loadingUploadImage, setLoadingUploadImage] = useState(false);
  const [isConnected, setIsConnected] = useState(null);

  const selectedTrip = useSelector((state) => state.user.value.selectedTripId);
  const tripsTable = useSelector((state) => state.user.value.trips);
  const user = useSelector((state) => state.user.value.user);
  const dispatch = useDispatch();

  const tripData = tripsTable.filter((e) => e._id === selectedTrip);

  const allActivitiesForTrip = tripData[0].activities;

  let tripDuration;

  //Safeguard to check if there is data inside the Trip
  if (!tripData || tripData.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No trip data found</Text>
      </View>
    );
  }
  //Variables for dates
  const startDate = moment(tripData[0].start_at);
  const endDate = moment(tripData[0].end_at);
  tripDuration =
    Math.ceil((moment(endDate) - moment(startDate)) / (1000 * 60 * 60 * 24)) +
    1;

  //Function to Display Activities
  const displayActivityByDay = () => {
    //Find the timestamp of each day within the trip
    const tempArray = [];

    for (let i = 0; i < tripDuration; i++) {
      const timeStampOfDay = startDate.clone().add(i, "days").valueOf();
      tempArray.push(timeStampOfDay);
    }
    setTripTimestamps(tempArray);

    //Group the activities based on their plannedAT
    const groupedData = allActivitiesForTrip.reduce((acc, item) => {
      const date = moment(item.plannedAt).format("YYYY-MM-DD");
      acc[date] = acc[date] || [];
      acc[date].push(item);
      return acc;
    }, {});
    setLoading(false);

    //Display the activities based on the selected day
    const date = moment(tempArray[selectedDay - 1]).format("YYYY-MM-DD");
    if (!groupedData || !groupedData[date]) {
      setActivityPresent(false);
      setActivityForDay([]);
    } else {
      setActivityPresent(true);
      setActivityForDay(groupedData[date]);
    }
  };

  useEffect(() => {
    displayActivityByDay();
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, [selectedDay, tripsTable]);

  const handleDeleteActivity = (id) => {
    const bodyData = {
      tripId: tripData[0]._id,
      activityId: id,
      token: user.token,
    };
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/trips/deleteActivity/`;
    fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(deleteActivity(id));
        }
      });
  };

  const handleSelectActivity = (id) => {
    const foundActivity = tripData[0].activities.find(
      (activity) => activity._id === id
    );

    dispatch(selectActivity({ activityId: id, content: foundActivity }));
    dispatch(
      selectDay({ day: selectedDay, date: tripTimestamps[selectedDay - 1] })
    );
    navigation.navigate("ShowActivity");
  };

  let activities = [];
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (activityForDay) {
    const sortedArray = activityForDay.sort((a, b) => {
      return new Date(a.plannedAt).getTime() - new Date(b.plannedAt).getTime();
    });
    activities = sortedArray.map((data, i) => {
      const notes = data.notes.map((note, i) => {
        return (
          <Text key={i} className="text-slate-600">
            • {note} {"\n"}
          </Text>
        );
      });

      return (
        <View key={i} className="">
          <Pressable onPress={() => handleSelectActivity(data._id)}>
            <View
              className="flex-row items-center justify-between mb-1 mt-2 bg-slate-200/30 rounded-xl p-2"
              style={{ width: "100%" }}
            >
              <View title="Activity-content" className="justify-around">
                <Text className="font-bold text-xl">{data.title}</Text>

                <View className="flex flex-row">
                  <View className=" flex flex-row items-center justify-center">
                    <Clock size={15} color="#000" />
                    <Text className="ml-2 text-base">
                      {moment(data.plannedAt).format("HH:mm")}
                    </Text>
                  </View>
                  <Text className="ml-1 mr-1 flex items-center justify-center text-base">
                    -
                  </Text>
                  <View className=" flex flex-row items-center justify-center">
                    <MapPin size={15} color="#000" />
                    <Text className="ml-2 text-base">{data.address}</Text>
                  </View>
                </View>

                <Text>
                  Notes : {"\n"}
                  {notes}
                </Text>
              </View>
              {isConnected ? (
                <Pressable
                  onPress={() => handleDeleteActivity(data._id)}
                  className="bg-orange-100 p-3 rounded-full absolute -top-2 right-0"
                  disabled={!isConnected}
                >
                  <Trash2 size={20} color={"black"} />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => handleDeleteActivity(data._id)}
                  className="p-3 rounded-full absolute -top-2 right-0"
                  disabled={!isConnected}
                  style={{ backgroundColor: "#BABABA" }}
                >
                  <Trash2 size={20} color={"#595959"} />
                </Pressable>
              )}
            </View>
          </Pressable>
        </View>
      );
    });
  }

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(tripData[0].invitation_link);
  };

  const showPopover = () => {
    setPopoverVisible(true);
    setTimeout(() => {
      setPopoverVisible(false);
    }, 800);
  };
  const closePopover = () => {
    setPopoverVisible(false);
  };

  const INITIAL_DATE = moment(tripData[0].start_at).format("YYYY-MM-DD");

  const handleDayPress = (day) => {
    const index = tripTimestamps.findIndex(
      (element) => element === day.timestamp
    );
    setSelectedDay(index + 1);
    setModalCalendarVisible(false);
  };

  const handleAddActivity = () => {
    dispatch(
      selectDay({ day: selectedDay, date: tripTimestamps[selectedDay - 1] })
    );

    navigation.navigate("AddActivity");
  };

  const handleUploadImage = async (urlTrip) => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/trips/updateImage/`;
    fetch(url, {
      method: "PUT",
      body: JSON.stringify({
        background_url: urlTrip,
        tripId: tripData[0]._id,
        token: user.token,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(initTrips(data.data));
        }
        setLoadingUploadImage(false);
      });
  };

  const handleSelectImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted === false) {
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.canceled === true) {
      return;
    }

    const formData = new FormData();

    formData.append("photoFromFront", {
      uri: pickerResult.assets[0].uri,
      name: pickerResult.assets[0].fileName,
      type: pickerResult.assets[0].mimeType,
    });

    //Insert the fetch to backend
    setLoadingUploadImage(true);
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/trips/uploadImage/`;
    fetch(url, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((response) => response.json())
      .then((data) => {
        handleUploadImage(data.url);
      });
  };

  return (
    <View className="bg-white flex-1 h-screen">
      <Modal
        title="Invite Modal"
        visible={modalInviteVisible}
        animationType="fade"
        transparent
        className="rounded-xl shadow-2xl"
      >
        <View className="flex-1 justify-center items-center">
          <TouchableWithoutFeedback
            onPress={() => setModalInviteVisible(!modalInviteVisible)}
          >
            <View
              title="Background opaque"
              className="bg-gray-700 absolute top-0 left-0 w-full h-full opacity-50"
            ></View>
          </TouchableWithoutFeedback>

          <View
            title="Centered view"
            className="bg-white w-5/6 h-2/6 pt-20 items-center rounded-xl shadow-2xl"
          >
            <Text className="text-center pr-4 pl-4 text-gray-900 text-base">
              Copiez ce lien, et envoyez le à vos proches pour qu'ils rejoignent
              votre voyage !
            </Text>
            <View className="flex-col items-center justify-center mt-6">
              <Popover
                isVisible={popoverVisible}
                placement={PopoverPlacement.TOP}
                onRequestClose={closePopover}
                from={
                  <Pressable
                    onPress={() => {
                      copyToClipboard();
                      showPopover();
                    }}
                    className="flex-row items-center border-2 border-slate-600 p-2 rounded-xl"
                  >
                    <Text
                      className="font-bold  items-center  text-orange-400 text-3xl"
                      selectable={true}
                    >
                      {tripData[0].invitation_link}
                    </Text>
                    <Copy size={30} color={"rgb(71 85 105)"} className="ml-2" />
                  </Pressable>
                }
                animationConfig={{ duration: 800, timing: "linear" }}
              >
                <Text className="text-slate-900 p-2">Lien copié !</Text>
              </Popover>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        title="Calendar"
        visible={modalCalendarVisible}
        animationType="fade"
        transparent
      >
        <View className="flex-1 justify-center items-center">
          <TouchableWithoutFeedback
            onPress={() => setModalCalendarVisible(!modalCalendarVisible)}
          >
            <View
              title="Background opaque"
              className="bg-slate-400 absolute top-0 left-0 w-full h-full opacity-50"
            ></View>
          </TouchableWithoutFeedback>

          <View
            title="Centered view"
            className="bg-white w-5/6 h-3/6 items-center justify-center"
          >
            <Calendar
              enableSwipeMonths
              current={INITIAL_DATE}
              minDate={INITIAL_DATE}
              maxDate={moment(tripData[0].end_at).format("YYYY-MM-DD")}
              disableAllTouchEventsForDisabledDays
              onDayPress={handleDayPress}
            />
          </View>
        </View>
      </Modal>
      {loadingUploadImage ? (
        <View title="loading" className="items-center">
          <Text>Chargement de l'image...</Text>
        </View>
      ) : (
        <View title="image-view" className="items-center h-[30%]">
          <Image
            source={
              tripData[0].background_url
                ? { uri: tripData[0].background_url }
                : require("../../assets/bg-1.png")
            }
            style={{ width: "100%" }}
            className="h-full"
          />
          {isConnected ? (
            <Pressable
              className="bg-white/0 p-2 rounded-full mt-5"
              style={{ position: "absolute", right: "5%" }}
              onPress={handleSelectImage}
              disabled={!isConnected}
            >
              <Text className="text-white">
                <SquarePen className="text-sm" color="#F2A65A" />
              </Text>
            </Pressable>
          ) : (
            <Pressable
              className="p-2 rounded-full mt-5"
              style={{
                position: "absolute",
                right: "5%",
                backgroundColor: "#BABABA",
              }}
              onPress={handleSelectImage}
              disabled={!isConnected}
            >
              <Text className="text-white">
                <SquarePen className="text-sm" color="#595959" />
              </Text>
            </Pressable>
          )}
        </View>
      )}
      <View className="flex-row justify-between pt-4 rounded-t-3xl  px-5">
        <Text className="text-3xl font-bold">{tripData[0].title}</Text>
        <Pressable
          className=" bg-[#F2A65A] text-white p-2 rounded-lg flex-row justify-center items-center"
          onPress={() => setModalInviteVisible(true)}
        >
          <UserPlus
            size={15}
            color={"white"}
            className="mr-4 "
            fill={"white"}
          />
          <Text className="text-white font-medium">Inviter</Text>
        </Pressable>
      </View>
      <View className="px-5 mt-2">
        <Text className="text-lg text-gray-600">
          <MapPin size={15} className="text-base" color="rgb(75 85 99)" />{" "}
          {tripData[0].country}
        </Text>
      </View>
      <View className="px-5 mt-3 flex-row">
        <View className="flex flex-row w-1/4 justify-center p-2 rounded-full items-center bg-orange-300/40  ">
          <CalendarClock size={18} color="#000" />
          <Text className="ml-2">{tripTimestamps.length} jours</Text>
        </View>
        <View className="flex flex-row w-1/4 justify-center p-2 rounded-full items-center bg-blue-300/30 ml-4 ">
          <UsersRound size={18} color="#000" />
          <Text className="ml-2">{tripData[0].shareWith.length + 1}</Text>
        </View>
      </View>
      <View title="calendar" className="items-center mt-3 px-5 ">
        <View
          title="calendar-view"
          className="border-slate-100 border-0 mt-2 drop-shadow-xl shadow-black rounded-b-3xl"
          style={{ width: "100%", height: 300 }}
        >
          <View
            title="calendar-bar"
            className="flex-row bg-slate-300/70 w-full h-10 p-2 mb-2 items-center rounded-lg justify-around"
          >
            <View title="calender-left " className="mr-8">
              {selectedDay > 1 ? (
                <>
                  <Pressable
                    title="arrow-left"
                    className=" flex-row items-center"
                    onPress={() => setSelectedDay(selectedDay - 1)}
                  >
                    <ArrowLeft size={25} color={"black"} className="mr-2" />
                    <Text>Jour {selectedDay - 1}</Text>
                  </Pressable>
                </>
              ) : (
                <View style={{ width: 76 }}></View>
              )}
            </View>
            <View
              title="calendar-center"
              className="flex-row items-center bg-white h-8 pr-2 pl-2 border-slate-100 border-2 rounded-md mr-8"
            >
              <Pressable
                onPress={() => setModalCalendarVisible(true)}
                className="flex-row items-center"
              >
                <View title="selected-day" className="flex-row items-center">
                  <Text className="mr-2">Jour {selectedDay}</Text>
                  <CalendarDays size={25} color={"black"} />
                </View>
              </Pressable>
            </View>
            <View title="calendar-right">
              {selectedDay < tripDuration ? (
                <>
                  <Pressable
                    onPress={() => setSelectedDay(selectedDay + 1)}
                    className="flex-row items-center"
                  >
                    <Text className="mr-2">Jour {selectedDay + 1}</Text>
                    <ArrowRight size={25} color={"black"} />
                  </Pressable>
                </>
              ) : (
                <></>
              )}
            </View>
          </View>
          <ScrollView title="activity-container" style={{ height: 500 }}>
            {activities}
            <View title="activity-absent" className=" items-center">
              {isConnected ? (
                <Pressable
                  onPress={() => handleAddActivity()}
                  disabled={!isConnected}
                >
                  <PlusCircle size={70} color={"#F2A65A"} />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => handleAddActivity()}
                  disabled={!isConnected}
                >
                  <PlusCircle size={70} color={"#BABABA"} />
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
