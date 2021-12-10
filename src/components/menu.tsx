import React, { useState } from 'react';
import { Map } from 'leaflet';

import { useSelector } from 'react-redux';
import RouteMenu from './routeMenu';
import AddPubForm from './addPubForm';
import Button from './button';
import { pubsSelector } from '../state/store';

const Menu = ({ map }: { map: Map | null }) => {
  const [viewMenu, setViewMenu] = useState<boolean>(false);

  const { addingPub } = useSelector(pubsSelector);

  return (
    <div>
      <div style={{ zIndex: 2000 }} className="fixed top-4 right-4">
        <Button label={viewMenu ? 'Close' : 'View Menu'} onClick={() => setViewMenu(!viewMenu)} />
      </div>

      {viewMenu && (
        <div
          style={{ zIndex: 1000 }}
          className="fixed right-0 top-0 bottom-0 flex flex-col items-center py-12 px-4 z-10 bg-gray-100 bg-opacity-60 w-1/3 min-w-min"
        >
          {addingPub ? <AddPubForm map={map} /> : <RouteMenu map={map} />}
        </div>
      )}
    </div>
  );
};

export default Menu;
