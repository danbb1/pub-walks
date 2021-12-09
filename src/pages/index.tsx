import React, { useState, useRef } from 'react';
import L, { LeafletMouseEvent, LatLngExpression, LatLngTuple } from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvent, Tooltip } from 'react-leaflet';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Menu from '../components/menu';

const Drop = ({ handleClick }) => {
  useMapEvent('click', e => {
    console.log(e.target);
    handleClick(e);
  });

  return null;
};

const IndexPage = () => {
  const [markers, setMarkers] = useState<LatLngTuple[] | []>([]);
  const [highestPoint, setHighestPoint] = useState<LatLngExpression | null>(null);

  const ref = useRef(null);

  const handleClick = (e: LeafletMouseEvent) => {
    console.log(e.target, ref);

    setMarkers([...markers, [e.latlng.lat, e.latlng.lng]]);
  };

  return (
    <Layout>
      <Seo title="Home" />
      <MapContainer className="h-screen w-full mx-auto" center={[53.411, -2.101]} zoom={13} scrollWheelZoom={false}>
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
        <Drop handleClick={handleClick} />
      </MapContainer>
      <Menu ref={ref} setHighestPoint={setHighestPoint} setMarkers={setMarkers} markers={markers} />
    </Layout>
  );
};

export default IndexPage;
