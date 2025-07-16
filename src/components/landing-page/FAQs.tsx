"use client"
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Minus } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';

const accordionData = [
  {
    value: '0',
    question: 'How does the application function',
    answer: 'Our application uses advanced algorithms to process your data and provide meaningful insights. It integrates seamlessly with your existing workflow and provides real-time analytics.',
  },
  {
    value: '1',
    question: 'How does the application function',
    answer: 'Our application uses advanced algorithms to process your data and provide meaningful insights. It integrates seamlessly with your existing workflow and provides real-time analytics.',
  },
  {
    value: '2',
    question: 'How does the application function',
    answer: 'Our application uses advanced algorithms to process your data and provide meaningful insights. It integrates seamlessly with your existing workflow and provides real-time analytics.',
  },
  {
    value: '3',
    question: 'How does the application function',
    answer: 'Our application uses advanced algorithms to process your data and provide meaningful insights. It integrates seamlessly with your existing workflow and provides real-time analytics.',
  },
  {
    value: '4',
    question: 'How does the application function',
    answer: 'Our application uses advanced algorithms to process your data and provide meaningful insights. It integrates seamlessly with your existing workflow and provides real-time analytics.',
  },
];

const FAQs = () => {
  const [openAccordion, setOpenAccordion] = useState('');

  return (
    <div className="min-h-screen py-32">
      <div className="mx-auto px-6 max-w-6xl">
        <SectionHeader 
          subtitle="FAQ"
          title="You might have a question?"
        />
        
        <div className="border border-primary/30 rounded-lg overflow-hidden backdrop-blur-sm">
          <Accordion 
            type="single" 
            collapsible 
            className="w-full"
            value={openAccordion}
            onValueChange={setOpenAccordion}
          >
            {accordionData.map((item) => (
              <AccordionItem 
                key={item.value} 
                value={item.value} 
              >
                <AccordionTrigger className="flex items-center gap-4 py-6 px-6 hover:bg-gray-750 transition-colors duration-200 [&[data-state=open]>svg]:rotate-0 [&>svg]:transition-transform [&>svg]:duration-200">
                  <div className="flex items-center gap-12 flex-1">
                    <div className="flex-shrink-0">
                      {openAccordion === item.value ? (
                        <Minus className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <span className="text-lg font-normal text-left">
                      {item.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pl-16 text-gray-400 text-base leading-relaxed">
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