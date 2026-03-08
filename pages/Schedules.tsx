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
    const [editingId, setEditingId] = useState<string | null>(null); 
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const [formData, setFormData] = useState({
        title: '', date: '', time: '', location: '', agenda: ''
    });

    useEffect(() => {
        loadSchedules();
    }, []);

    // 1. MESIN PEMBACA WAKTU SUPER TANGGUH (ANTI-TIMEZONE BUG)
    const parseScheduleDateTime = (dateStr: string, timeStr: string) => {
        if (!dateStr) return new Date(0);
        try {
            let year, month, date;
            
            if (String(dateStr).includes('T')) {
                // RAHASIA ANTI-BUG: Tambah 12 jam agar tidak bergeser hari akibat UTC
                const d = new Date(dateStr);
                d.setTime(d.getTime() + (12 * 60 * 60 * 1000));
                year = d.getFullYear();
                month = d.getMonth();
                date = d.getDate();
            } else {
                const parts = String(dateStr).split('-');
                year = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
                date = parseInt(parts[2]);
            }

            const finalObj = new Date(year, month, date);

            if (timeStr) {
                if (String(timeStr).includes('T')) {
                    const t = new Date(timeStr);
                    finalObj.setHours(t.getHours(), t.getMinutes(), 0, 0);
                } else {
                    const cleanTime = String(timeStr).replace(/[^0-9:]/g, ''); 
                    const [hours, mins] = cleanTime.split(':');
                    finalObj.setHours(parseInt(hours) || 0, parseInt(mins) || 0, 0, 0);
                }
            } else {
                finalObj.setHours(23, 59, 59, 999);
            }
            
            return finalObj;
        } catch (e) {
            return new Date(0);
        }
    };

    const formatDisplayDate = (rawDate: string, rawTime: string) => {
        if (!rawDate) return '-';
        try {
            const d = parseScheduleDateTime(rawDate, rawTime);
            return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) { return String(rawDate); }
    };

    const formatDisplayTime = (rawDate: string, rawTime: string) => {
        if (!rawTime) return '-';
        try {
            const d = parseScheduleDateTime(rawDate, rawTime);
            return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        } catch (e) { return String(rawTime); }
    };

    // 2. LOADING INSTAN (CACHE-FIRST STRATEGY)
    const loadSchedules = async () => {
        // Tampilkan seketika dari memori lokal (0.1 detik)
        const cached = localStorage.getItem('usm_schedules');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const sortedCached = [...parsed].sort((a, b) => parseScheduleDateTime(a.date, a.time).getTime() - parseScheduleDateTime(b.date, b.time).getTime());
                setSchedules(sortedCached);
                setIsLoading(false); // Matikan putaran loading agar halaman langsung siap
            } catch(e) {}
        } else {
            setIsLoading(true);
        }

        // Tarik data terbaru dari server secara diam-diam
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

    const handleEditClick = (schedule: Schedule) => {
        setFormData({
            title: schedule.title,
            date: schedule.date,
            time: schedule.time,
            location: schedule.location,
            agenda: schedule.agenda || ''
        });
        setEditingId(schedule.id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ title: '', date: '', time: '', location: '', agenda: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        const schedulePayload: Schedule = {
            id: editingId || `SCH-${Date.now()}`,
            ...formData,
            status: 'UPCOMING',
            createdBy: currentUser.name
        };

        try {
            if (editingId) {
                await SpreadsheetService.deleteSchedule(editingId);
                await SpreadsheetService.addSchedule(schedulePayload);
                alert("Jadwal berhasil diperbarui!");
            } else {
                await SpreadsheetService.addSchedule(schedulePayload);
                alert("Jadwal berhasil dipublikasikan ke seluruh Civitas!");
            }
            
            const updatedSchedules = [schedulePayload, ...schedules.filter(s => s.id !== editingId)]
                .sort((a, b) => parseScheduleDateTime(a.date, a.time).getTime() - parseScheduleDateTime(b.date, b.time).getTime());
            
            setSchedules(updatedSchedules);
            
            // Simpan perubahan ke memori lokal agar saat refresh tetap cepat
            localStorage.setItem('usm_schedules', JSON.stringify(updatedSchedules));
            
            handleCancelForm();
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
                const filtered = schedules.filter(s => s.id !== id);
                setSchedules(filtered);
                localStorage.setItem('usm_schedules', JSON.stringify(filtered)); // Update cache
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
                    <button onClick={() => isFormOpen ? handleCancelForm() : setIsFormOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#252859] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:brightness-110 transition-all">
                        <span className="material-symbols-outlined">{isFormOpen ? 'close' : 'calendar_add_on'}</span>
                        {isFormOpen ? 'Batal' : 'Buat Jadwal Baru'}
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="mb-10 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Jadwal Rapat' : 'Tambah Jadwal Baru'}</h2>
                        {editingId && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full tracking-widest">Mode Edit</span>}
                    </div>
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
                                {isLoading ? 'Menyimpan ke Cloud...' : (editingId ? 'Simpan Perubahan' : 'Simpan dan Publikasikan Jadwal')}
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
                                        <>
                                            <button onClick={() => handleEditClick(schedule)} className="p-1 text-slate-300 hover:text-blue-500 transition-colors" title="Edit Jadwal">
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(schedule.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors" title="Hapus Jadwal">
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <h3 className={`text-lg font-bold mb-2 leading-tight flex-1 ${status === 'SELESAI' ? 'text-slate-600 line-through decoration-slate-300' : 'text-slate-900'}`}>
                                {schedule.title}
                            </h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    <span className="text-xs font-medium">{formatDisplayDate(schedule.date, schedule.time)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    <span className="text-xs font-medium">{formatDisplayTime(schedule.date, schedule.time)}</span>
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
