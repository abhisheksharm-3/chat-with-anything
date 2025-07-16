// Reusable glow effect component that can be used anywhere
// Provides customizable glow intensity, color, and positioning

import { cn } from '@/utils/utils';

interface GlowEffectProps {
  className?: string;
  color?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  variant?: 'centered' | 'scattered' | 'minimal';
}

const GlowEffect = ({ 
  className, 
  color = '#5463FF', 
  intensity = 'medium',
  variant = 'centered' 
}: GlowEffectProps) => {
  const getIntensitySettings = () => {
    switch (intensity) {
      case 'subtle':
        return {
          mainOpacity: 'opacity-30',
          secondaryOpacity: 'opacity-20',
          accentOpacity: 'opacity-25',
          edgeOpacity: 'opacity-[0.02]',
          mainAlpha: '33',
          secondaryAlpha: '4D',
          accentAlpha: '26',
          edgeAlpha: '0D'
        };
      case 'strong':
        return {
          mainOpacity: 'opacity-80',
          secondaryOpacity: 'opacity-60',
          accentOpacity: 'opacity-70',
          edgeOpacity: 'opacity-[0.08]',
          mainAlpha: '4D',
          secondaryAlpha: '66',
          accentAlpha: '33',
          edgeAlpha: '14'
        };
      default: // medium
        return {
          mainOpacity: 'opacity-60',
          secondaryOpacity: 'opacity-40',
          accentOpacity: 'opacity-50',
          edgeOpacity: 'opacity-[0.05]',
          mainAlpha: '33',
          secondaryAlpha: '4D',
          accentAlpha: '26',
          edgeAlpha: '0D'
        };
    }
  };

  const settings = getIntensitySettings();

  const renderCenteredGlow = () => (
    <>
      {/* Main central glow */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] ${settings.mainOpacity}`}
        style={{ backgroundColor: `${color}${settings.mainAlpha}` }}
      />
      
      {/* Secondary glow layers for depth */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[80px] ${settings.secondaryOpacity}`}
        style={{ backgroundColor: `${color}${settings.secondaryAlpha}` }}
      />

      {/* Accent glows */}
      <div 
        className={`absolute top-[20%] left-[20%] w-[200px] h-[200px] rounded-full blur-[60px] ${settings.accentOpacity}`}
        style={{ backgroundColor: `${color}${settings.accentAlpha}` }}
      />
      <div 
        className={`absolute bottom-[30%] right-[25%] w-[150px] h-[150px] rounded-full blur-[50px] ${settings.accentOpacity}`}
        style={{ backgroundColor: `${color}${settings.accentAlpha}` }}
      />
      
      {/* Subtle edge glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b to-transparent"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, ${color}${settings.edgeAlpha}, transparent)` 
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t to-transparent"
        style={{ 
          backgroundImage: `linear-gradient(to top, ${color}${settings.edgeAlpha}, transparent)` 
        }}
      />
    </>
  );

  const renderScatteredGlow = () => (
    <>
      {/* Multiple scattered glows */}
      <div 
        className={`absolute top-[15%] left-[15%] w-[300px] h-[300px] rounded-full blur-[100px] ${settings.mainOpacity}`}
        style={{ backgroundColor: `${color}${settings.mainAlpha}` }}
      />
      <div 
        className={`absolute top-[60%] right-[20%] w-[250px] h-[250px] rounded-full blur-[90px] ${settings.secondaryOpacity}`}
        style={{ backgroundColor: `${color}${settings.secondaryAlpha}` }}
      />
      <div 
        className={`absolute bottom-[15%] left-[40%] w-[200px] h-[200px] rounded-full blur-[70px] ${settings.accentOpacity}`}
        style={{ backgroundColor: `${color}${settings.accentAlpha}` }}
      />
      <div 
        className={`absolute top-[40%] left-[5%] w-[150px] h-[150px] rounded-full blur-[60px] ${settings.accentOpacity}`}
        style={{ backgroundColor: `${color}${settings.accentAlpha}` }}
      />
    </>
  );

  const renderMinimalGlow = () => (
    <>
      {/* Single subtle central glow */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] ${settings.mainOpacity}`}
        style={{ backgroundColor: `${color}${settings.mainAlpha}` }}
      />
      
      {/* Subtle ambient glow */}
      <div 
        className="absolute inset-0 bg-gradient-to-br to-transparent"
        style={{ 
          backgroundImage: `linear-gradient(to bottom right, ${color}${settings.edgeAlpha}, transparent)` 
        }}
      />
    </>
  );

  const renderGlowVariant = () => {
    switch (variant) {
      case 'scattered':
        return renderScatteredGlow();
      case 'minimal':
        return renderMinimalGlow();
      default:
        return renderCenteredGlow();
    }
  };

  return (
    <div className={cn("absolute inset-0 z-0", className)}>
      {renderGlowVariant()}
    </div>
  );
};

export default GlowEffect;