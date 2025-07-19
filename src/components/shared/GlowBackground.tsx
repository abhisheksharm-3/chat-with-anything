"use client";

import { TypeGlowProps } from "@/types/types";

/**
 * A reusable client-side component for creating soft, glowing background effects.
 *
 * It renders one or more blurred, colored radial gradients. The position, size,
 * blur, and color of each glow can be customized via the `glowElements` prop.
 *
 * @component
 * @param {TypeGlowProps} props - The properties for the component.
 * @param {string} [props.className=""] - Optional additional CSS classes to apply to the main container.
 * @param {Array<object>} [props.glowElements] - An array of objects, each defining a glow effect. Defaults to a standard two-glow setup.
 * @param {string} props.glowElements[].position - Tailwind CSS classes for positioning the glow (e.g., 'left-[20%] top-1/2').
 * @param {{width: number, height: number}} props.glowElements[].size - The width and height of the glow element in pixels.
 * @param {number} props.glowElements[].blur - The blur radius for the glow effect in pixels.
 * @param {string} props.glowElements[].color - The color of the glow, typically an rgba value.
 * @returns {JSX.Element} The rendered container with glow effects.
 */
const GlowBackground: React.FC<TypeGlowProps> = ({
  className = "",
  glowElements = [
    {
      position: "left-[20%] top-1/2",
      size: { width: 500, height: 500 },
      blur: 150,
      color: "rgba(84, 99, 255, 0.15)",
    },
    {
      position: "right-[20%] top-1/2",
      size: { width: 500, height: 500 },
      blur: 150,
      color: "rgba(84, 99, 255, 0.15)",
    },
  ],
}) => {
  return (
    <div
      className={`absolute inset-0 z-0 h-max min-h-screen overflow-hidden ${className}`}
    >
      {glowElements.map((glow, index) => (
        <div
          key={index}
          className={`absolute ${glow.position}`}
          style={{
            width: `${glow.size.width}px`,
            height: `${glow.size.height}px`,
            background: `radial-gradient(circle, ${glow.color} 0%, transparent 90%)`,
            filter: `blur(${glow.blur}px)`,
            transform: `translate(${index === 0 ? "-15%" : "15%"}, -50%)`,
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
};

export default GlowBackground;
