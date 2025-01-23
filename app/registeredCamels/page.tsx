import React from 'react';
import Nav from '@/components/Navigation/Nav';
import { RegisteredCamelsOut } from '@/components/RegisteredCamelsOut';
const Page = () => {
  return (
    <>
      <Nav />
      <div className=''>
        <RegisteredCamelsOut />
      </div>
    </>
  );
};

export default Page;