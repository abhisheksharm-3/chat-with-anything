"use client"

import { TypeGlowProps } from '@/types/types';
import React from 'react';

const GlowBackground: React.FC<TypeGlowProps> = ({ 
  className = "",
  glowElements = [
    {
      position: "left-[20%] top-1/2",
      size: { width: 500, height: 500 },
      blur: 150,
      color: "rgba(84, 99, 255, 0.15)"
    },
    {
      position: "right-[20%] top-1/2",
      size: { width: 500, height: 500 },
      blur: 150,
      color: "rgba(84, 99, 255, 0.15)"
    }
  ]
}) => {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden h-max ${className}`}>
      {glowElements.map((glow, index) => (
        <div
          key={index}
          className={`absolute ${glow.position} rounded-full`}
          style={{
            width: `${glow.size.width}px`,
            height: `${glow.size.height}px`,
            backgroundColor: glow.color,
            filter: `blur(${glow.blur}px)`,
            transform: `translate(${index === 0 ? '-15%' : '15%'}, -30%)`,
          }}
        />
      ))}
    </div>
  );
};

export default GlowBackground;