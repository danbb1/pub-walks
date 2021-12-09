import React, { useState, ChangeEvent } from 'react';
import axios, { AxiosResponse } from 'axios';
import { LatLngExpression, LatLngTuple } from 'leaflet';
import { FeatureCollection } from 'geojson';
import Button from './button';

const getCentrePoint = (x: number, y: number, z: number): LatLngExpression => {
  const centreLong = Math.atan2(y, x);
  const centreSqrt = Math.sqrt(x * x + y * y);
  const centreLat = Math.atan2(z, centreSqrt);

  return [(centreLat * 180) / Math.PI, (centreLong * 180) / Math.PI];
};

const Menu = ({
  setMarkers,
  setHighestPoint,
  markers,
}: {
  markers: LatLngTuple[];
  setMarkers: React.Dispatch<React.SetStateAction<LatLngTuple[]>>;
  setHighestPoint: React.Dispatch<React.SetStateAction<LatLngTuple[]>>;
}) => {
  const [viewMenu, setViewMenu] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!e.target.files) return;
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile || selectedFile.type !== 'application/gpx+xml') return alert('Must be a gpx file');

    const formData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);

    const result: AxiosResponse<FeatureCollection, PromiseRejectedResult> = await axios.post(
      '/.netlify/functions/handle-file',
      formData,
    );

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

    const newCentrePoint = getCentrePoint(x, y, z);

    console.log(newCentrePoint);
  };
  return (
    <div>
      <div style={{ zIndex: 2000 }} className="fixed top-0 right-0">
        <Button label="View Menu" onClick={() => setViewMenu(!viewMenu)} />
      </div>

      {viewMenu && (
        <div
          style={{ zIndex: 1000 }}
          className="fixed right-0 top-0 bottom-0 flex flex-col items-center w-min py-12 px-4 z-10 bg-gray-100 bg-opacity-60"
        >
          <Button label="Clear" onClick={() => setMarkers([])} className="mb-2" />
          <Button
            className="mb-2"
            label="Undo"
            onClick={() => {
              const newMarkers = markers.filter((_marker, index) => (index === markers.length - 1 ? null : _marker));
              setMarkers(newMarkers);
            }}
          />
          <Button
            className="mb-2 whitespace-nowrap"
            label="Close Path"
            onClick={() => setMarkers([...markers, markers[0]])}
          />
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
