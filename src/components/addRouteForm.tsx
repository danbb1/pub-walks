import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';

import Button from './button';
import InputGroup from './inputGroup';

import { routeSelector } from '../state/store';
import { setMenu } from '../state/slices/menuSlice';

const AddRouteForm = () => {
  const [routeError, setRouteError] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const dispatch = useDispatch();
  const initialValues = {
    name: '',
    address: '',
    postcode: '',
  };
  const schema = {
    name: Yup.string().required('Required').max(150, 'Max length 150 characters'),
    description: Yup.string().required('Required').max(10000, 'Max length 10000 characters'),
  };
  const { markers } = useSelector(routeSelector);

  useEffect(() => {
    if (markers) setRouteError(false);
  }, [markers]);

  return (
    <>
      {!notification ? (
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object(schema)}
          onSubmit={async values => {
            if (!markers) {
              setRouteError(true);
            } else {
              const newValues = { ...values, markers };
              try {
                await axios.post('/.netlify/functions/add-route', newValues);
                setNotification('Route added succesfully');
              } catch (err) {
                setNotification('Oops, something went wrong.');
              }
            }
          }}
        >
          <Form>
            <InputGroup name="name" type="text" label="Name" />
            <InputGroup name="description" type="text" as="textarea" label="Description" />
            {routeError && <p className="text-red-500">Required</p>}
            <Button label="Add Pub" submit />
          </Form>
        </Formik>
      ) : (
        <p>{notification}</p>
      )}
      <Button
        onClick={() => {
          setNotification(null);
          dispatch(setMenu('MAIN'));
        }}
        label="Cancel"
        className="mt-auto"
      />
    </>
  );
};

export default AddRouteForm;
