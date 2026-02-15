import React from 'react';

const PrintTemplate: React.FC<{ data: any }> = ({ data }) => {
  const date = new Date(data.date || Date.now());
  const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const romanMonth = romanMonths[date.getMonth()];
  const formattedId = String(data.id || "0").padStart(3, '0');

  return (
    <div className="bg-white min-h-screen text-black font-serif p-0">
      <div className="p-12 flex flex-col min-h-screen">
        
        {/* KOP SURAT YAYASAN RESMI - GARIS TEBAL */}
        <div className="flex flex-col items-center border-b-[4px] border-black pb-1">
          <div className="flex w-full items-center">
            <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center font-sans font-bold text-3xl border-2 border-black">
              USM
            </div>
            <div className="flex-1 text-center pr-12">
              <h3 className="text-[16pt] font-bold leading-tight uppercase">YAYASAN SAPTA BAKTI PENDIDIKAN</h3>
              <h1 className="text-[24pt] font-black leading-none uppercase tracking-tighter">UNIVERSITAS SAPTA MANDIRI</h1>
              <h2 className="text-[14pt] font-bold leading-tight uppercase mt-1">SK Pendirian No. 661 / E / O / 2024</h2>
              <div className="mt-2 text-[8pt] leading-tight font-normal italic">
                <p>Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
                <p>Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
                <p>Telp/Fax (0526) 209 5962 | CP: 0877 7687 7462 | www.univsm.ac.id</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-black h-1 w-full mb-8"></div>

        {/* NOMOR SURAT OTOMATIS */}
        <div className="text-center mb-10">
          <h2 className="text-[18pt] font-bold uppercase underline underline-offset-8">NOTULENSI RAPAT</h2>
          <p className="text-[11pt] mt-4 font-bold">Nomor: {formattedId}/NOT/REK/{romanMonth}/2026</p>
        </div>

        {/* HASIL PEMBAHASAN */}
        <div className="flex-grow ml-10 mr-10">
          <div className="grid grid-cols-[180px_20px_1fr] mb-6 text-[11pt]">
            <span className="font-bold">Nama Kegiatan</span><span>:</span><span className="font-bold uppercase">{data.title}</span>
          </div>
          <h3 className="font-bold uppercase text-[11pt] mb-4">HASIL PEMBAHASAN:</h3>
          <div className="text-justify text-[11pt] leading-relaxed whitespace-pre-wrap">{data.content}</div>
        </div>

        {/* AREA TTD KOSONG (WAJIB MANUAL) */}
        <div className="mt-20 grid grid-cols-2 text-center text-[11pt]">
          <div className="flex flex-col items-center">
            <p className="mb-28 font-bold">Notulis / Pelaksana,</p>
            <p className="font-bold underline uppercase">( __________________________ )</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-4">Paringin, {data.date}</p>
            <p className="mb-20 font-bold uppercase leading-tight">Mengesahkan,<br/>Rektor Universitas Sapta Mandiri</p>
            <p className="font-bold underline uppercase">( __________________________ )</p>
            <p className="text-[10pt] mt-1 font-bold">ABDUL HAMID, S.Kom., M.M., M.Kom</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
