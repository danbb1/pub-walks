/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import { LatLngTuple, LeafletMouseEvent, Map } from 'leaflet';
import { MapContainer, Polyline, Rectangle, TileLayer, useMapEvent, Tooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

import { addMarker } from '../state/slices/routeSlice';
import { setSearchArea, setNewPubMarker } from '../state/slices/pubSlice';

import { menuSelector, pubsSelector, routeSelector } from '../state/store';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Menu from '../components/menu';
import { HighestPointMarker, PubMarker, NewPubMarker } from '../components/mapMarkers';
import { calcNewRouteBounds } from '../utils/handleRoute';

const Drop = ({ handleClick }: { handleClick: (event: LeafletMouseEvent) => void }) => {
  useMapEvent('click', e => {
    handleClick(e);
  });

  return null;
};

const IndexPage = () => {
  const { markers, highestPoint } = useSelector(routeSelector);
  const { searchArea, pubs, newPubMarker } = useSelector(pubsSelector);
  const [map, setMap] = useState<Map | null>(null);

  const { menu } = useSelector(menuSelector);

  const dispatch = useDispatch();

  const handleClick = (event: LeafletMouseEvent) => {
    if (menu === 'PUB') {
      dispatch(setNewPubMarker([event.latlng.lat, event.latlng.lng]));
    } else if (menu === 'ROUTE') {
      dispatch(addMarker([event.latlng.lat, event.latlng.lng]));

      const newSearchArea = searchArea
        ? [[...searchArea[0]], [...searchArea[1]]]
        : [
            [null, null],
            [null, null],
          ];

      const [[n, w], [s, e]] = newSearchArea;

      const newRouteBounds = calcNewRouteBounds({ n, w, s, e }, [event.latlng.lat, event.latlng.lng]);

      dispatch(
        setSearchArea([
          [newRouteBounds.n!, newRouteBounds.w!],
          [newRouteBounds.s!, newRouteBounds.e!],
        ]),
      );
    }
  };

  const calcCrossSVGPositions = (coord: LatLngTuple): LatLngTuple[][] => {
    const size = 0.0005;

    const [lat, long] = coord;

    return [
      [
        [lat - size, long - size],
        [lat + size, long + size],
      ],
      [
        [lat + size, long - size],
        [lat - size, long + size],
      ],
    ];
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
        {menu === 'PUB' && (
          <span
            style={{ zIndex: 2000 }}
            className="fixed top-0 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-xl"
          >
            Dropping Pub Pin
          </span>
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {highestPoint && (
          <HighestPointMarker position={[highestPoint[0], highestPoint[1]]}>
            <Tooltip>Highest Point: {Math.round(highestPoint[2])}m</Tooltip>
          </HighestPointMarker>
        )}
        {menu === 'PUB' && newPubMarker && (
          <NewPubMarker position={newPubMarker}>
            <Tooltip>TEST</Tooltip>
          </NewPubMarker>
        )}
        {markers && markers.length > 0 && (
          <>
            {/* Route line */}
            <Polyline positions={markers} />
            {/* Start marker */}
            <Polyline pathOptions={{ color: 'lime' }} positions={calcCrossSVGPositions(markers[0])} />
            {/* End Marker */}
            {markers.length > 1 && (
              <Polyline pathOptions={{ color: 'red' }} positions={calcCrossSVGPositions(markers[markers.length - 1])} />
            )}
          </>
        )}
        {searchArea && <Rectangle bounds={searchArea} />}
        {pubs &&
          pubs.map(pub =>
            pub.lat && pub.long ? (
              <PubMarker key={pub._id} position={[pub.lat, pub.long]}>
                <Tooltip>
                  <ul>
                    <li>{pub.name}</li>
                    <li>{pub.address}</li>
                    <li>{pub.postcode}</li>
                  </ul>
                </Tooltip>
              </PubMarker>
            ) : null,
          )}
        <Drop handleClick={handleClick} />
      </MapContainer>
      <Menu map={map} />
    </Layout>
  );
};

export default IndexPage;
