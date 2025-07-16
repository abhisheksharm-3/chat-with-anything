import React from "react";
import ButtonCta from "./ButtonCta";
import SectionHeader from "../shared/SectionHeader";

const Pricing = () => {
  return (
    <div
      id="pricing"
      className="flex flex-col items-center justify-center py-16 px-6 max-w-md mx-auto"
    >
      <SectionHeader subtitle="Pricing" title="One plan one price" />

      <div className="flex items-baseline justify-center mb-16 tracking-tighter">
        <span className="text-6xl md:text-8xl font-semibold">$10</span>
        <span className="text-gray-500 ml-1 text-2xl">/month</span>
      </div>

      <ul className="mb-16 w-full flex flex-col items-center  text-[#9FA9FF] ">
        <li className="flex items-center gap-3">
          <span className=" text-xl">•</span>
          <span className="">Networked note-taking</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-xl">•</span>
          <span className="">Networked note-taking</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-xl">•</span>
          <span className="">Networked note-taking</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-xl">•</span>
          <span className="">Networked note-taking</span>
        </li>
      </ul>

      <ButtonCta className="py-6" />
    </div>
  );
};

export default Pricing;
