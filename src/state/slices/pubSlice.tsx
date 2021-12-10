import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { LatLngTuple } from 'leaflet';

const initialState = {
  pubs: null,
  searchArea: null,
} as IPubsInitialState;

type Pub = {
  name?: string;
  address?: string;
  postcode?: string;
  lat?: number;
  long?: number;
  authority?: string;
  _id: string;
};

type SearchArea = LatLngTuple[];

export type IPubsInitialState = {
  pubs: Pub[] | null;
  searchArea: SearchArea | null;
};

export const getPubs = createAsyncThunk('pubs/getPubs', async (payload, { getState }) => {
  const {
    pubs: { searchArea },
  } = getState() as { pubs: { searchArea: LatLngTuple[] } };

  if (!searchArea) return null;

  const [[n, w], [s, e]] = searchArea;

  const result = await axios.post('/.netlify/functions/get-pubs', { n, w, s, e });

  return result.data;
});

export const pubsSlice = createSlice({
  name: 'pubs',
  initialState,
  reducers: {
    setSearchArea(state, action) {
      state.searchArea = action.payload;
    },
    resetPubs(state) {
      state.searchArea = null;
      state.pubs = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(getPubs.fulfilled, (state, action) => {
      state.pubs = action.payload;
    });
  },
});

export const { setSearchArea, resetPubs } = pubsSlice.actions;

export default pubsSlice.reducer;