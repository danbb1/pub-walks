/* eslint-disable no-underscore-dangle */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { likeRoute } from '../state/slices/routeSlice';
import { getPubs } from '../state/slices/pubSlice';
import { setMenu } from '../state/slices/menuSlice';

import Button from './button';
import { routeSelector } from '../state/store';

const ViewRoute = () => {
  const { selectedRoute } = useSelector(routeSelector);

  const dispatch = useDispatch();

  if (!selectedRoute) return <p>Whoops...something went wrong</p>;

  console.log(selectedRoute);

  return (
    <aside className="w-full">
      <h3 className="font-bold txt-lg">{selectedRoute.name}</h3>
      <span>{selectedRoute.distance.toFixed(2)}km</span>
      <p>{selectedRoute.region}</p>
      <p>{selectedRoute.description}</p>
      <div className="flex justify-between">
        <p>{selectedRoute.likes} likes</p>
        <Button label="Like" onClick={() => dispatch(likeRoute(selectedRoute))} />
      </div>
      <Button className="mb-2 mx-auto" label="See Pubs" onClick={() => dispatch(getPubs())} />
      <span className="mb-2 block">Missing pub? Add it!</span>
      <Button
        className="mb-2"
        label="Add Pub"
        onClick={() => {
          dispatch(setMenu('PUB'));
        }}
      />
    </aside>
  );
};

export default ViewRoute;
