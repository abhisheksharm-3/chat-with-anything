import React from 'react';

const SectionHeader = ({ 
  subtitle = "FAQ", 
  title = "You might have a question?", 
  subtitleClassName = "text-primary text-center mb-4 text-2xl tracking-tight",
  titleClassName = "text-center text-4xl md:text-5xl font-semibold tracking-tighter mb-36"
}) => {
  return (
    <>
      <p className={subtitleClassName}>{subtitle}</p>
      <h1 className={titleClassName}>{title}</h1>
    </>
  );
};

export default SectionHeader;