// This component displays the pricing information for the product or service.

import React from 'react';
import { Button } from '../ui/button';
import ButtonCta from './ButtonCta';

const Pricing = () => {
  return (
    <div id='pricing' className='flex flex-col items-center justify-center py-16 px-6 max-w-md mx-auto'>
      <p className='text-purple-500 text-center mb-4'>Pricing</p>
      <h1 className='text-center text-4xl md:text-5xl font-medium mb-16'>One plan one price</h1>

      <div className='flex items-baseline justify-center mb-16'>
        <span className='text-6xl md:text-8xl font-bold'>$10</span>
        <span className='text-gray-400 ml-2'>/month</span>
      </div>

      <ul className='space-y-6 mb-16 w-full flex flex-col items-center'>
        <li className='flex items-center gap-3'>
          <span className='text-purple-500 text-xl'>•</span>
          <span className='text-gray-300'>Networked note-taking</span>
        </li>
        <li className='flex items-center gap-3'>
          <span className='text-purple-500 text-xl'>•</span>
          <span className='text-gray-300'>Networked note-taking</span>
        </li>
        <li className='flex items-center gap-3'>
          <span className='text-purple-500 text-xl'>•</span>
          <span className='text-gray-300'>Networked note-taking</span>
        </li>
        <li className='flex items-center gap-3'>
          <span className='text-purple-500 text-xl'>•</span>
          <span className='text-gray-300'>Networked note-taking</span>
        </li>
      </ul>

      <ButtonCta className='py-6' />
    </div>
  );
};

export default Pricing;
