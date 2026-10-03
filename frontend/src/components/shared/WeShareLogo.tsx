import React from 'react';
import { Link } from 'react-router-dom';

interface WeShareLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  tagline?: string;
  asLink?: boolean;
}

export const WeShareLogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6366F1] via-[#7C3AED] to-[#8B70DF] text-white shadow-md shadow-[#6366F1]/30 flex-shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[72%] h-[72%]"
      >
        {/* Center Node */}
        <circle cx="20" cy="20" r="5.2" fill="white" />

        {/* 5 Outer Nodes with radiating stems (at 0, 72, 144, 216, 288 degrees) */}
        {/* Top Node (angle = -90 deg / 270 deg) */}
        <line x1="20" y1="20" x2="20" y2="7.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="20" cy="7.5" r="3.8" fill="white" />

        {/* Top-Right Node (angle = -18 deg) */}
        <line x1="20" y1="20" x2="31.8" y2="16.2" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="31.8" cy="16.2" r="3.8" fill="white" />

        {/* Bottom-Right Node (angle = 54 deg) */}
        <line x1="20" y1="20" x2="27.3" y2="30.1" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="27.3" cy="30.1" r="3.8" fill="white" />

        {/* Bottom-Left Node (angle = 126 deg) */}
        <line x1="20" y1="20" x2="12.7" y2="30.1" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="12.7" cy="30.1" r="3.8" fill="white" />

        {/* Top-Left Node (angle = 198 deg) */}
        <line x1="20" y1="20" x2="8.2" y2="16.2" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="8.2" cy="16.2" r="3.8" fill="white" />
      </svg>
    </div>
  );
};

export const WeShareLogo: React.FC<WeShareLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  tagline = 'Mindful Social Network',
  asLink = true,
}) => {
  const iconSize = size === 'sm' ? 30 : size === 'lg' ? 44 : 38;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <WeShareLogoMark size={iconSize} />
      <div className="flex flex-col">
        <span
          className={`font-heading font-extrabold ${textSize} tracking-tight bg-gradient-to-r from-[#1E293B] via-[#4C1D95] to-[#7C3AED] dark:from-[#FFFFFF] dark:via-[#E0E7FF] dark:to-[#A78BFA] bg-clip-text text-transparent`}
        >
          WeShare
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 tracking-tight">
            {tagline}
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
