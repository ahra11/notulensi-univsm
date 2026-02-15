import React from 'react';
import { Minute } from '../types';

/**
 * Penomoran Otomatis Format Romawi
 * Format: Nomor/NOT/REK/BULAN/2026
 */
const getRomanMonth = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const months = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return months[date.getMonth()] || "I";
  } catch (e) {
    return "I";
  }
};

const PrintTemplate: React.FC<{ data: Minute }> = ({ data }) => {
  const formattedId = String(data.id || "0").padStart(3, '0');
  const romanMonth = getRomanMonth(data.date);

  return (
    <div className="bg-white min-h-screen text-black font-serif p-0">
      
      {/* HALAMAN 1: NOTULENSI UTAMA */}
      <div className="p-10 flex flex-col min-h-screen border-b-2 border-dashed border-slate-200 print:border-none">
        
        {/* --- KOP SURAT RESMI YAYASAN (Sesuai image_f167e3.png) --- */}
        <div className="flex flex-col items-center border-b-[3px] border-black pb-1 mb-0.5">
          <div className="flex w-full items-center">
            {/* Logo Universitas Sapta Mandiri */}
            <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center">
               <img src="/logo-usm.png" alt="Logo USM" className="w-24 h-24 object-contain" />
            </div>
            
            <div className="flex-1 text-center pr-10">
              <h3 className="text-[16pt] font-bold leading-tight uppercase">YAYASAN SAPTA BAKTI PENDIDIKAN</h3>
              <h1 className="text-[24pt] font-black leading-none uppercase tracking-tighter">UNIVERSITAS SAPTA MANDIRI</h1>
              <h2 className="text-[14pt] font-bold leading-tight uppercase mt-1">SK Pendirian No. 661 / E / O / 2024</h2>
              
              <div className="mt-2 text-[8pt] leading-tight font-normal italic normal-case">
                <p>Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
                <p>Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
                <p>Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618</p>
                <p>Website : www.univsm.ac.id | Email : info@univsm.ac.id</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-black h-1 w-full mb-8"></div>

        {/* --- JUDUL & NOMOR SURAT --- */}
        <div className="text-center mb-8">
          <h2 className="text-[18pt] font-bold uppercase underline underline-offset-8">NOTULENSI RAPAT</h2>
          <p className="text-[11pt] mt-4 font-bold">
            Nomor: {formattedId}/NOT/REK/{romanMonth}/2026
          </p>
        </div>

        {/* --- DETAIL PELAKSANAAN --- */}
        <div className="space-y-4 mb-8 ml-10 text-[11pt]">
          <div className="grid grid-cols-[180px_20px_1fr]">
            <span className="font-bold">Nama Kegiatan</span>
            <span className="text-center">:</span>
            <span className="uppercase font-bold">{data.title}</span>
          </div>
          <div className="grid grid-cols-[180px_20px_1fr]">
            <span className="font-bold">Agenda Utama</span>
            <span className="text-center">:</span>
            <span className="italic">{data.agenda || "Terlampir dalam pembahasan"}</span>
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

        {/* --- RINGKASAN PEMBAHASAN --- */}
        <div className="mt-4 ml-10 mr-10 flex-grow">
          <h3 className="font-bold uppercase text-[11pt] mb-4">RINGKASAN HASIL PEMBAHASAN:</h3>
          <div className="text-[11pt] leading-relaxed whitespace-pre-wrap text-justify">
            {data.content}
          </div>
        </div>

        {/* --- TANDA TANGAN & PENGESAHAN --- */}
        <div className="mt-16 grid grid-cols-2 text-center text-[11pt]">
          <div className="flex flex-col items-center">
            <p className="mb-24 uppercase font-bold">Notulis / Pelaksana,</p>
            <p className="font-bold underline uppercase italic">( __________________________ )</p>
            <p className="text-[9pt] mt-1">NIP. ......................................</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-4">Paringin, {data.date}</p>
            <p className="mb-20 font-bold uppercase leading-tight">Mengesahkan,<br/>Rektor Universitas Sapta Mandiri</p>
            <p className="font-bold underline uppercase">ABDUL HAMID, S.Kom., M.M., M.Kom</p>
            <p className="text-[9pt] mt-1 font-bold">NIP. 1121069301</p>
          </div>
        </div>
      </div>

      {/* HALAMAN 2: LAMPIRAN FOTO & ABSENSI */}
      <div className="p-10 break-before-page min-h-screen">
        <div className="text-center mb-10">
          <h2 className="text-[14pt] font-bold uppercase underline">LAMPIRAN DOKUMENTASI & ABSENSI</h2>
        </div>

        {/* I. FOTO KEGIATAN */}
        <div className="mb-12">
          <h3 className="font-bold uppercase border-b-2 border-black mb-6 pb-1 italic text-[11pt]">I. Dokumentasi Visual Kegiatan</h3>
          <div className="grid grid-cols-2 gap-8">
            {data.documentation && data.documentation.length > 0 ? (
              data.documentation.map((img, idx) => (
                <div key={idx} className="border-4 border-slate-100 p-2 shadow-sm">
                  <img src={img} alt="Dokumentasi" className="w-full h-56 object-cover mb-2" />
                  <p className="text-center text-[9pt] italic">Lampiran Foto {idx + 1}</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-20 border-2 border-dashed text-center text-slate-400 italic">
                Tidak ada dokumentasi visual yang dilampirkan.
              </div>
            )}
          </div>
        </div>

        {/* II. DAFTAR HADIR / ABSENSI */}
        <div>
          <h3 className="font-bold uppercase border-b-2 border-black mb-6 pb-1 italic text-[11pt]">II. Daftar Hadir Peserta</h3>
          <table className="w-full border-collapse border border-black text-[10pt]">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-black p-3 w-12 text-center">No.</th>
                <th className="border border-black p-3 text-left">Nama Lengkap & Gelar</th>
                <th className="border border-black p-3 text-left">Jabatan / Unit Kerja</th>
                <th className="border border-black p-3 w-40 text-center">Tanda Tangan</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <tr key={n} className="h-12">
                  <td className="border border-black p-3 text-center font-bold">{n}.</td>
                  <td className="border border-black p-3"></td>
                  <td className="border border-black p-3"></td>
                  <td className="border border-black p-3 relative text-[8pt]">
                     {n % 2 !== 0 ? `${n}. .............` : <span className="absolute right-4">{n}. .............</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[9pt] mt-4 italic text-slate-500">* Daftar hadir fisik asli tersimpan dalam arsip Rektorat.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
