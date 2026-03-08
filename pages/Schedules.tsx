import React, { useState, useEffect } from 'react';
import { Page, Schedule } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

interface SchedulesProps {
    onNavigate: (page: Page) => void;
}

const Schedules: React.FC<SchedulesProps> = ({ onNavigate }) => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const [formData, setFormData] = useState({
        title: '', date: '', time: '', location: '', agenda: ''
    });

    useEffect(() => {
        loadSchedules();
    }, []);

    // 1. MESIN PEMBACA WAKTU DARI GOOGLE SHEETS
    const parseScheduleDateTime = (dateStr: string, timeStr: string) => {
        if (!dateStr) return new Date(0);
        try {
            const dateObj = new Date(dateStr);
            if (timeStr) {
                if (timeStr.includes('T')) {
                    // Jika format dari Sheets "1899-12-30T09:00:00.000Z"
                    const t = new Date(timeStr);
                    dateObj.setHours(t.getHours(), t.getMinutes(), 0, 0);
                } else {
                    // Jika format ketikan manual "09:00"
                    const cleanTime = String(timeStr).replace(/[^0-9:]/g, ''); 
                    const [hours, mins] = cleanTime.split(':');
                    dateObj.setHours(parseInt(hours) || 0, parseInt(mins) || 0, 0, 0);
                }
            } else {
                dateObj.setHours(23, 59, 59, 999);
            }
            return dateObj;
        } catch (e) {
            return new Date(0);
        }
    };

    // 2. PENERJEMAH TAMPILAN TANGGAL & WAKTU (Agar Enak Dibaca)
    const formatDisplayDate = (rawDate: string) => {
        if (!rawDate) return '-';
        try {
            const d = new Date(rawDate);
            if (isNaN(d.getTime())) return rawDate;
            return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) { return rawDate; }
    };

    const formatDisplayTime = (rawTime: string) => {
        if (!rawTime) return '-';
        try {
            if (rawTime.includes('T')) {
                const d = new Date(rawTime);
                if (isNaN(d.getTime())) return rawTime;
                return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
            }
            return String(rawTime).replace(/[^0-9:]/g, '') + ' WIB';
        } catch (e) { return rawTime; }
    };

    // 3. LOGIKA LOADING SUPER CEPAT (Optimistic UI)
    const loadSchedules = async () => {
        // Tampilkan dulu dari memori laptop (Instant 0.1 detik)
        const cached = localStorage.getItem('usm_schedules');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const sorted = [...parsed].sort((a, b) => parseScheduleDateTime(a.date, a.time).getTime() - parseScheduleDateTime(b.date, b.time).getTime());
                setSchedules(sorted);
                setIsLoading(false); // Matikan loading screen jika ada cache
            } catch(e) {}
        } else {
            setIsLoading(true);
        }

        // Tarik data terbaru dari server Google diam-diam di background
        try {
            const data = await SpreadsheetService.getSchedules();
            const sortedData = [...data].sort((a, b) => parseScheduleDateTime(a.date, a.time).getTime() - parseScheduleDateTime(b.date, b.time).getTime());
            setSchedules(sortedData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        const newSchedule: Schedule = {
            id: `SCH-${Date.now()}`,
            ...formData,
            status: 'UPCOMING',
            createdBy: currentUser.name
        };

        try {
            await SpreadsheetService.addSchedule(newSchedule);
            const updatedSchedules = [newSchedule, ...schedules].sort((a, b) => parseScheduleDateTime(a.date, a.time).getTime() - parseScheduleDateTime(b.date, b.time).getTime());
            setSchedules(updatedSchedules);
            
            setFormData({ title: '', date: '', time: '', location: '', agenda: '' });
            setIsFormOpen(false);
            alert("Jadwal berhasil dipublikasikan ke seluruh Civitas!");
        } catch (error) {
            alert("Gagal menyimpan jadwal ke Cloud.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Hapus jadwal rapat ini untuk semua orang?')) {
            setIsLoading(true);
            try {
                await SpreadsheetService.deleteSchedule(id);
                setSchedules(schedules.filter(s => s.id !== id));
            } catch (error) {
                alert("Gagal menghapus jadwal.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const renderLocation = (loc: string) => {
        if (!loc) return '-';
        const isLink = loc.includes('meet.google.com') || loc.includes('zoom.us') || loc.includes('http');
        
        if (isLink) {
            let finalUrl = loc;
            if (loc.includes('meet.google.com') && !loc.includes('http')) {
                finalUrl = 'https://' + loc;
            }
            return (
                <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-blue-600 hover:text-white transition-all w-max mt-1">
                    <span className="material-symbols-outlined text-[14px]">videocam</span>
                    Gabung Rapat Online
                </a>
            );
        }
        return <span className="text-xs font-medium truncate">{loc}</span>;
    };

    const getScheduleStatus = (dateStr: string, timeStr: string) => {
        const scheduleDateTime = parseScheduleDateTime(dateStr, timeStr);
        const now = new Date();
        return scheduleDateTime.getTime() < now.getTime() ? 'SELESAI' : 'MENDATANG';
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Penjadwalan Rapat</h1>
                        {isLoading && <div className="size-4 border-2 border-[#252859] border-t-transparent rounded-full animate-spin"></div>}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Atur dan pantau agenda pertemuan civitas USM</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={loadSchedules} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all" title="Sinkronkan Data">
                        <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                    </button>
                    <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#252859] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:brightness-110 transition-all">
                        <span className="material-symbols-outlined">{isFormOpen ? 'close' : 'calendar_add_on'}</span>
                        {isFormOpen ? 'Batal' : 'Buat Jadwal Baru'}
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="mb-10 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Kegiatan / Rapat</label>
                            <input required type="text" placeholder="Contoh: Rapat Koordinasi PMB" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                            <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Waktu</label>
                            <input required type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lokasi / Tautan Google Meet</label>
                            <input required type="text" placeholder="Gedung Rektorat Lt. 2 / meet.google.com/abc-defg-hij" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agenda Pembahasan</label>
                            <textarea required placeholder="Tuliskan poin-poin agenda..." value={formData.agenda} onChange={(e) => setFormData({...formData, agenda: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium min-h-[120px]" />
                        </div>
                        <div className="md:col-span-2">
                            <button disabled={isLoading} type="submit" className="w-full py-4 bg-[#252859] text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50">
                                {isLoading ? 'Menyimpan ke Cloud...' : 'Simpan dan Publikasikan Jadwal'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.length > 0 ? schedules.map((schedule) => {
                    const status = getScheduleStatus(schedule.date, schedule.time);
                    
                    return (
                        <div key={schedule.id} className={`p-6 rounded-[2rem] border transition-all group relative flex flex-col h-full ${status === 'SELESAI' ? 'bg-slate-50 border-slate-100 opacity-70 hover:opacity-100' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${status === 'SELESAI' ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                                    <span className="material-symbols-outlined text-2xl">event</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${status === 'SELESAI' ? 'bg-slate-200 text-slate-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {status}
                                    </span>
                                    {(currentUser.role === 'SUPER_ADMIN' || currentUser.name === schedule.createdBy) && (
                                        <button onClick={() => handleDelete(schedule.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className={`text-lg font-bold mb-2 leading-tight flex-1 ${status === 'SELESAI' ? 'text-slate-600 line-through decoration-slate-300' : 'text-slate-900'}`}>
                                {schedule.title}
                            </h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    {/* MENGGUNAKAN FORMATTER BARU */}
                                    <span className="text-xs font-medium">{formatDisplayDate(schedule.date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    {/* MENGGUNAKAN FORMATTER BARU */}
                                    <span className="text-xs font-medium">{formatDisplayTime(schedule.time)}</span>
                                </div>
                                <div className="flex items-start gap-2 text-slate-500">
                                    <span className="material-symbols-outlined text-sm mt-0.5">location_on</span>
                                    <div>{renderLocation(schedule.location)}</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Dibuat Oleh</span>
                                    <span className="text-[10px] font-bold text-slate-700">{schedule.createdBy}</span>
                                </div>
                                <button onClick={() => onNavigate('form')} className="size-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-[#252859] hover:text-white transition-all" title="Buat Notulensi dari Jadwal ini">
                                    <span className="material-symbols-outlined text-sm">edit_note</span>
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl text-slate-200">calendar_today</span>
                        </div>
                        <p className="text-slate-400 font-medium">Belum ada jadwal rapat.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedules;
