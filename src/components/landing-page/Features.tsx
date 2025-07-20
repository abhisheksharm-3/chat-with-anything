import SectionHeader from "../shared/SectionHeader";
import { Card, CardFooter, CardHeader } from "../ui/card";
import GlowBackground from "../shared/GlowBackground";

/**
 * A section component for the landing page that showcases the application's key features.
 *
 * It displays a header and a responsive grid of feature cards. The content for the
 * feature cards is currently hardcoded within the component.
 *
 * @component
 * @returns {JSX.Element} The rendered features section.
 */
const Features = () => {
  return (
    <div id="features" className="relative py-32 border-b border-primary/10">
      <div className="relative z-10">
        <SectionHeader subtitle="Features" title="Experience the power of AI" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-8">
          {/* Note: Mapping over a placeholder array. Replace with dynamic data as needed. */}
          {[...Array(3)].map((_, index) => (
            <Card
              key={index}
              className="space-y-3 text-center p-6 backdrop-blur-lg bg-background/20 border-none hover:bg-background/10 transition-all duration-300 rounded-lg"
            >
              <CardHeader>
                {/* Placeholder for feature visual */}
                <div className="h-72 w-52" />
              </CardHeader>
              <CardFooter className="flex-col space-y-2">
                <h2 className="font-medium text-3xl tracking-tighter">
                  Craft together.
                </h2>
                <p className="text-white/70 text-sm leading-6">
                  Create, craft and share stories together with
                  <br />
                  real time collaboration
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <GlowBackground />
    </div>
  );
};

export default Features;
