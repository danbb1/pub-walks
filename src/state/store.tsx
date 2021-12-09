import { configureStore } from '@reduxjs/toolkit';
import routeReducer from './slices/routeSlice';
import pubsReducer from './slices/pubSlice';

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
