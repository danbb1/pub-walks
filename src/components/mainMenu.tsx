import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Map } from 'leaflet';

import { getHighestPoint, getRecentRoutes, resetRoute, setRoute, Route } from '../state/slices/routeSlice';
import { getPubs, resetPubs, setSearchArea } from '../state/slices/pubSlice';

import { routeSelector } from '../state/store';

import Button from './button';
import { setMenu } from '../state/slices/menuSlice';
import handleRoute from '../utils/handleRoute';

const MainMenu = ({ map }: { map: Map | null }) => {
  const dispatch = useDispatch();

  const { markers, recentRoutes } = useSelector(routeSelector);

  useEffect(() => {
    dispatch(getRecentRoutes());
  }, []);

  const handleRouteSelect = (route: Route) => {
    const { points, centrePoint, searchArea } = handleRoute(route.markers);

    dispatch(setRoute(points));
    if (map) map.flyTo(centrePoint);
    dispatch(setSearchArea(searchArea));
  };

  return (
    <>
      <span className="block mb-2">Recently Added Routes</span>
      <ul>
        {recentRoutes &&
          recentRoutes.map(route => (
            // eslint-disable-next-line no-underscore-dangle
            <li key={route._id}>
              <span>{route.name}</span>
              <Button label="View" onClick={() => handleRouteSelect(route)} />
            </li>
          ))}
      </ul>
      {markers && (
        <>
          <Button className="mb-2" label="See Pubs" onClick={() => dispatch(getPubs())} />
          <Button
            className="mb-4"
            label="Get Highest Point"
            onClick={() => (markers ? dispatch(getHighestPoint(markers)) : null)}
          />
          <span>Missing pub? Add it!</span>
          <Button
            label="Add Pub"
            onClick={() => {
              dispatch(setMenu('PUB'));
            }}
          />
        </>
      )}
      <Button
        label="Add Route"
        onClick={() => {
          dispatch(setMenu('ROUTE'));
          dispatch(resetRoute());
          dispatch(resetPubs());
        }}
      />
    </>
  );
};

export default MainMenu;
