import { Badge } from "../ui/badge";
import { LucideFileText, LucideShieldCheck, LucideBot, LucideCloudUpload, LucideMonitorSmartphone, LucideLightbulb } from "lucide-react";
import React from "react"; // Import React

/**
 * A small, reusable badge for "Coming Soon" tags.
 */
const SoonBadge = () => (
  <Badge variant="outline" className="ml-2 px-1.5 py-0.5 text-xs font-medium border-primary/50 bg-primary/10 text-primary">
    SOON
  </Badge>
);

/**
 * Actual key features of Inquora, with refined descriptions for clarity.
 */
const features = [
  {
    icon: <LucideShieldCheck />,
    title: "Secure Authentication",
    description: "Sign in with confidence using Supabase authentication. All user sessions and data are protected.",
  },
  {
    icon: <LucideFileText />,
    title: "Multi-Format Support",
    description: (
      <>
        Chat with PDFs, Office Docs, URLs, YouTube videos, and more.
        Support for Images & GitHub Repos
        <SoonBadge />
      </>
    ),
  },
  {
    icon: <LucideBot />,
    title: "AI-Powered Conversations",
    description: "Instantly extract content and search documents with our Pinecone-powered vector search and smart conversational AI.",
  },
  {
    icon: <LucideCloudUpload />,
    title: "Intuitive Uploads",
    description: "A modern drag-and-drop interface for files and a simple paste-in for URLs, making data input seamless.",
  },
  {
    icon: <LucideMonitorSmartphone />,
    title: "Modern User Interface",
    description: "Enjoy a fully responsive design, real-time updates, and a unified viewer and chat experience on any device.",
  },
  {
    icon: <LucideLightbulb />,
    title: "Real-Time Collaboration",
    description: "Live message synchronization for a seamless conversation experience, making teamwork easy and efficient.",
  },
];

/**
 * Features section for Inquora, themed to be cohesive with the hero section.
 */
const Features = () => {
  return (
    <section
      id="features"
      className="relative py-24 sm:py-32 border-b border-white/10 bg-cover bg-center"
      // Example: style={{ backgroundImage: 'url(/path/to/your/image.jpg)' }}
    >
      {/* Background Overlay for consistent theme and text visibility */}
      <div className="absolute inset-0 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Features badge */}
        <div className="mb-8 flex justify-center">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10 transition-colors"
          >
            <div className="w-2 h-2 bg-primary/80 rounded-full animate-pulse" />
            <span className="text-sm font-medium tracking-wide">Core Features</span>
          </Badge>
        </div>

        {/* Section headline */}
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-300 leading-tight tracking-tighter mb-4">
          Everything You Need to Know
        </h2>
        <p className="text-lg md:text-xl text-neutral-300 font-light mb-16 max-w-3xl mx-auto">
          Inquora combines powerful AI with an intuitive interface, giving you instant understanding of your data.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative text-center p-8 border border-white/10 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors duration-300"
            >
              <div className="flex justify-center mb-4">
                {/* Clone the icon to apply new classes */}
                {React.cloneElement(feature.icon, {
                  className: "h-9 w-9 text-primary group-hover:scale-110 transition-transform",
                })}
              </div>

              <h3 className="text-xl font-semibold mb-2 text-neutral-100">
                {feature.title}
              </h3>
              <p className="text-neutral-400 text-base font-normal leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;