import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Student, AttendanceRecord } from '../types';
import { getDaysInMonth, format, startOfMonth, isSameDay, isAfter, startOfDay } from 'date-fns';
import { TIME_SHIFTS } from '../constants';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import QuickMarkModal from './QuickMarkModal';
import CustomScrollbar, { VerticalScrollbar } from './CustomScrollbar';

interface AttendanceTableProps {
  students: Student[];
  records: AttendanceRecord[];
  onMark: (studentId: string, date: string, shift: string, status: 0 | 0.25 | 1) => void;
  onBatchMark: (updates: { studentId: string; status: 0 | 0.25 | 1 }[], date: string) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ students, records, onMark, onBatchMark }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState(TIME_SHIFTS[0]);
  const [isQuickMarkOpen, setIsQuickMarkOpen] = useState(false);
  
  // Name Column Width State & Persistence
  const [nameWidth, setNameWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('dpss_attendance_name_width');
      return saved ? parseInt(saved) : 200;
    } catch {
      return 200;
    }
  });

  useEffect(() => {
    localStorage.setItem('dpss_attendance_name_width', nameWidth.toString());
  }, [nameWidth]);

  // Resizing Logic
  const [resizing, setResizing] = useState<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      const diff = e.clientX - resizing.startX;
      // Clamp width between 100px and 500px
      setNameWidth(Math.min(Math.max(100, resizing.startWidth + diff), 500));
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.body.style.cursor = 'default';
    };

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing({ startX: e.clientX, startWidth: nameWidth });
  };
  
  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const daysInMonth = useMemo(() => {
    const days = getDaysInMonth(currentDate);
    const start = startOfMonth(currentDate);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(start);
      d.setDate(i + 1);
      return d;
    });
  }, [currentDate]);

  const handleCellClick = (studentId: string, day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const existing = records.find(r => r.studentId === studentId && r.date === dateStr && r.timeShift === selectedShift);
    
    // Cycle: Present (0) -> Permission (0.25) -> Absent (1) -> Present (0)
    let nextStatus: 0 | 0.25 | 1 = 0;
    if (!existing) nextStatus = 0;
    else if (existing.status === 0) nextStatus = 0.25;
    else if (existing.status === 0.25) nextStatus = 1;
    else nextStatus = 0;

    onMark(studentId, dateStr, selectedShift, nextStatus);
  };

  const getCellClass = (status: number | undefined, day: Date) => {
    const today = startOfDay(new Date());
    const dayStart = startOfDay(day);
    const isFuture = isAfter(dayStart, today);
    
    // Default blank for undefined
    if (status === undefined) {
       return 'bg-white';
    }

    if (status === 1) return 'bg-red-100 text-red-600 font-bold hover:bg-red-200'; // Absent
    if (status === 0.25) return 'bg-orange-100 text-orange-600 font-bold hover:bg-orange-200'; // Permission
    
    if (status === 0) {
        if (isFuture) return 'bg-white text-transparent'; // Future dates: Data exists but hide it visually
        // Present/Past dates: Show visible Green 0
        return 'bg-green-50 text-green-700 font-bold hover:bg-green-100'; 
    }
    
    return 'bg-white';
  };

  const getStatusText = (status: number | undefined) => {
    if (status === 1) return '1';
    if (status === 0.25) return 'P';
    if (status === 0) return '0';
    return '';
  };

  const handleBatchConfirm = (updates: { studentId: string; status: 0 | 0.25 | 1 }[]) => {
    // Apply to current viewing date? No, prompt says "Quick Mark Today".
    const targetDate = new Date();
    onBatchMark(updates, format(targetDate, 'yyyy-MM-dd'));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow border overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border">
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1 hover:bg-slate-100 rounded">
                 <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="w-32 text-center font-bold text-slate-700">{format(currentDate, 'MMMM yyyy')}</span>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1 hover:bg-slate-100 rounded">
                 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-300 mx-2"></div>

            <select 
              value={selectedShift} 
              onChange={(e) => setSelectedShift(e.target.value)}
              className="px-3 py-1.5 border rounded bg-white text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none min-w-[140px]"
            >
              {TIME_SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <button 
              onClick={() => setIsQuickMarkOpen(true)}
              className="ml-2 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-1.5 rounded text-sm font-bold shadow-sm transition-all"
            >
              <Zap className="w-4 h-4" />
              Quick Mark Today
            </button>
         </div>

         <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1"><span className="font-bold text-red-600">1</span> Absent</div>
            <div className="flex items-center gap-1"><span className="font-bold text-orange-500">P</span> Permission (0.25)</div>
            <div className="flex items-center gap-1"><span className="font-bold text-green-700">0</span> Present</div>
         </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-hidden relative">
         <div 
           ref={scrollContainerRef}
           className="h-full overflow-x-auto overflow-y-auto no-scrollbar"
         >
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                      <th className="p-2 border-b border-r min-w-[50px] w-[50px] bg-slate-100 sticky left-0 z-30">#</th>
                      
                      {/* Resizable Student Name Column */}
                      <th 
                        className="p-2 border-b border-r bg-slate-100 sticky left-[50px] z-30 relative group"
                        style={{ width: nameWidth, minWidth: nameWidth, maxWidth: nameWidth }}
                      >
                        Student Name
                        {/* Resize Handle */}
                        <div 
                           onMouseDown={startResize}
                           className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary-400 z-40 transition-colors"
                           title="Drag to resize name column"
                        />
                      </th>
                      
                      {daysInMonth.map(day => {
                        const isToday = isSameDay(day, new Date());
                        return (
                          <th key={day.toString()} className={`p-1 border-b border-r min-w-[32px] w-[32px] text-center text-xs font-normal ${isToday ? 'bg-orange-100 text-orange-800' : 'text-slate-600'}`}>
                            <div className={isToday ? 'font-bold' : ''}>{format(day, 'd')}</div>
                            <div className="text-[10px] opacity-70">{format(day, 'EEEEE')}</div>
                          </th>
                        );
                      })}
                      <th className="p-2 border-b min-w-[60px] text-center bg-slate-100 sticky right-0 z-30 font-semibold text-slate-700 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((student, idx) => {
                      let monthlyTotal = 0;
                      return (
                        <tr key={student.id} className="group hover:bg-slate-50">
                            <td className="p-2 border-r bg-white sticky left-0 z-20 text-slate-400 text-xs border-b">{idx + 1}</td>
                            <td 
                              className="p-2 border-r bg-white sticky left-[50px] z-20 font-medium text-sm text-slate-800 border-b truncate"
                              style={{ width: nameWidth, maxWidth: nameWidth }}
                            >
                              {student.fullName}
                            </td>
                            {daysInMonth.map(day => {
                              const dateStr = format(day, 'yyyy-MM-dd');
                              const record = records.find(r => r.studentId === student.id && r.date === dateStr && r.timeShift === selectedShift);
                              const status = record ? record.status : undefined;
                              
                              if (status !== undefined) monthlyTotal += status;
                              
                              return (
                                <td 
                                  key={dateStr} 
                                  onClick={() => handleCellClick(student.id, day)}
                                  className={`border-r border-b cursor-pointer text-center text-xs select-none transition-colors ${getCellClass(status, day)}`}
                                >
                                    {getStatusText(status)}
                                </td>
                              );
                            })}
                            <td className="p-2 border-b text-center font-bold text-slate-700 bg-slate-50 sticky right-0 z-20 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)]">{monthlyTotal > 0 ? monthlyTotal : '-'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={daysInMonth.length + 3} className="p-12 text-center text-slate-500">
                        <p>No students in Attendance list.</p>
                        <p className="text-sm mt-1">Click "Add Row" or "AI Quick Add" to add students specifically to this list.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
            </table>
         </div>
          {/* Vertical Scrollbar Overlay */}
         <VerticalScrollbar containerRef={scrollContainerRef} />
      </div>
      
      {/* Custom Scrollbar at Bottom */}
      <CustomScrollbar containerRef={scrollContainerRef} />

      <QuickMarkModal 
        isOpen={isQuickMarkOpen}
        onClose={() => setIsQuickMarkOpen(false)}
        students={students}
        date={format(new Date(), 'MMMM dd, yyyy')}
        shift={selectedShift}
        onConfirm={handleBatchConfirm}
      />
    </div>
  );
};

export default AttendanceTable;