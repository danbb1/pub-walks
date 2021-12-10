import React, { SetStateAction } from 'react';
import Button from './button';

const AddPubForm = ({
  map,
  setViewPubForm,
}: {
  map: Map | null;
  setViewPubForm: React.Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <>
      <form>
        <label>
          Name
          <input type="text" />
        </label>
      </form>
      <Button onClick={() => setViewPubForm(false)} label="Cancel" className='mt-auto' />
    </>
  );
};

export default AddPubForm;
