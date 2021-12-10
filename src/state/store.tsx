import { configureStore } from '@reduxjs/toolkit';
import routeReducer, { IRoutesInitialState } from './slices/routeSlice';
import pubsReducer, { IPubsInitialState } from './slices/pubSlice';

type RootState = {
  route: IRoutesInitialState;
  pubs: IPubsInitialState;
};

export default configureStore({
  reducer: {
    route: routeReducer,
    pubs: pubsReducer,
  },
  middleware: getDefaultMiddleWare =>
    getDefaultMiddleWare({
      serializableCheck: {
        ignoredActions: ['map/setMap'],
      },
    }),
});

export const routeSelector = (state: RootState) => state.route;

export const pubsSelector = (state: RootState) => state.pubs;
