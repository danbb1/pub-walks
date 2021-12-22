import React, { useState } from 'react';
import { Map } from 'leaflet';
import { useDispatch, useSelector } from 'react-redux';

import MainMenu from './mainMenu';
import AddPubForm from './addPubForm';
import AddRouteForm from './addRouteForm';
import Button from './button';
import { goBack, Headings } from '../state/slices/menuSlice';
import { menuSelector } from '../state/store';
import ViewRoute from './route';
import { resetPubs } from '../state/slices/pubSlice';
import { resetRoute } from '../state/slices/routeSlice';

const Menu = ({ map }: { map: Map | null }) => {
  const [viewMenu, setViewMenu] = useState<boolean>(false);

  const dispatch = useDispatch();

  const { menu, history } = useSelector(menuSelector);

  return (
    <div>
      <div style={{ zIndex: 2000 }} className="fixed top-4 right-4">
        {viewMenu && history.length > 0 && (
          <Button
            label="Back"
            className="mr-4"
            onClick={() => {
              dispatch(goBack());
              dispatch(resetPubs());
              dispatch(resetRoute());
            }}
          />
        )}
        <Button label={viewMenu ? 'Close' : 'View Menu'} onClick={() => setViewMenu(!viewMenu)} />
      </div>
      {viewMenu && (
        <div
          style={{ zIndex: 1000, minWidth: 300 }}
          className="fixed right-0 top-0 bottom-0 flex flex-col items-center py-16 px-4 z-10 bg-gray-100 bg-opacity-60 w-1/3"
        >
          {menu !== 'VIEW_ROUTE' && <h1 className="font-bold text-xl mb-4">{Headings[menu]}</h1>}
          {menu === 'MAIN' && <MainMenu map={map} />}
          {menu === 'PUB' && <AddPubForm />}
          {menu === 'ADD_ROUTE' && <AddRouteForm map={map} />}
          {menu === 'VIEW_ROUTE' && <ViewRoute />}
        </div>
      )}
    </div>
  );
};

export default Menu;
