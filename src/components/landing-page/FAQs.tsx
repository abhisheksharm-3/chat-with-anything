"use client"
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Minus } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import { FaqData } from '@/constants/FaqData';
import GlowBackground from '../shared/GlowBackground';

const FAQs = () => {
  const [openAccordion, setOpenAccordion] = useState('');

  return (
    <div className="min-h-screen py-32 relative">
      <div className="mx-auto px-6 max-w-6xl relative z-10">
        <SectionHeader 
          subtitle="FAQ"
          title="You might have a question?"
        />

        <div className="border border-primary/30 rounded-lg overflow-hidden backdrop-blur-sm relative">
          
          <Accordion 
            type="single" 
            collapsible 
            className="w-full relative z-10"
            value={openAccordion}
            onValueChange={setOpenAccordion}
          >
            {FaqData.map((item) => (
              <AccordionItem 
                key={item.value} 
                value={item.value} 
              >
                <AccordionTrigger className="flex items-center gap-4 py-6 px-6 hover:bg-gray-750/30 transition-colors duration-200 [&[data-state=open]>svg]:rotate-0 [&>svg]:transition-transform [&>svg]:duration-200">
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
      
      <GlowBackground />
    </div>
  );
};

export default FAQs;