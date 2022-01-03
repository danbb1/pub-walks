/* eslint-disable react/require-default-props */
import React, { MouseEventHandler } from 'react';

const Button = ({
  label,
  onClick,
  submit,
  className = '',
  disabled = false,
}: {
  label: string | Element;
  submit?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}) => (
  <button
    disabled={disabled}
    className={`${className} py-1 px-4 rounded-md bg-gray-300 hover:bg-white hover:text-black text-center transition duration-500 ease-in-out disabled:cursor-not-allowed`}
    type={submit ? 'submit' : 'button'}
    onClick={onClick}
  >
    {label}
  </button>
);

export default Button;
