import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LatLngTuple } from 'leaflet';
import axios from 'axios';

import { calcDistance } from '../../utils/handleRoute';

export type HighestPoint = null | [...LatLngTuple, number];

export type Filters =
  | 'RECENT'
  | 'MOST_LIKED'
  | 'REGION:NORTH_WEST'
  | 'REGION:YORKSHIRE_AND_HUMBER'
  | 'REGION:SOUTH_WEST_ENGLAND';

export type Route = {
  name: string;
  description: string;
  region: string;
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
  filteredRoutes: Route[] | null;
  filteredRoutesLoading: boolean;
  likeRouteLoading: boolean;
  filter: Filters;
  selectedRoute: Route | null;
  routeDistance: number | 0;
};

const initialState = {
  markers: null,
  filteredRoutes: null,
  filteredRoutesLoading: false,
  filter: 'RECENT',
  likeRouteLoading: false,
  selectedRoute: null,
  routeDistance: 0,
} as IRoutesInitialState;

export const setFilteredRoutes = createAsyncThunk('route/setFilteredRoutes', async (filter: Filters) => {
  let query;

  switch (filter) {
    case 'RECENT':
      query = {
        createdAt: { $gte: new Date().getTime() - 2592000000 },
      };
      break;
    case 'MOST_LIKED':
      query = { sort: 'MOST_LIKED' };
      break;
    case 'REGION:NORTH_WEST':
      query = { region: 'North West England' };
      break;
    case 'REGION:YORKSHIRE_AND_HUMBER':
      query = { region: 'Yorkshire and the Humber' };
      break;
    case 'REGION:SOUTH_WEST_ENGLAND':
      query = { region: 'South West England' };
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
    setMarkers(state, action) {
      state.markers = action.payload;
    },
    resetRoute(state) {
      state.markers = null;
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
    builder.addCase(setFilteredRoutes.pending, state => {
      state.filteredRoutesLoading = true;
    });
    builder.addCase(setFilteredRoutes.fulfilled, (state, action: { payload: Route[] }) => {
      state.filteredRoutesLoading = false;
      state.filteredRoutes = action.payload;
    });
    builder.addCase(likeRoute.pending, state => {
      state.likeRouteLoading = true;
    });
    builder.addCase(likeRoute.fulfilled, (state, action: { payload: Route }) => {
      state.likeRouteLoading = false;
      state.selectedRoute = action.payload;
    });
  },
});

export const { addMarker, setFilter, setMarkers, setSelectedRoute, removeLastMarker, resetRoute, setRouteDistance } =
  routeSlice.actions;

export default routeSlice.reducer;
