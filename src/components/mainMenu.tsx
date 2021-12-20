import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Map } from 'leaflet';

import {
  getHighestPoint,
  getRecentRoutes,
  resetRoute,
  setSelectedRoute,
  setMarkers,
  Route,
} from '../state/slices/routeSlice';
import { getPubs, resetPubs, setSearchArea } from '../state/slices/pubSlice';

import { routeSelector } from '../state/store';

import Button from './button';
import { setMenu } from '../state/slices/menuSlice';
import handleRoute from '../utils/handleRoute';

const MainMenu = ({ map }: { map: Map | null }) => {
  const dispatch = useDispatch();

  const { markers, recentRoutes, selectedRoute } = useSelector(routeSelector);

  useEffect(() => {
    dispatch(getRecentRoutes());
    console.log('getting routes');
  }, []);

  const handleRouteSelect = (route: Route) => {
    const { points, centrePoint, searchArea } = handleRoute(route.markers);
    dispatch(setSelectedRoute(route));
    dispatch(setMarkers(points));
    if (map) map.flyTo(centrePoint);
    dispatch(setSearchArea(searchArea));
  };

  return (
    <>
      <Button
        label="Add Route"
        onClick={() => {
          dispatch(setMenu('ROUTE'));
          dispatch(resetRoute());
          dispatch(resetPubs());
        }}
      />
      <span className="block mb-2">Recently Added Routes</span>
      <ul className="w-full">
        {recentRoutes &&
          recentRoutes.map(route => (
            // eslint-disable-next-line no-underscore-dangle
            <li key={route._id} className="flex justify-between mb-2 w-full">
              <span>{route.name}</span>
              <Button label="View" onClick={() => handleRouteSelect(route)} />
            </li>
          ))}
      </ul>
      {selectedRoute && markers && (
        <aside className="border-t-2 border-black pt-2">
          <h3 className="font-bold txt-lg">{selectedRoute.name}</h3>
          <span>{selectedRoute.distance.toFixed(2)}km</span>
          <p>{selectedRoute.description}</p>
          <Button className="mb-2 mx-auto" label="See Pubs" onClick={() => dispatch(getPubs())} />
          <Button
            className="mb-4"
            label="Get Highest Point"
            onClick={() => (markers ? dispatch(getHighestPoint(markers)) : null)}
          />
          <span className="mb-2 block">Missing pub? Add it!</span>
          <Button
            className="mb-2"
            label="Add Pub"
            onClick={() => {
              dispatch(setMenu('PUB'));
            }}
          />
        </aside>
      )}
    </>
  );
};

export default MainMenu;
