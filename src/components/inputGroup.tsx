import React from 'react';
import { Field, ErrorMessage } from 'formik';

type InputProps = {
  name: string;
  type: 'text' | 'number';
  label: string;
  placeholder?: string;
  as?: 'textarea';
};

const InputGroup = ({ name, type, label, placeholder, as }: InputProps) => {
  return (
    <div className="block w-full mb-2">
      <label className="font-bold" htmlFor={name}>
        {label}
      </label>
      <Field
        className="p-2"
        name={name}
        id={name}
        type={type}
        placeholder={placeholder || `Enter the pub's ${name}`}
        as={as}
      />
      <ErrorMessage name={name} render={msg => <p className="text-red-500">{msg}</p>} />
    </div>
  );
};

export default InputGroup;
