import { configureStore } from '@reduxjs/toolkit';
import routeReducer, { IRoutesInitialState } from './slices/routeSlice';
import pubsReducer, { IPubsInitialState } from './slices/pubSlice';
import menuReducer, { IMenuState } from './slices/menuSlice';

type RootState = {
  route: IRoutesInitialState;
  pubs: IPubsInitialState;
  menu: IMenuState;
};

export default configureStore({
  reducer: {
    route: routeReducer,
    pubs: pubsReducer,
    menu: menuReducer,
  },
});

export const routeSelector = (state: RootState) => state.route;

export const pubsSelector = (state: RootState) => state.pubs;

export const menuSelector = (state: RootState) => state.menu;
