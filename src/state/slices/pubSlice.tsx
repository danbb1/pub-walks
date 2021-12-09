import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  pubs: null,
  searchArea: null,
};

export const getPubs = createAsyncThunk('pubs/getPubs', async (payload, { getState }) => {
  const {
    pubs: { searchArea },
  } = getState();

  if (!searchArea) return null;

  const [[n, w], [s, e]] = searchArea;

  console.log(n, w, s, e);

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
