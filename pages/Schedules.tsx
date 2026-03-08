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

    // FUNGSI BARU: Pembaca Waktu Tahan Banting (Menghilangkan teks 'WIB' dll)
    const parseScheduleDateTime = (dateStr: string, timeStr: string) => {
        if (!dateStr) return new Date(0);
        try {
            const dateObj = new Date(dateStr);
            if (timeStr) {
                const cleanTime = String(timeStr).replace(/[^0-9:]/g, ''); 
                const [hours, mins] = cleanTime.split(':');
                dateObj.setHours(parseInt(hours) || 0, parseInt(mins) || 0, 0, 0);
            } else {
                dateObj.setHours(23, 59, 59, 999);
            }
            return dateObj;
        } catch (e) {
            return new Date(0);
        }
    };

    const loadSchedules = async () => {
        setIsLoading(true);
        try {
            const data = await SpreadsheetService.getSchedules();
            // Urutkan jadwal dengan parser yang baru
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
            alert("Jadwal berhasil dipublik
