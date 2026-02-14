
import React from 'react';

interface LogoProps {
  className?: string;
  bw?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "size-12", bw = false }) => {
  // URL Logo Resmi dari website univsm.ac.id
  const logoUrl = "https://univsm.ac.id/wp-content/uploads/2023/08/cropped-logo-univsm-1.png";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <img 
          src={logoUrl} 
          alt="Logo Universitas Sapta Mandiri" 
          className={`h-full w-auto object-contain ${bw ? 'grayscale' : ''}`}
          onError={(e) => {
            // Fallback jika hotlink bermasalah (menggunakan icon standar)
            (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3070/3070014.png";
          }}
        />
      </div>
      <div className="flex flex-col">
        <span className={`font-black tracking-tighter leading-none text-xl ${bw ? 'text-black' : 'text-primary'}`}>UNIVSM</span>
        <span className={`font-bold tracking-[0.1em] text-[7px] uppercase ${bw ? 'text-black' : 'text-slate-400'}`}>Universitas Sapta Mandiri</span>
      </div>
    </div>
  );
};

export default Logo;
