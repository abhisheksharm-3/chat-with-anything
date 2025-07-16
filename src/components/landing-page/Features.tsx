// This component displays a list of key features or services offered by the product.
// Each feature is represented with an icon and a short description, making it easy for users to quickly understand the product's value.
// The component expects an array of features with `icon`, `title`, and `description` properties.

import React from "react";
import SectionHeader from "../shared/SectionHeader";
import { Card, CardFooter, CardHeader } from "../ui/card";

const Features = () => {
  return (
    <div id="features" className="py-32 border-b border-primary/10">
      <SectionHeader subtitle="Features" title="Experience the power of AI" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="space-y-3 text-center p-6">
            <CardHeader>
              <div className="h-72 w-52 " />
            </CardHeader>
            <CardFooter className="flex flex-col items-center space-y-2">
              <h2 className="font-medium text-3xl tracking-tighter">Craft together.</h2>
              <p className="text-gray-400 text-sm leading-6">
                Create, craft and share stories together with
                <br />
                real time collaboration
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;
