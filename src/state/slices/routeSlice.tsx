import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LatLngTuple } from 'leaflet';
import axios from 'axios';

type HighestPoint = null | [...LatLngTuple, number];

export type Route = {
  name: string;
  description: string;
  likes: number;
  comments: string[];
  markers: {
    lat: number;
    long: number;
  }[];
  _id: string;
};

export type IRoutesInitialState = {
  markers: null | LatLngTuple[];
  highestPoint: HighestPoint;
  recentRoutes: Route[] | null;
};

const initialState = {
  markers: null,
  highestPoint: null,
  recentRoutes: null,
} as IRoutesInitialState;

export const getHighestPoint = createAsyncThunk('route/getHighestPoint', async (route: LatLngTuple[]) => {
  const response = await axios.post(
    'https://api.open-elevation.com/api/v1/lookup',
    { locations: route.map(location => ({ latitude: location[0], longitude: location[1] })) },
    { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } },
  );

  return response.data;
});

export const getRecentRoutes = createAsyncThunk('route/getRecentRoutes', async () => {
  const result = await axios.post('/.netlify/functions/get-recent-routes');

  return result.data;
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
      if (!state.markers || state.markers.length === 0) return;

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
      let newHighestPoint: HighestPoint = null;
      let highestElevation = 0;

      action.payload.results.forEach((coord: { latitude: number; longitude: number; elevation: number }) => {
        if (highestElevation < coord.elevation) {
          highestElevation = coord.elevation;
          newHighestPoint = [...Object.values(coord)] as HighestPoint;
        }
      });

      state.highestPoint = newHighestPoint;
    });
    builder.addCase(getRecentRoutes.fulfilled, (state, action) => {
      state.recentRoutes = action.payload;
    });
  },
});

export const { addMarker, setHighestPoint, setRoute, removeLastMarker, resetRoute } = routeSlice.actions;

export default routeSlice.reducer;
