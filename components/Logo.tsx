import React from 'react';

interface LogoProps {
  className?: string;
  bw?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-14", bw = false }) => {
  // Gunakan ID file dari link drive Anda
  const fileId = "1EOW7ThAe7HIXfuL1R9BPxMxiCKGHc6r8";
  const logoUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative flex-shrink-0 h-full py-1">
        <img 
          src={logoUrl} 
          alt="Logo Universitas Sapta Mandiri" 
          className={`h-full w-auto object-contain transition-all ${bw ? 'grayscale contrast-125' : ''}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3070/3070014.png";
          }}
        />
      </div>
      <div className="flex flex-col justify-center">
        <span className={`font-black tracking-tight leading-none text-2xl ${bw ? 'text-black' : 'text-primary'}`}>
          UNIVSM
        </span>
        <div className="flex flex-col -mt-0.5">
          {/* Perbaikan: Menambahkan penutup </span> */}
          <span className={`font-bold tracking-[0.1em] text-[8px] uppercase ${bw ? 'text-black' : 'text-slate-500'}`}>
            Universitas Sapta Mandiri
          </span> 
        </div>
      </div>
    </div>
  );
};

export default Logo;
