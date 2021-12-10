import React, { SetStateAction } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import Button from './button';
import { useDispatch } from 'react-redux';
import { setAddingPub } from '../state/slices/pubSlice';

type InputProps = {
  name: string;
  type: 'text' | 'number';
  label: string;
  placeholder?: string;
};

const InputGroup = ({ name, type, label, placeholder }: InputProps) => {
  return (
    <div className="block w-full mb-2">
      <label className="font-bold" htmlFor={name}>
        {label}
      </label>
      <Field className="p-2" name={name} id={name} type={type} placeholder={placeholder || `Enter the pub's ${name}`} />
      <ErrorMessage name={name} render={msg => <p className="text-red-500">{msg}</p>} />
    </div>
  );
};

const AddPubForm = ({ map }: { map: Map | null }) => {
  const dispatch = useDispatch();
  const initialValues = {
    name: '',
    address: '',
    postcode: '',
    lat: 0,
    long: 0,
  };
  const schema = {
    name: Yup.string().required('Required').max(150, 'Max length 150 characters'),
    address: Yup.string().required('Required').max(150, 'Max length 150 characters'),
    postcode: Yup.string()
      .required('Required')
      .matches(/^([A-Za-z][A-HJ-Ya-hj-y]?\d[A-Za-z\d]? ?\d[A-Za-z]{2}|GIR ?0A{2})$/, 'Must be a valid postcode'),
    lat: Yup.number().required('Required, drop a marker on the approximate location!'),
    long: Yup.number().required('Required, drop a marker on the approximate location!'),
  };
  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={Yup.object(schema)}
        onSubmit={values => {
          console.log(values);
        }}
      >
        <Form>
          <InputGroup name="name" type="text" label="Name" />
          <InputGroup name="address" type="text" label="Address" />
          <InputGroup name="postcode" type="text" label="Postcode" />
        </Form>
      </Formik>
      <Button onClick={() => dispatch(setAddingPub())} label="Cancel" className="mt-auto" />
    </>
  );
};

export default AddPubForm;
