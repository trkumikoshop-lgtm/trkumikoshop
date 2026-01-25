
import React from 'react';

interface KumikoPatternProps {
  className?: string;
  opacity?: number;
  scale?: number;
}

const KumikoPattern: React.FC<KumikoPatternProps> = ({ className, opacity = 0.1, scale = 1 }) => {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`} style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="asanoha" width={20 * scale} height={34.64 * scale} patternUnits="userSpaceOnUse" overflow="visible">
            <path 
              d="M0 0 L10 17.32 L20 0 M10 17.32 L10 34.64 M0 34.64 L10 17.32 L20 34.64 M0 0 L20 34.64 M0 34.64 L20 0 M0 17.32 L20 17.32" 
              stroke="#4A3728" 
              strokeWidth="0.5" 
              fill="none" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#asanoha)" />
      </svg>
    </div>
  );
};

export default KumikoPattern;
