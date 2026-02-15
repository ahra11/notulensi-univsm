import React, { useState, useEffect } from 'react';
import { Page, Schedule, UserRole } from '../types';

interface SchedulesProps {
    onNavigate: (page: Page) => void;
}

const Schedules: React.FC<SchedulesProps> = ({ onNavigate }) => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // State untuk form input
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        agenda: ''
    });

    useEffect(() => {
        const savedSchedules = JSON.parse(localStorage.getItem('usm_schedules') || '[]');
        setSchedules(savedSchedules);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newSchedule: Schedule = {
            id: `SCH-${Date.now()}`,
            ...formData,
            status: 'UPCOMING',
            createdBy: currentUser.name
        };

        const updatedSchedules = [newSchedule, ...schedules];
        setSchedules(updatedSchedules);
        localStorage.setItem('usm_schedules', JSON.stringify(updatedSchedules));
        
        // Reset form
        setFormData({ title: '', date: '', time: '', location: '', agenda: '' });
        setIsFormOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Hapus jadwal rapat ini?')) {
            const updated = schedules.filter(s => s.id !== id);
            setSchedules(updated);
            localStorage.setItem('usm_schedules', JSON.stringify(updated));
        }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Penjadwalan Rapat</h1>
                    <p className="text-sm text-slate-500 font-medium">Atur dan pantau agenda pertemuan civitas USM</p>
                </div>

                <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined">{isFormOpen ? 'close' : 'calendar_add_on'}</span>
                    {isFormOpen ? 'Batal' : 'Buat Jadwal Baru'}
                </button>
            </div>

            {isFormOpen && (
                <div className="mb-10 bg-white p-6 md:p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/5 animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Kegiatan / Rapat</label>
                            <input 
                                required
                                type="text"
                                placeholder="Contoh: Rapat Koordinasi PMB"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                            <input 
                                required
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Waktu</label>
                            <input 
                                required
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lokasi atau Tautan Meet</label>
                            <input 
                                required
                                type="text"
                                placeholder="Gedung Rektorat Lt. 2 / meet.google.com/..."
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agenda Pembahasan</label>
                            <textarea 
                                required
                                placeholder="Tuliskan poin-poin agenda..."
                                value={formData.agenda}
                                onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium min-h-[120px]"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all">
                                Simpan dan Publikasikan Jadwal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.length > 0 ? schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                                <span className="material-symbols-outlined text-2xl">event</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase">
                                    {schedule.status}
                                </span>
                                {(currentUser.role === 'SUPER_ADMIN' || currentUser.name === schedule.createdBy) && (
                                    <button 
                                        onClick={() => handleDelete(schedule.id)}
                                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{schedule.title}</h3>
                        
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <span className="text-xs font-medium">{schedule.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span className="text-xs font-medium">{schedule.time} WIB</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                <span className="text-xs font-medium truncate">{schedule.location}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Dibuat Oleh</span>
                                <span className="text-[10px] font-bold text-slate-700">{schedule.createdBy}</span>
                            </div>
                            <button 
                                onClick={() => onNavigate('form')}
                                className="size-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                title="Buat Notulensi dari Jadwal ini"
                            >
                                <span className="material-symbols-outlined text-sm">edit_note</span>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl text-slate-200">calendar_today</span>
                        </div>
                        <p className="text-slate-400 font-medium">Belum ada jadwal rapat mendatang.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedules;
