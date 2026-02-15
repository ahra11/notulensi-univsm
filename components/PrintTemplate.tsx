import React from 'react';
import { Minute } from '../types';

const PrintTemplate: React.FC<{ data: Minute }> = ({ data }) => {
  // Logika Nomor Surat Romawi
  const date = new Date(data.date);
  const months = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const romanMonth = months[date.getMonth()] || "I";
  const formattedId = String(data.id || "0").padStart(3, '0');

  return (
    <div className="bg-white min-h-screen text-black font-serif p-0 print:m-0">
      <div className="p-12 flex flex-col min-h-screen">
        
        {/* KOP SURAT YAYASAN RESMI - VERSI FIX */}
        <div className="flex flex-col items-center border-b-[4px] border-black pb-1 mb-1">
          <div className="flex w-full items-center">
            <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center">
               <img src="/logo-usm.png" alt="Logo USM" className="w-24 h-24 object-contain" />
            </div>
            <div className="flex-1 text-center pr-12">
              <h3 className="text-[16pt] font-bold leading-tight uppercase">YAYASAN SAPTA BAKTI PENDIDIKAN</h3>
              <h1 className="text-[24pt] font-black leading-none uppercase tracking-tighter">UNIVERSITAS SAPTA MANDIRI</h1>
              <h2 className="text-[14pt] font-bold leading-tight uppercase mt-1">SK Pendirian No. 661 / E / O / 2024</h2>
              <div className="mt-2 text-[9pt] leading-tight font-normal italic">
                <p>Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
                <p>Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
                <p>Telp/Fax (0526) 209 5962 | CP: 0877 7687 7462 | www.univsm.ac.id</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-black h-1 w-full mb-8"></div>

        {/* JUDUL DAN NOMOR SURAT */}
        <div className="text-center mb-8">
          <h2 className="text-[18pt] font-bold uppercase underline underline-offset-8">NOTULENSI RAPAT</h2>
          <p className="text-[11pt] mt-4 font-bold tracking-widest">
            Nomor: {formattedId}/NOT/REK/{romanMonth}/2026
          </p>
        </div>

        {/* ISI PEMBAHASAN */}
        <div className="mt-4 ml-10 mr-10 flex-grow text-[11pt]">
          <div className="grid grid-cols-[180px_20px_1fr] mb-4">
            <span className="font-bold">Nama Kegiatan</span><span>:</span><span className="font-bold uppercase">{data.title}</span>
          </div>
          <h3 className="font-bold uppercase mb-2">HASIL PEMBAHASAN:</h3>
          <div className="text-justify whitespace-pre-wrap leading-relaxed">{data.content}</div>
        </div>

        {/* AREA TANDA TANGAN KOSONG - HANYA GARIS */}
        <div className="mt-20 grid grid-cols-2 text-center text-[11pt]">
          <div className="flex flex-col items-center">
            <p className="mb-28 uppercase font-bold text-transparent print:text-black">Notulis,</p>
            <p className="font-bold underline uppercase">( __________________________ )</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-4">Paringin, {data.date}</p>
            <p className="mb-20 font-bold uppercase leading-tight">Mengesahkan,<br/>Rektor</p>
            <p className="font-bold underline uppercase">( __________________________ )</p>
            <p className="text-[10pt] mt-1 font-bold">ABDUL HAMID, S.Kom., M.M., M.Kom</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
