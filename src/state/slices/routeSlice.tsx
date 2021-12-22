import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LatLngTuple } from 'leaflet';
import axios from 'axios';

import { calcDistance } from '../../utils/handleRoute';

export type HighestPoint = null | [...LatLngTuple, number];

export type Filters = 'RECENT' | 'MOST_LIKED' | 'REGION:NORTH_WEST';

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
  filteredRoutes: Route[] | null;
  filter: Filters;
  selectedRoute: Route | null;
  routeDistance: number | 0;
};

const initialState = {
  markers: null,
  highestPoint: null,
  filteredRoutes: null,
  filter: 'RECENT',
  selectedRoute: null,
  routeDistance: 0,
} as IRoutesInitialState;

export const getHighestPoint = createAsyncThunk('route/getHighestPoint', async (route: LatLngTuple[]) => {
  const locations = route
    .map((location, index) => (index % 2 === 0 ? { latitude: location[0], longitude: location[1] } : null))
    .filter(location => location);
  const response = await axios.post(
    'https://api.open-elevation.com/api/v1/lookup',
    {
      locations,
    },
    { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } },
  );

  return response.data;
});

export const setFilteredRoutes = createAsyncThunk('route/setFilteredRoutes', async (filter: Filters) => {
  let query;

  console.log(filter);

  switch (filter) {
    case 'RECENT':
      query = {
        createdAt: { $gte: new Date().getTime() - 2592000000 },
      };
      break;
    case 'MOST_LIKED':
      query = { sort: 'MOST_LIKED' };
      break;
    default:
      query = null;
  }
  const result = await axios.post('/.netlify/functions/get-routes', query);

  return result.data;
});

export const likeRoute = createAsyncThunk('route/likeRoute', async (route: Route) => {
  const newRoute = {
    ...route,
    likes: route.likes + 1,
  };

  const result = await axios.post('/.netlify/functions/update-route', newRoute);

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
    setFilter(state, action: { payload: Filters }) {
      state.filter = action.payload;
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
    builder.addCase(setFilteredRoutes.fulfilled, (state, action: { payload: Route[] }) => {
      state.filteredRoutes = action.payload;
    });
    builder.addCase(likeRoute.fulfilled, (state, action: { payload: Route }) => {
      state.selectedRoute = action.payload;
    });
  },
});

export const {
  addMarker,
  setHighestPoint,
  setFilter,
  setMarkers,
  setSelectedRoute,
  removeLastMarker,
  resetRoute,
  setRouteDistance,
} = routeSlice.actions;

export default routeSlice.reducer;
