import React, { useState } from 'react';
import { Map } from 'leaflet';
import { useSelector } from 'react-redux';

import MainMenu from './mainMenu';
import AddPubForm from './addPubForm';
import AddRouteForm from './addRouteForm';
import Button from './button';
import { menuSelector } from '../state/store';

const Menu = ({ map }: { map: Map | null }) => {
  const [viewMenu, setViewMenu] = useState<boolean>(false);

  const { menu, heading } = useSelector(menuSelector);

  return (
    <div>
      <div style={{ zIndex: 2000 }} className="fixed top-4 right-4">
        <Button label={viewMenu ? 'Close' : 'View Menu'} onClick={() => setViewMenu(!viewMenu)} />
      </div>
      {viewMenu && (
        <div
          style={{ zIndex: 1000 }}
          className="fixed right-0 top-0 bottom-0 flex flex-col items-center py-16 px-4 z-10 bg-gray-100 bg-opacity-60 w-1/3 min-w-min"
        >
          <h1 className="font-bold text-xl mb-4">{heading}</h1>
          {menu === 'MAIN' && <MainMenu map={map} />}
          {menu === 'PUB' && <AddPubForm />}
          {menu === 'ROUTE' && <AddRouteForm map={map} />}
        </div>
      )}
    </div>
  );
};

export default Menu;
