import React, { MouseEventHandler } from 'react';

const Button = ({
  label,
  onClick,
  submit,
  className = '',
}: {
  label: string;
  submit?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}) => (
  <button
    className={`${className} py-2 px-8 rounded-md bg-gray-300 hover:bg-white hover:text-black text-center transition duration-500 ease-in-out`}
    type={submit ? 'submit' : 'button'}
    onClick={onClick}
  >
    {label}
  </button>
);

export default Button;
