import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LatLngTuple } from 'leaflet';
import axios from 'axios';

import { calcDistance } from '../../utils/handleRoute';

type HighestPoint = null | [...LatLngTuple, number];

export type Route = {
  name: string;
  description: string;
  likes: number;
  comments: string[];
  distance: number;
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
  selectedRoute: Route | null;
  routeDistance: number | 0;
};

const initialState = {
  markers: null,
  highestPoint: null,
  recentRoutes: null,
  selectedRoute: null,
  routeDistance: 0,
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
    addMarker(state, action: { payload: LatLngTuple }) {
      if (!state.markers) {
        state.markers = [action.payload];
        state.routeDistance = 0;
      } else {
        if (state.markers.length > 0) {
          state.routeDistance += calcDistance(state.markers[state.markers.length - 1], action.payload);
        }
        state.markers.push(action.payload);
      }
    },
    removeLastMarker(state) {
      if (!state.markers || state.markers.length === 0) return;

      if (state.markers.length > 1) {
        const removedDistance = calcDistance(
          state.markers[state.markers.length - 1],
          state.markers[state.markers.length - 2],
        );

        state.routeDistance -= removedDistance;
      }

      state.markers.pop();
    },
    setHighestPoint(state, action: { payload: HighestPoint }) {
      state.highestPoint = action.payload;
    },
    setMarkers(state, action) {
      state.markers = action.payload;
    },
    resetRoute(state) {
      state.markers = null;
      state.highestPoint = null;
      state.selectedRoute = null;
      state.routeDistance = 0;
    },
    setSelectedRoute(state, action: { payload: Route }) {
      state.selectedRoute = action.payload;
    },
    setRouteDistance(state, action: { payload: number }) {
      state.routeDistance = action.payload;
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
    builder.addCase(getRecentRoutes.fulfilled, (state, action: { payload: Route[] }) => {
      state.recentRoutes = action.payload;
    });
  },
});

export const {
  addMarker,
  setHighestPoint,
  setMarkers,
  setSelectedRoute,
  removeLastMarker,
  resetRoute,
  setRouteDistance,
} = routeSlice.actions;

export default routeSlice.reducer;
