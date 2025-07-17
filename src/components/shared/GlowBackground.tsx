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
    <div className={`absolute inset-0 z-0 h-max min-h-screen overflow-hidden ${className}`}>
        {glowElements.map((glow, index) => (
          <div
            key={index}
            className={`absolute ${glow.position}`}
            style={{
              width: `${glow.size.width}px`,
              height: `${glow.size.height}px`,
              background: `radial-gradient(circle, ${glow.color} 0%, transparent 90%)`,
              filter: `blur(${glow.blur}px)`,
              transform: `translate(${index === 0 ? '-15%' : '15%'}, -50%)`,
              borderRadius: '50%'
            }}
          />
        ))}
    </div>
  );
};

export default GlowBackground;