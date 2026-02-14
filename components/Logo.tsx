
import React from 'react';

interface LogoProps {
  className?: string;
  bw?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "size-12", bw = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield Shape */}
        <path d="M50 5L15 20V45C15 67.5 50 95 50 95C50 95 85 67.5 85 45V20L50 5Z" 
          stroke={bw ? "black" : "#262262"} strokeWidth="6" fill="white"/>
        {/* Book/Open Pages Icon */}
        <path d="M30 45C30 45 40 40 50 45C60 40 70 45 70 45V65C70 65 60 60 50 65C40 60 30 65 30 65V45Z" 
          stroke={bw ? "black" : "#262262"} strokeWidth="4" strokeLinejoin="round"/>
        <line x1="50" y1="45" x2="50" y2="65" stroke={bw ? "black" : "#262262"} strokeWidth="4"/>
        {/* Decorative Torch or Pen Tip */}
        <circle cx="50" cy="30" r="5" fill={bw ? "black" : "#f9cc0b"}/>
      </svg>
      <div className="flex flex-col">
        <span className={`font-black tracking-tighter leading-none text-xl ${bw ? 'text-black' : 'text-primary'}`}>UNIVSM</span>
        <span className={`font-bold tracking-[0.2em] text-[8px] uppercase ${bw ? 'text-black' : 'text-slate-400'}`}>Sapta Mandiri</span>
      </div>
    </div>
  );
};

export default Logo;
