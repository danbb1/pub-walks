import React, { useState } from 'react';
import { LeafletMouseEvent, LatLngExpression, LatLngTuple } from 'leaflet';
import { MapContainer, Marker, Polyline, Rectangle, TileLayer, useMapEvent, Tooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

import { addMarker } from '../state/slices/routeSlice';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Menu from '../components/menu';

const Drop = ({ handleClick }) => {
  useMapEvent('click', e => {
    handleClick(e);
  });

  return null;
};

const IndexPage = () => {
  // const [markers, setMarkers] = useState<LatLngTuple[] | null>(null);
  const { markers, highestPoint } = useSelector(state => state.route);
  const [map, setMap] = useState(null);
  const [searchArea, setSearchArea] = useState(null);
  const [pubs, setPubs] = useState(null);
  const [routeBounds, setRouteBounds] = useState(null);

  const dispatch = useDispatch();

  const handleClick = (e: LeafletMouseEvent) => {
    dispatch(addMarker([e.latlng.lat, e.latlng.lng]));
    const newRouteBounds = routeBounds
      ? {
          ...routeBounds,
        }
      : {
          n: null,
          e: null,
          s: null,
          w: null,
        };

    const distanceTolerance = 0.005;
    if (!newRouteBounds.w || e.latlng.lng + distanceTolerance > newRouteBounds.w)
      newRouteBounds.w = e.latlng.lng + distanceTolerance;
    if (!newRouteBounds.e || e.latlng.lng - distanceTolerance < newRouteBounds.e)
      newRouteBounds.e = e.latlng.lng - distanceTolerance;
    if (!newRouteBounds.n || e.latlng.lat + distanceTolerance > newRouteBounds.n)
      newRouteBounds.n = e.latlng.lat + distanceTolerance;
    if (!newRouteBounds.s || e.latlng.lat - distanceTolerance < newRouteBounds.s)
      newRouteBounds.s = e.latlng.lat - distanceTolerance;

    setRouteBounds(newRouteBounds);
    setSearchArea([
      [newRouteBounds.n, newRouteBounds.w],
      [newRouteBounds.s, newRouteBounds.e],
    ]);
  };

  return (
    <Layout>
      <Seo title="Home" />
      <MapContainer
        className="h-screen w-full mx-auto"
        center={[53.411, -2.101]}
        zoom={13}
        scrollWheelZoom={false}
        whenCreated={mapInstance => setMap(mapInstance)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {highestPoint && (
          <Marker position={[highestPoint[0], highestPoint[1]]}>
            <Tooltip>Highest Point: {Math.round(highestPoint[2])}m</Tooltip>
          </Marker>
        )}
        {markers && <Polyline positions={markers} />}
        {searchArea && <Rectangle bounds={searchArea} />}
        {pubs &&
          pubs.map(pub => (
            <Marker key={pub._id} position={[pub.lat, pub.long]}>
              <Tooltip>
                <ul>
                  <li>{pub.name}</li>
                  <li>{pub.address}</li>
                  <li>{pub.postcode}</li>
                </ul>
              </Tooltip>
            </Marker>
          ))}
        <Drop handleClick={handleClick} />
      </MapContainer>
      <Menu
        markers={markers}
        setSearchArea={setSearchArea}
        setPubs={setPubs}
        routeBounds={routeBounds}
        setRouteBounds={setRouteBounds}
        map={map}
      />
    </Layout>
  );
};

export default IndexPage;
