import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LatLngExpression, LatLngTuple } from 'leaflet';
import axios from 'axios';

type InitialState = {
  markers: null | LatLngTuple[];
  highestPoint: null | LatLngExpression;
};

const initialState = {
  markers: null,
  highestPoint: null,
} as InitialState;

export const getHighestPoint = createAsyncThunk('route/getHighestPoint', async route => {
  const response = await axios.post(
    'https://api.open-elevation.com/api/v1/lookup',
    { locations: route.map(location => ({ latitude: location[0], longitude: location[1] })) },
    { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } },
  );

  return response.data;
});

export const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    addMarker(state, action) {
      if (!state.markers) {
        state.markers = [action.payload];
      } else {
        state.markers.push(action.payload);
      }
    },
    removeLastMarker(state) {
      if (!state.markers || state.markers.length === 0) return

      state.markers.pop();
    },
    setHighestPoint(state, action) {
      state.highestPoint = action.payload;
    },
    setRoute(state, action) {
      state.markers = action.payload;
    },
    resetRoute(state) {
      state.markers = null;
      state.highestPoint = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(getHighestPoint.fulfilled, (state, action) => {
      let newHighestPoint = null;
      let highestElevation = 0;

      console.log(action.payload.results);

      action.payload.results.forEach(coord => {
        console.log('Highest', highestElevation, 'current', coord.elevation);
        if (highestElevation < coord.elevation) {
          highestElevation = coord.elevation;
          newHighestPoint = [...Object.values(coord)];
        }
      });

      state.highestPoint = newHighestPoint;
    });
  },
});

export const { addMarker, setHighestPoint, setRoute, removeLastMarker, resetRoute } = routeSlice.actions;

export default routeSlice.reducer;
