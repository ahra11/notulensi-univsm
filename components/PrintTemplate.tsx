import React from 'react';
import { Minute } from '../types';

const PrintTemplate: React.FC<{ data: Minute }> = ({ data }) => {
  return (
    <div className="p-8 bg-white min-h-screen text-black font-serif print:p-0">
      {/* KOP SURAT RESMI SESUAI GAMBAR */}
      <div className="flex flex-col items-center border-b-[3px] border-black pb-1 mb-0.5">
        <div className="flex w-full items-center">
          {/* Logo Universitas di sebelah kiri */}
          <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center">
             <img src="/logo-usm.png" alt="Logo USM" className="w-24 h-24 object-contain" />
          </div>
          
          <div className="flex-1 text-center pr-10">
            <h3 className="text-[16pt] font-bold leading-tight uppercase">YAYASAN SAPTA BAKTI PENDIDIKAN</h3>
            <h1 className="text-[24pt] font-black leading-none uppercase tracking-tighter">UNIVERSITAS SAPTA MANDIRI</h1>
            <h2 className="text-[14pt] font-bold leading-tight uppercase mt-1">SK Pendirian No. 661 / E / O / 2024</h2>
            
            {/* Alamat Detail */}
            <div className="mt-2 text-[8pt] leading-tight font-normal italic normal-case">
              <p>Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
              <p>Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
              <p>Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618</p>
              <p>Website : <span className="text-blue-700 underline">www.univsm.ac.id</span> Email : <span className="text-blue-700 underline">info@univsm.ac.id</span></p>
            </div>
          </div>
        </div>
      </div>
      {/* Garis Ganda Penutup Kop */}
      <div className="border-t border-black h-1 w-full mb-8"></div>

      {/* JUDUL DOKUMEN */}
      <div className="text-center mb-10">
        <h2 className="text-[16pt] font-bold uppercase underline underline-offset-8">NOTULENSI RAPAT</h2>
        <p className="text-[10pt] mt-2 font-bold italic">Nomor: {data.id}/UNIVSM/BAA/2026</p>
      </div>

      {/* DETAIL PELAKSANAAN RAPAT */}
      <div className="space-y-4 mb-10 ml-6 text-[11pt]">
        <div className="grid grid-cols-[180px_20px_1fr]">
          <span className="font-bold">Nama Kegiatan</span>
          <span className="text-center">:</span>
          <span className="uppercase font-bold">{data.title}</span>
        </div>
        <div className="grid grid-cols-[180px_20px_1fr]">
          <span className="font-bold">Agenda Utama</span>
          <span className="text-center">:</span>
          <span className="italic">{data.agenda || "Pembahasan rutin operasional"}</span>
        </div>
        <div className="grid grid-cols-[180px_20px_1fr]">
          <span className="font-bold">Hari / Tanggal</span>
          <span className="text-center">:</span>
          <span>{data.date}</span>
        </div>
        <div className="grid grid-cols-[180px_20px_1fr]">
          <span className="font-bold">Tempat / Lokasi</span>
          <span className="text-center">:</span>
          <span>{data.location}</span>
        </div>
      </div>

      {/* ISI NOTULENSI */}
      <div className="mt-8 ml-6">
        <h3 className="font-bold uppercase text-[11pt] mb-4">RINGKASAN HASIL PEMBAHASAN:</h3>
        <div className="text-[11pt] leading-relaxed whitespace-pre-wrap pl-6 text-justify">
          {data.content}
        </div>
      </div>

      {/* TANDA TANGAN REKTOR */}
      <div className="mt-24 flex justify-end pr-12">
        <div className="text-center min-w-[250px]">
          <p className="text-[11pt] mb-24">Paringin, {data.date}</p>
          <p className="font-bold text-[12pt] underline uppercase leading-none">ABDUL HAMID, S.Kom., M.M., M.Kom</p>
          <p className="text-[9pt] font-bold text-gray-600 mt-1 uppercase tracking-widest">Rektor Universitas Sapta Mandiri</p>
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
