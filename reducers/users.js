import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    user: {},
    documents: [],
    trips: [],
    selectedTripId: null,
    selectedActivity: null,
    selectedDay: null,
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.value.user = action.payload;
    },
    logout: (state) => {
      state.value.user = {};
    },
    initTrips: (state, action) => {
      state.value.trips = action.payload;
    },
    selectTrip: (state, action) => {
      state.value.selectedTripId = action.payload.tripId;
    },
    selectActivity: (state, action) => {
      state.value.selectedActivity = action.payload.activityId;
      state.value.selectedActivity = action.payload;
    },
    selectDay: (state, action) => {
      state.value.selectedDay = action.payload;
    },
    addTrip: (state, action) => {
      state.value.trips.push(action.payload);
    },
    initDocuments: (state, action) => {
      state.value.documents = action.payload;
    },
    deleteActivity: (state, action) => {
      state.value.trips = state.value.trips.map((trip) => {
        trip.activities = trip.activities.filter(
          (activity) => activity._id !== action.payload
        );
        return trip;
      });
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  login,
  addTrip,
  initTrips,
  selectTrip,
  logout,
  initDocuments,
  deleteActivity,
  selectActivity,
  selectDay,
} = userSlice.actions;

export default userSlice.reducer;
