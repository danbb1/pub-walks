import React, { ChangeEvent, FormEventHandler, useState, useRef } from 'react';
import axios from 'axios';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvent, Tooltip } from 'react-leaflet';
import { LeafletMouseEvent, LatLngExpression, LatLngTuple } from 'leaflet';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Button from '../components/button';

const Drop = ({ handleClick }) => {
  useMapEvent('click', e => {
    handleClick(e);
  });

  return null;
};

const IndexPage = () => {
  const [markers, setMarkers] = useState<LatLngTuple[] | []>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [highestPoint, setHighestPoint] = useState<LatLngExpression | null>(null);
  const handleClick = (e: LeafletMouseEvent) => {
    setMarkers([...markers, [e.latlng.lat, e.latlng.lng]]);
  };

  const map = useRef(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setSelectedFile(e.target.files[0]);
  };

  const handleFlyTo = destination => {
    console.log(map)
    // map.setView(destination);
  };

  const handleUpload = async (e: Event) => {
    e.preventDefault();
    if (!selectedFile || selectedFile.type !== 'application/gpx+xml') return alert('Must be a gpx file');

    const formData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);

    const result = await axios.post('/.netlify/functions/handle-file', formData);

    console.log(result.data);
    let x = 0;
    let y = 0;
    let z = 0;
    let highestElevation = 0;
    const points = result.data.features[0].geometry.coordinates.map(coord => {
      const lat = (coord[1] * Math.PI) / 180;
      const long = (coord[0] * Math.PI) / 180;
      x += Math.cos(lat) * Math.cos(long);
      y += Math.cos(lat) * Math.sin(long);
      z += Math.sin(lat);
      if (coord[2] > highestElevation) {
        [, , highestElevation] = coord;
        setHighestPoint([coord[1], coord[0], coord[2]]);
      }
      return [coord[1], coord[0]];
    });
    setMarkers(points);
    x /= points.length;
    y /= points.length;
    z /= points.length;

    const centreLong = Math.atan2(y, x);
    const centreSqrt = Math.sqrt(x * x + y * y);
    const centreLat = Math.atan2(z, centreSqrt);

    const centrePoint = [(centreLat * 180) / Math.PI, (centreLong * 180) / Math.PI];

    console.log(centrePoint);
    handleFlyTo(centrePoint);
  };

  return (
    <Layout>
      <Seo title="Home" />
      <MapContainer
        ref={map}
        className="h-96 w-10/12 mx-auto"
        center={[53.411, -2.101]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* {markers.map((coord, index) => {
          const distance = 0.00051;

          const pos: LatLngExpression[][] = [
            [
              [coord[1] - distance, coord[0] - distance],
              [coord[1] + distance, coord[0] + distance],
            ],
            [
              [coord[1] + distance, coord[0] - distance],
              [coord[1] - distance, coord[0] + distance],
            ],
          ];

          let color = 'blue';
          if (index === 0) color = 'green';
          if (index === markers.length - 1) color = 'red';

          return <Polyline key={`${coord}-${color}`} pathOptions={{ color }} positions={pos} />;
        })} */}
        {highestPoint && (
          <Marker position={[highestPoint[0], highestPoint[1]]}>
            <Tooltip>Highest Point: {Math.round(highestPoint[2])}m</Tooltip>
          </Marker>
        )}
        {markers && <Polyline positions={markers} />}
        <Drop handleClick={handleClick} />
      </MapContainer>
      <Button label="Clear" onClick={() => setMarkers([])} className="mr-2" />
      <Button
        className="mr-2"
        label="Undo"
        onClick={() => {
          const newMarkers = markers.filter((_marker, index) => (index === markers.length - 1 ? null : _marker));
          setMarkers(newMarkers);
        }}
      />
      <Button label="Close Path" onClick={() => setMarkers([...markers, markers[0]])} />
      <form onSubmit={handleUpload}>
        <input type="file" name="file" onChange={handleChange} />
        <Button submit label="Upload" />
      </form>
    </Layout>
  );
};

export default IndexPage;
