// This component is used to display a list of frequently asked questions and their answers.
// This component is typically used in sections like 'Help' or 'Support' to assist users in finding quick answers.
// The FAQ data is expected to be passed as a prop in the form of an array of {question, answer} objects.

'use client';
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PlusIcon from '@/assets/icons/PlusIcon';
import MinusIcon from '@/assets/icons/MinusIcon';
import { cn } from '@/utils/utils';

const accordionData = [
  {
    value: '0',
    question: 'How does the application function',
    answer: 'Our application uses advanced algorithms to process your data and provide meaningful insights.',
  },
  {
    value: '1',
    question: 'How does the application function',
    answer: 'Our application uses advanced algorithms to process your data and provide meaningful insights.',
  },
  {
    value: '2',
    question: 'How does the application function',
    answer: 'Our application uses advanced algorithms to process your data and provide meaningful insights.',
  },
  {
    value: '3',
    question: 'How does the application function',
    answer: 'Our application uses advanced algorithms to process your data and provide meaningful insights.',
  },
  {
    value: '4',
    question: 'How does the application function',
    answer: 'Our application uses advanced algorithms to process your data and provide meaningful insights.',
  },
];

const FAQs = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (value: string) => {
    setOpenAccordion(value === openAccordion ? null : value);
  };

  return (
    <div id='faq' className='py-16'>
      <div className='max-w-4xl mx-auto px-6'>
        <p className='text-purple-500 text-center mb-4'>FAQ</p>
        <h1 className='text-center text-4xl md:text-5xl font-medium mb-16'>You might have a question?</h1>
        
        <div className='border border-gray-800 rounded-lg overflow-hidden'>
          <Accordion type='single' collapsible className='w-full'>
            {accordionData.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={item.value} 
                className={cn(
                  'border-b border-gray-800 last:border-b-0',
                )}
              >
                <AccordionTrigger 
                  onClick={() => toggleAccordion(item.value)}
                  className='flex items-center gap-4 py-4 px-6'
                >
                  <div className='flex items-center gap-4'>
                    <span className="flex-shrink-0">
                      {openAccordion === item.value ? <MinusIcon /> : <PlusIcon />}
                    </span>
                    <span className="text-base md:text-lg font-normal">{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent
                  className={cn(
                    'text-gray-400 text-base font-normal pl-16 pr-6'
                  )}
                >
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
