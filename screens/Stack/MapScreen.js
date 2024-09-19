// Import necessary React and React Native components, along with external libraries
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSelector } from 'react-redux';
import * as Location from 'expo-location';

// Define the MapScreen component
export default function MapScreen({ navigation }) {
  const mapRef = useRef(null); // Use useRef to persist the map reference across re-renders
  const { trips, selectedTripId } = useSelector((state) => state.user.value); // Access Redux store for trip data
  const selectedTrip = trips.find((trip) => trip._id === selectedTripId); // Find the selected trip from the list of trips
  const consulates = selectedTrip?.sos_infos?.consulate || []; // Get consulate info from the selected trip, if any
  const [currentPosition, setCurrentPosition] = useState(null); // State to hold the current position

  // Function to request location permission from the user
  async function requestLocationPermission() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }
    getCurrentLocation(); // Call to get the current location if permission is granted
  }

  // Function to get the current location of the device
  async function getCurrentLocation() {
    let location;
    try {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 5000,
      });
      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      fitAllMarkers(); // Adjust the map view to fit all markers
    } catch (error) {
      console.error("getCurrentPositionAsync error:", error);
    }
  }

  // Effect hook to request location permission on component mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Effect hook to adjust the map view whenever the current position or selected trip changes
  useEffect(() => {
    if (currentPosition || selectedTrip) {
      fitAllMarkers();
    }
  }, [currentPosition, selectedTrip]);

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      0.5 - Math.cos(dLat) / 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  // Function to adjust the map view to fit all markers
  const fitAllMarkers = () => {
    const markers = [];

    // Add embassy location to markers array
    if (selectedTrip?.sos_infos?.embassy) {
      markers.push({
        latitude: parseFloat(selectedTrip.sos_infos.embassy.latitude),
        longitude: parseFloat(selectedTrip.sos_infos.embassy.longitude),
      });
    }

    // Add consulate locations to markers array
    consulates.forEach(consulate => {
      if (consulate.latitude && consulate.longitude) {
        markers.push({
          latitude: parseFloat(consulate.latitude),
          longitude: parseFloat(consulate.longitude),
        });
      }
    });

    if (markers.length > 0) {
      if (currentPosition) {
        // Calculate the center of all markers and check the distance to the current position
        const latitudes = markers.map(marker => marker.latitude);
        const longitudes = markers.map(marker => marker.longitude);
        const centerLatitude = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
        const centerLongitude = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
        const distanceToCenter = calculateDistance(currentPosition.latitude, currentPosition.longitude, centerLatitude, centerLongitude);
        
        // Conditionally include the current position in the view based on the distance to the center
        if (distanceToCenter > 10) { // 10 km threshold
          mapRef.current.fitToCoordinates(markers, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        } else {
          markers.push(currentPosition);
          mapRef.current.fitToCoordinates(markers, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      } else {
        mapRef.current.fitToCoordinates(markers, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  };

  // Initial map region, centered on the embassy if available
  const initialRegion = {
    latitude: selectedTrip?.sos_infos?.embassy ? parseFloat(selectedTrip.sos_infos.embassy.latitude) : 0,
    longitude: selectedTrip?.sos_infos?.embassy ? parseFloat(selectedTrip.sos_infos.embassy.longitude) : 0,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  // Function to zoom into a marker
  function zoomToMarker(latitude, longitude) {
    const region = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    mapRef.current.animateToRegion(region, 1000); // Animate to the specified region
  }

  // Render the map and markers
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {/* Render markers for the embassy, consulates, and current location */}
        {selectedTrip?.sos_infos?.embassy && (
          <Marker
            identifier="embassy"
            coordinate={{
              latitude: parseFloat(selectedTrip.sos_infos.embassy.latitude),
              longitude: parseFloat(selectedTrip.sos_infos.embassy.longitude),
            }}
            title={`Ambassade en ${selectedTrip.country}`}
            description={selectedTrip.sos_infos.embassy.address}
            pinColor="red"
          />
        )}
        {consulates.map((consulate, index) => consulate.latitude && consulate.longitude ? (
          <Marker
            key={index}
            identifier={`consulate-${index}`}
            coordinate={{ latitude: parseFloat(consulate.latitude), longitude: parseFloat(consulate.longitude) }}
            title={`Consulat en ${selectedTrip.country}`}
            description={consulate.address}
            pinColor="red"
          />
        ) : null)}
        {currentPosition && (
          <Marker
            identifier="currentLocation"
            coordinate={currentPosition}
            title="Ma position"
            pinColor="blue"
          />
        )}
      </MapView>
      {/* Scrollable list of addresses with touchable highlights to zoom into the marker */}
      <View style={styles.addressOverlay}>
        <ScrollView horizontal={true} style={styles.addressList} showsHorizontalScrollIndicator={false}>
          {selectedTrip?.sos_infos?.embassy && (
            <TouchableOpacity
              style={styles.addressContainer}
              onPress={() => zoomToMarker(parseFloat(selectedTrip.sos_infos.embassy.latitude), parseFloat(selectedTrip.sos_infos.embassy.longitude))}
            >
              <Text style={styles.addressText}>
                Ambassade de France : {selectedTrip.sos_infos.embassy.address}
              </Text>
            </TouchableOpacity>
          )}
          {consulates.map((consulate, index) => (
            <TouchableOpacity
              key={index}
              style={styles.addressContainer}
              onPress={() => zoomToMarker(parseFloat(consulate.latitude), parseFloat(consulate.longitude))}
            >
              <Text style={styles.addressText}>
                {consulate.address}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  addressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
  },
  addressList: {
    height: 150,
  },
  addressContainer: {
    alignItems: 'center',
    backgroundColor: '#EEC170',
    justifyContent: 'center',
    marginHorizontal: 20,
    borderRadius: 20, // Rounded corners for a modern look
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 15, // Elevation for Android (shadow effect)
  },
  addressText: {
    fontSize: 16,
    textAlign: "center",
    color: 'black',
    marginHorizontal: 10,
    flexWrap: 'wrap', 
    width: 300, // Fixed width to ensure uniformity and wrapping
  },
});
