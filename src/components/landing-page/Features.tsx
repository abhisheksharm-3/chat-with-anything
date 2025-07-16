// This component displays a list of key features or services offered by the product.
// Each feature is represented with an icon and a short description, making it easy for users to quickly understand the product's value.
// The component expects an array of features with `icon`, `title`, and `description` properties.

import React from 'react';

const Features = () => {
  return (
    <div id='features' className='py-32 border-b border-primary/10'>
      <div className='space-y-6 px-4 mb-16'>
        <p className='text-center text-purple-500 font-medium'>Features</p>
        <h1 className='text-center text-5xl md:text-[56px] font-medium leading-tight text-white'>
          Experience the power of AI
        </h1>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-8'>
        {[...Array(3)].map((_, index) => (
          <div key={index} className='text-white space-y-3 text-center p-6'>
            <div className='bg-[#111827] rounded-lg aspect-square w-full mb-8'></div>
            <h2 className='text-2xl font-bold'>Craft together.</h2>
            <p className='text-gray-400 text-sm leading-6'>
              Create, craft and share stories together with<br />real time collaboration
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
