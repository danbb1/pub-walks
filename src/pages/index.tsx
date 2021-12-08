import React, { useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvent } from 'react-leaflet';
import { LeafletMouseEvent, LatLngExpression, marker } from 'leaflet';

import Layout from '../components/layout';
import Seo from '../components/seo';

const Drop = ({ handleClick }) => {
  useMapEvent('click', e => {
    handleClick(e);
  });

  return null;
};

const IndexPage = () => {
  const [markers, setMarkers] = useState<LatLngExpression[] | []>([]);
  const handleClick = (e: LeafletMouseEvent) => {
    setMarkers([...markers, [e.latlng.lat, e.latlng.lng]]);
  };

  return (
    <Layout>
      <Seo title="Home" />
      <MapContainer className="h-96 w-10/12 mx-auto" center={[53.411, -2.101]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(coord => (
          <Marker position={coord} />
        ))}
        {markers && <Polyline positions={markers} />}
        <Drop handleClick={handleClick} />
      </MapContainer>
      <button type="button" onClick={() => setMarkers([])}>
        Clear
      </button>
      <button
        type="button"
        onClick={() => {
          const newMarkers = markers.filter((_marker, index) => (index === markers.length - 1 ? null : _marker));
          setMarkers(newMarkers);
        }}
      >
        Undo
      </button>
      <button type="button" onClick={() => setMarkers([...markers, markers[0]])}>
        Close Path
      </button>
    </Layout>
  );
};

export default IndexPage;
