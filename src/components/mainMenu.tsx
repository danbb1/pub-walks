import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Map } from 'leaflet';

import {
  setFilteredRoutes,
  resetRoute,
  setSelectedRoute,
  setMarkers,
  setFilter,
  Filters,
  Route,
} from '../state/slices/routeSlice';
import { resetPubs, setSearchArea } from '../state/slices/pubSlice';

import { routeSelector } from '../state/store';

import Button from './button';
import { setMenu } from '../state/slices/menuSlice';
import handleRoute from '../utils/handleRoute';

const MainMenu = ({ map }: { map: Map | null }) => {
  const dispatch = useDispatch();

  const { filteredRoutes, filter } = useSelector(routeSelector);

  useEffect(() => {
    dispatch(setFilteredRoutes(filter));
  }, [filter]);

  const handleRouteSelect = (route: Route) => {
    const { points, centrePoint, searchArea } = handleRoute(route.markers);
    dispatch(setSelectedRoute(route));
    dispatch(setMarkers(points));
    if (map) map.flyTo(centrePoint);
    dispatch(setSearchArea(searchArea));
    dispatch(setMenu('VIEW_ROUTE'));
  };

  const filterHeadings: {
    [K in Filters]: string;
  } = {
    MOST_LIKED: 'Most Popular Routes',
    RECENT: 'Recently Added Routes',
    'REGION:NORTH_WEST': 'Region: North West',
    'REGION:YORKSHIRE_AND_HUMBER': 'Region: Yorkshire and the Humber',
    'REGION:SOUTH_WEST_ENGLAND': 'Region: South West England',
  };

  const handleCycleFilter = (direction: 'PREVIOUS' | 'NEXT') => {
    const filters: Filters[] = [
      'RECENT',
      'MOST_LIKED',
      'REGION:NORTH_WEST',
      'REGION:YORKSHIRE_AND_HUMBER',
      'REGION:SOUTH_WEST_ENGLAND',
    ];

    let newFilter: Filters;

    const currentIndex = filters.findIndex(val => val === filter);

    if (direction === 'NEXT') {
      newFilter = filters.length > currentIndex + 1 ? filters[currentIndex + 1] : filters[0];
    } else {
      newFilter = currentIndex - 1 >= 0 ? filters[currentIndex - 1] : filters[filters.length - 1];
    }

    dispatch(setFilter(newFilter));
  };

  return (
    <>
      <div className="flex justify-between w-full items-center mb-4">
        <Button label="<" onClick={() => handleCycleFilter('PREVIOUS')} />
        <h4 className="font-bold">{filterHeadings[filter]}</h4>
        <Button label=">" onClick={() => handleCycleFilter('NEXT')} />
      </div>
      <ul className="w-full">
        {filteredRoutes &&
          filteredRoutes.map(route => (
            // eslint-disable-next-line no-underscore-dangle
            <li key={route._id} className="flex justify-between mb-2 w-full">
              <span>{route.name}</span>
              <Button label="View" onClick={() => handleRouteSelect(route)} />
            </li>
          ))}
      </ul>
      <Button
        className="mb-2 mt-auto"
        label="Add Route"
        onClick={() => {
          dispatch(setMenu('ADD_ROUTE'));
          dispatch(resetRoute());
          dispatch(resetPubs());
        }}
      />
    </>
  );
};

export default MainMenu;
