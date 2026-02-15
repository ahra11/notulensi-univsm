import React from 'react';
import { Minute } from '../types';

/**
 * Fungsi konversi bulan angka ke Romawi 
 * untuk Nomor: Nomor/NOT/REK/BULAN/2026
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
    <div className="bg-white min-h-screen text-black font-serif print:p-0">
      
      {/* --- HALAMAN 1: NOTULENSI --- */}
      <div className="p-10 min-h-screen flex flex-col">
        {/* HEADER KOP SURAT RESMI YAYASAN */}
        <div className="flex flex-col items-center border-b-[3px] border-black pb-1 mb-0.5">
          <div className="flex w-full items-center">
            <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center">
               <img src="/logo-usm.png" alt="Logo USM" className="w-24 h-24 object-contain" />
            </div>
            <div className="flex-1 text-center pr-12">
              <h3 className="text-[14pt] font-bold leading-tight uppercase">YAYASAN SAPTA BAKTI PENDIDIKAN</h3>
              <h1 className="text-[22pt] font-black leading-none uppercase tracking-tighter">UNIVERSITAS SAPTA MANDIRI</h1>
              <h2 className="text-[12pt] font-bold leading-tight uppercase mt-1">SK Pendirian No. 661 / E / O / 2024</h2>
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

        {/* JUDUL & NOMOR SURAT */}
        <div className="text-center mb-8">
          <h2 className="text-[16pt] font-bold uppercase underline underline-offset-8">NOTULENSI RAPAT</h2>
          <p className="text-[11pt] mt-3 font-bold">
            Nomor: {formattedId}/NOT/REK/{romanMonth}/2026
          </p>
        </div>

        {/* DETAIL PELAKSANAAN */}
        <div className="space-y-4 mb-8 ml-10 text-[11pt]">
          <div className="grid grid-cols-[180px_20px_1fr]">
            <span className="font-bold">Nama Kegiatan</span>
            <span className="text-center">:</span>
            <span className="uppercase font-bold">{data.title}</span>
          </div>
          <div className="grid grid-cols-[180px_20px_1fr]">
            <span className="font-bold">Agenda Utama</span>
            <span className="text-center">:</span>
            <span className="italic">{data.agenda}</span>
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

        {/* RINGKASAN PEMBAHASAN */}
        <div className="mt-4 ml-10 mr-10 flex-grow">
          <h3 className="font-bold uppercase text-[11pt] mb-4">RINGKASAN HASIL PEMBAHASAN:</h3>
          <div className="text-[11pt] leading-relaxed whitespace-pre-wrap text-justify">
            {data.content}
          </div>
        </div>

        {/* AREA PENGESAHAN (TANDA TANGAN GANDA) */}
        <div className="mt-16 grid grid-cols-2 text-center text-[11pt]">
          <div>
            <p className="mb-24 uppercase font-bold">Notulis / Pelaksana,</p>
            <p className="font-bold underline uppercase italic">( __________________________ )</p>
            <p className="text-[9pt]">NIP. ......................................</p>
          </div>
          <div>
            <p className="mb-4">Paringin, {data.date}</p>
            <p className="mb-20 font-bold uppercase">Mengesahkan,<br/>Rektor Universitas Sapta Mandiri</p>
            <p className="font-bold underline uppercase">ABDUL HAMID, S.Kom., M.M., M.Kom</p>
            <p className="text-[9pt]">NIP. 1121069301</p>
          </div>
        </div>
      </div>

      {/* --- HALAMAN 2: LAMPIRAN --- */}
      <div className="p-10 break-before-page min-h-screen">
        <h2 className="text-center text-[14pt] font-bold uppercase underline mb-10">LAMPIRAN DOKUMENTASI & ABSENSI</h2>
        
        {/* Foto Kegiatan */}
        <div className="mb-12">
          <h3 className="font-bold uppercase border-b mb-4 pb-2">I. Foto Kegiatan</h3>
          <div className="grid grid-cols-2 gap-6">
            {data.documentation && data.documentation.length > 0 ? (
              data.documentation.map((img, index) => (
                <div key={index} className="border p-2 bg-slate-50">
                  <img src={img} alt={`Dokumentasi ${index + 1}`} className="w-full h-64 object-cover" />
                  <p className="text-center text-[9pt] mt-2 italic">Dokumentasi Kegiatan {index + 1}</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 border-2 border-dashed p-10 text-center text-slate-400">
                (Tidak ada foto kegiatan terlampir)
              </div>
            )}
          </div>
        </div>

        {/* Daftar Absensi / Kehadiran */}
        <div>
          <h3 className="font-bold uppercase border-b mb-4 pb-2">II. Daftar Hadir / Absensi</h3>
          <table className="w-full border-collapse border border-black text-[10pt]">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-2 w-12 text-center">No.</th>
                <th className="border border-black p-2 text-left">Nama Lengkap</th>
                <th className="border border-black p-2 text-left">Jabatan / Unit Kerja</th>
                <th className="border border-black p-2 w-32 text-center">Tanda Tangan</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <tr key={num} className="h-10">
                  <td className="border border-black p-2 text-center">{num}.</td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2 text-left text-[8pt] text-slate-300 italic">
                    {num % 2 !== 0 ? `${num}. .........` : `\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${num}. .........`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-[9pt] italic italic">* Catatan: Daftar hadir fisik terlampir pada dokumen asli.</p>
        </div>
      </div>

    </div>
  );
};

export default PrintTemplate;
