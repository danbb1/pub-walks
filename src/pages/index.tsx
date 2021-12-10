/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import { LeafletMouseEvent, Map } from 'leaflet';
import { MapContainer, Marker, Polyline, Rectangle, TileLayer, useMapEvent, Tooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

import { addMarker } from '../state/slices/routeSlice';
import { setSearchArea } from '../state/slices/pubSlice';

import { pubsSelector, routeSelector } from '../state/store';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Menu from '../components/menu';

const Drop = ({ handleClick }: { handleClick: (event: LeafletMouseEvent) => void }) => {
  useMapEvent('click', e => {
    handleClick(e);
  });

  return null;
};

const IndexPage = () => {
  const { markers, highestPoint } = useSelector(routeSelector);
  const { searchArea, pubs } = useSelector(pubsSelector);
  const [map, setMap] = useState<Map | null>(null);

  const dispatch = useDispatch();

  const handleClick = (event: LeafletMouseEvent) => {
    dispatch(addMarker([event.latlng.lat, event.latlng.lng]));
    const newSearchArea = searchArea
      ? [[...searchArea[0]], [...searchArea[1]]]
      : [
          [null, null],
          [null, null],
        ];

    let [[n, w], [s, e]] = newSearchArea;

    const distanceTolerance = 0.005;
    if (!w || event.latlng.lng + distanceTolerance > w) w = event.latlng.lng + distanceTolerance;
    if (!e || event.latlng.lng - distanceTolerance < e) e = event.latlng.lng - distanceTolerance;
    if (!n || event.latlng.lat + distanceTolerance > n) n = event.latlng.lat + distanceTolerance;
    if (!s || event.latlng.lat - distanceTolerance < s) s = event.latlng.lat - distanceTolerance;

    dispatch(
      setSearchArea([
        [n, w],
        [s, e],
      ]),
    );
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
          pubs.map(pub =>
            pub.lat && pub.long ? (
              <Marker key={pub._id} position={[pub.lat, pub.long]}>
                <Tooltip>
                  <ul>
                    <li>{pub.name}</li>
                    <li>{pub.address}</li>
                    <li>{pub.postcode}</li>
                  </ul>
                </Tooltip>
              </Marker>
            ) : null,
          )}
        <Drop handleClick={handleClick} />
      </MapContainer>
      <Menu map={map} />
    </Layout>
  );
};

export default IndexPage;
