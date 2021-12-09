import React from 'react';
import { Provider } from 'react-redux';

import store from './src/state/store';

// eslint-disable-next-line react/prop-types
export default ({ element }) => <Provider store={store}>{element}</Provider>;
