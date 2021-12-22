import React, { useState, useEffect, ChangeEvent } from 'react';
import axios, { AxiosResponse } from 'axios';
import { FeatureCollection } from 'geojson';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { LatLngTuple, Map } from 'leaflet';

import Button from './button';
import InputGroup from './inputGroup';

import { routeSelector } from '../state/store';
import { setMenu } from '../state/slices/menuSlice';

import { resetRoute, setMarkers, addMarker, removeLastMarker, setRouteDistance } from '../state/slices/routeSlice';
import { setSearchArea, resetPubs } from '../state/slices/pubSlice';

import handleRoute from '../utils/handleRoute';
import getHighestPoint from '../utils/getHighestPoint';

class DBError {
  constructor(public status: number, public message: string) {}
}

const RouteEditor = ({ map }: { map: Map | null }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const dispatch = useDispatch();

  const { markers } = useSelector(routeSelector);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!e.target.files) return;
    setSelectedFile(e.target.files[0]);
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

      if (result.data.features[0].geometry.type === 'LineString') {
        console.log(result);
        const {
          points,
          centrePoint,
          searchArea,
          routeDistance: newRouteDistance,
        } = handleRoute(result.data.features[0].geometry.coordinates as [...LatLngTuple, number][]);
        dispatch(setMarkers(points));
        dispatch(setSearchArea(searchArea));
        if (map && centrePoint) map.flyTo(centrePoint);
        dispatch(setRouteDistance(newRouteDistance));

        return null;
      }

      return null;
    } catch (err) {
      if (err instanceof DBError) {
        console.log(err.message);
        return null;
      }
    }

    return null;
  };

  return (
    <>
      <span className="font-bold mb-2">Draw a Route or Upload a GPX File</span>
      <div className="flex space-evenly items-center mb-2">
        <Button
          label="Clear"
          onClick={() => {
            dispatch(resetRoute());
            dispatch(resetPubs());
          }}
          className="mr-2"
        />
        <Button
          className="mr-2"
          label="Undo"
          onClick={() => {
            dispatch(removeLastMarker());
            if (markers?.length === 1) dispatch(resetPubs());
          }}
        />
        <Button
          className="whitespace-nowrap"
          label="Close Path"
          onClick={() => (markers ? dispatch(addMarker(markers[0])) : null)}
        />
      </div>
      <form onSubmit={handleUpload} className="flex">
        <input className="mb-2 w-full" type="file" name="file" onChange={handleChange} />
        <Button submit label="Upload" />
      </form>
    </>
  );
};

const AddRouteForm = ({ map }: { map: Map | null }) => {
  const [routeError, setRouteError] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const dispatch = useDispatch();

  const initialValues = {
    name: '',
    description: '',
  };

  const schema = {
    name: Yup.string().required('Required').max(150, 'Max length 150 characters'),
    description: Yup.string().required('Required').max(10000, 'Max length 10000 characters'),
  };

  const { markers, routeDistance } = useSelector(routeSelector);

  useEffect(() => {
    if (markers) setRouteError(false);
  }, [markers]);

  return (
    <>
      {!notification ? (
        <>
          <RouteEditor map={map} />
          <Formik
            initialValues={initialValues}
            validationSchema={Yup.object(schema)}
            onSubmit={async values => {
              if (!markers) {
                setRouteError(true);
              } else {
                try {
                  const highestPoint = await getHighestPoint(markers);

                  const newValues = { ...values, markers, distance: routeDistance, highestPoint };
                  await axios.post('/.netlify/functions/add-route', newValues);
                  setNotification('Route added succesfully');
                } catch (err) {
                  setNotification('Oops, something went wrong.');
                }
              }
            }}
          >
            <Form className="w-full">
              <InputGroup name="name" type="text" label="Name" placeholder="Enter a name for the route" />
              <span>Distance: {routeDistance?.toFixed(2) || 0}km</span>
              <InputGroup
                name="description"
                type="text"
                as="textarea"
                label="Description"
                placeholder="Enter a description of the route"
              />
              {routeError && <p className="text-red-500">A Route is Required</p>}
              <Button label="Save Route" submit />
            </Form>
          </Formik>
        </>
      ) : (
        <p>{notification}</p>
      )}
      <Button
        onClick={() => {
          setNotification(null);
          dispatch(setMenu('MAIN'));
          dispatch(resetRoute());
          dispatch(resetPubs());
        }}
        label="Cancel"
        className="mt-auto"
      />
    </>
  );
};

export default AddRouteForm;
