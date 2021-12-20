import { createSlice } from '@reduxjs/toolkit';

const initialState: IMenuState = {
  menu: 'MAIN',
  heading: 'Routes',
};

type Menus = 'MAIN' | 'ROUTE' | 'PUB';

export type IMenuState = {
  menu: Menus;
  heading: 'Routes' | 'Add Route' | 'Add Pub';
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenu(state, action: { payload: Menus }) {
      state.menu = action.payload;
      switch (action.payload) {
        case 'MAIN':
          state.heading = 'Routes';
          break;
        case 'ROUTE':
          state.heading = 'Add Route';
          break;
        case 'PUB':
          state.heading = 'Add Pub';
          break;
        default:
          break;
      }
    },
  },
});

export const { setMenu } = menuSlice.actions;

export default menuSlice.reducer;
