import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';

import Button from './button';
import InputGroup from './inputGroup';
import { setNewPubMarker } from '../state/slices/pubSlice';
import { pubsSelector } from '../state/store';
import { setMenu } from '../state/slices/menuSlice';

const AddPubForm = () => {
  const [markerError, setMarkerError] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const dispatch = useDispatch();
  const initialValues = {
    name: '',
    address: '',
    postcode: '',
  };
  const schema = {
    name: Yup.string().required('Required').max(150, 'Max length 150 characters'),
    address: Yup.string().required('Required').max(150, 'Max length 150 characters'),
    postcode: Yup.string()
      .required('Required')
      .matches(/^([A-Za-z][A-HJ-Ya-hj-y]?\d[A-Za-z\d]? ?\d[A-Za-z]{2}|GIR ?0A{2})$/, 'Must be a valid postcode'),
  };
  const { newPubMarker } = useSelector(pubsSelector);

  useEffect(() => {
    if (newPubMarker) setMarkerError(false);
  }, [newPubMarker]);

  return (
    <>
      {!notification ? (
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object(schema)}
          onSubmit={async values => {
            if (!newPubMarker) {
              setMarkerError(true);
            } else {
              const newValues = { ...values, lat: newPubMarker[0], long: newPubMarker[1] };
              try {
                await axios.post('/.netlify/functions/add-pub', newValues);
                setNotification('Pub added succesfully');
              } catch (err) {
                setNotification('Oops, something went wrong.');
              }
            }
          }}
        >
          <Form>
            <InputGroup name="name" type="text" label="Name" />
            <InputGroup name="address" type="text" label="Address" />
            <InputGroup name="postcode" type="text" label="Postcode" />
            <span className="block font-bold mb-2">New Pub Marker</span>
            <span className="block mb-2">
              {newPubMarker
                ? `Latitude: ${newPubMarker[0].toFixed(2)}, Longitude: ${newPubMarker[1].toFixed(2)}`
                : 'Drop a marker at the approximate location of the pub'}
            </span>
            {markerError && <p className="text-red-500">Required</p>}
            <Button label="Add Pub" submit />
          </Form>
        </Formik>
      ) : (
        <p>{notification}</p>
      )}
      <Button
        onClick={() => {
          dispatch(setNewPubMarker(null));
          setNotification(null);
          dispatch(setMenu('MAIN'))
        }}
        label="Cancel"
        className="mt-auto"
      />
    </>
  );
};

export default AddPubForm;
