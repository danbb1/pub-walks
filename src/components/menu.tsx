import React, { useState, ChangeEvent } from 'react';
import axios, { AxiosResponse } from 'axios';
import { LatLngExpression, LatLngTuple } from 'leaflet';
import { FeatureCollection } from 'geojson';
import { useDispatch, useSelector } from 'react-redux';

import {
  getHighestPoint,
  setHighestPoint,
  setRoute,
  addMarker,
  removeLastMarker,
  resetRoute,
} from '../state/slices/routeSlice';

import { setSearchArea, resetPubs, getPubs } from '../state/slices/pubSlice';

import { routeSelector } from '../state/store';

import Button from './button';

const getCentrePoint = (x: number, y: number, z: number): LatLngExpression => {
  const centreLong = Math.atan2(y, x);
  const centreSqrt = Math.sqrt(x * x + y * y);
  const centreLat = Math.atan2(z, centreSqrt);

  return [(centreLat * 180) / Math.PI, (centreLong * 180) / Math.PI];
};

const Menu = ({ map }) => {
  const [viewMenu, setViewMenu] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const dispatch = useDispatch();

  const { markers } = useSelector(routeSelector);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!e.target.files) return;
    setSelectedFile(e.target.files[0]);
  };

  const handleRoute = (coordinates: [...LatLngTuple, number][]) => {
    let x = 0;
    let y = 0;
    let z = 0;
    let highestElevation = 0;
    const newRouteBounds: { n: number | null; s: number | null; e: number | null; w: number | null } = {
      n: null,
      e: null,
      s: null,
      w: null,
    };

    const points = coordinates.map(coord => {
      const lat = (coord[1] * Math.PI) / 180;
      const long = (coord[0] * Math.PI) / 180;
      x += Math.cos(lat) * Math.cos(long);
      y += Math.cos(lat) * Math.sin(long);
      z += Math.sin(lat);
      if (coord[2] > highestElevation) {
        [, , highestElevation] = coord;
        dispatch(setHighestPoint([coord[1], coord[0], coord[2]]));
      }
      const distanceTolerance = 0.005;
      if (!newRouteBounds.w || coord[0] + distanceTolerance > newRouteBounds.w)
        newRouteBounds.w = coord[0] + distanceTolerance;
      if (!newRouteBounds.e || coord[0] - distanceTolerance < newRouteBounds.e)
        newRouteBounds.e = coord[0] - distanceTolerance;
      if (!newRouteBounds.n || coord[1] + distanceTolerance > newRouteBounds.n)
        newRouteBounds.n = coord[1] + distanceTolerance;
      if (!newRouteBounds.s || coord[1] - distanceTolerance < newRouteBounds.s)
        newRouteBounds.s = coord[1] - distanceTolerance;

      return [coord[1], coord[0]];
    });
    x /= points.length;
    y /= points.length;
    z /= points.length;

    dispatch(
      setSearchArea([
        [newRouteBounds.n, newRouteBounds.w],
        [newRouteBounds.s, newRouteBounds.e],
      ]),
    );

    const newCentrePoint = getCentrePoint(x, y, z);

    if (map) map.flyTo(newCentrePoint);

    return points;
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile || selectedFile.type !== 'application/gpx+xml') return alert('Must be a gpx file');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);

      const result: AxiosResponse<FeatureCollection, PromiseRejectedResult> = await axios.post(
        '/.netlify/functions/handle-file',
        formData,
      );

      if (result.data.features[0].geometry.coordinates) {
        const points = handleRoute(result.data.features[0].geometry.coordinates);
        dispatch(setRoute(points));
      }

      return null;
    } catch (err) {
      console.log(err.message);
      return null;
    }
  };

  return (
    <div>
      <div style={{ zIndex: 2000 }} className="fixed top-4 right-4">
        <Button label={viewMenu ? 'Close' : 'View Menu'} onClick={() => setViewMenu(!viewMenu)} />
      </div>

      {viewMenu && (
        <div
          style={{ zIndex: 1000 }}
          className="fixed right-0 top-0 bottom-0 flex flex-col items-center w-min py-12 px-4 z-10 bg-gray-100 bg-opacity-60"
        >
          <Button
            label="Clear"
            onClick={() => {
              dispatch(resetRoute());
              dispatch(resetPubs());
            }}
            className="mb-2"
          />
          <Button
            className="mb-2"
            label="Undo"
            onClick={() => {
              dispatch(removeLastMarker());
            }}
          />
          <Button
            className="mb-2 whitespace-nowrap"
            label="Close Path"
            onClick={() => (markers ? dispatch(addMarker(markers[0])) : null)}
          />
          <Button label="See Pubs" onClick={() => dispatch(getPubs())} />
          <Button label="Get Highest Point" onClick={() => (markers ? dispatch(getHighestPoint(markers)) : null)} />
          <form onSubmit={handleUpload} className="flex flex-col items-center mt-auto">
            <input className="mb-2" type="file" name="file" onChange={handleChange} />
            <Button submit label="Upload" />
          </form>
        </div>
      )}
    </div>
  );
};

export default Menu;
