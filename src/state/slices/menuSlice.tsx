import { createSlice } from '@reduxjs/toolkit';

const initialState: IMenuState = {
  menu: 'MAIN',
  history: [],
};

export enum Headings {
  'MAIN' = 'Routes',
  'ADD_ROUTE' = 'Add Route',
  'PUB' = 'Add Pub',
}

type Menus = 'MAIN' | 'ADD_ROUTE' | 'PUB' | 'VIEW_ROUTE';

export type IMenuState = {
  menu: Menus;
  history: Menus[];
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenu(state, action: { payload: Menus }) {
      state.history.push(state.menu);
      state.menu = action.payload;
    },
    goBack(state) {
      if (state.history.length === 0) return;
      const last = state.history.pop();
      state.menu = last!;
    },
  },
});

export const { setMenu, goBack } = menuSlice.actions;

export default menuSlice.reducer;
