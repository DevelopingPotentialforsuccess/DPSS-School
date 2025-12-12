import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Calendar, Users, GraduationCap, 
  Search, Trash2, Download, Share2, HelpCircle, 
  RotateCcw, RotateCw, Settings, ZoomIn, ZoomOut, Maximize, Minimize,
  Plus, Sparkles, Database
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Student, Section, AttendanceRecord, AppState } from './types';
import { INITIAL_LEVELS, DEFAULT_STUDENT, TIME_SHIFTS } from './constants';
import DataTable from './components/DataTable';
import AttendanceTable from './components/AttendanceTable';
import QuickAddModal from './components/QuickAddModal';
import Superman from './components/Superman';

const STORAGE_KEY = 'dpss_school_data_v1';

export default function App() {
  // State initialization
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      students: [],
      attendance: [],
      classLevels: INITIAL_LEVELS,
      currentTab: 'hall_study',
      zoomLevel: 1,
      fontSize: 13,
      isFullScreen: false
    };
  });

  // History for Undo/Redo
  const [history, setHistory] = useState<AppState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryAction, setIsHistoryAction] = useState(false);
  
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // History Logic
  useEffect(() => {
    if (isHistoryAction) {
      setIsHistoryAction(false);
      return;
    }
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state))); // Deep copy
    
    if (newHistory.length > 50) newHistory.shift(); // Limit history
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [state.students, state.attendance]); // Track core data changes

  const undo = () => {
    if (historyIndex > 0) {
      setIsHistoryAction(true);
      const prevState = history[historyIndex - 1];
      setState(prev => ({ ...prev, students: prevState.students, attendance: prevState.attendance }));
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setIsHistoryAction(true);
      const nextState = history[historyIndex + 1];
      setState(prev => ({ ...prev, students: nextState.students, attendance: nextState.attendance }));
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Actions
  const addStudent = () => {
    const newStudent: Student = {
      ...DEFAULT_STUDENT,
      id: uuidv4(),
      section: state.currentTab as Section
    };
    setState(prev => ({ ...prev, students: [newStudent, ...prev.students] }));
  };

  const generateDemoStudents = () => {
    const firstNames = ["Sok", "Chan", "Neang", "Khem", "Bopha", "Vibol", "Dara", "Thida", "Srey", "Pich", "Samnang", "Vireak", "Nary", "Sophea", "Rithy", "Chea", "Malis", "Kunthea", "Vanna", "Sovann"];
    const lastNames = ["Sau", "Lim", "Heng", "Chea", "Ou", "Seng", "Kim", "Ly", "Keo", "Meas", "Sem", "Prom", "Chhim", "Ros", "Mao", "Sok", "Khiev", "Nov", "Pang", "Tang"];
    
    const demoStudents: Student[] = Array.from({ length: 20 }).map((_, i) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      // Assign to current tab
      const targetSection = state.currentTab as Section;
      
      // Some deadlines today for testing Supergirl
      const isToday = Math.random() > 0.8;
      const today = new Date().toISOString().split('T')[0];
      const future = new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0];

      return {
        ...DEFAULT_STUDENT,
        id: uuidv4(),
        fullName: `${lastName} ${firstName}`,
        level: INITIAL_LEVELS[Math.floor(Math.random() * INITIAL_LEVELS.length)],
        section: targetSection,
        startDate: new Date().toISOString().split('T')[0],
        assistant: Math.random() > 0.5 ? "Sreypov" : "Dara",
        deadline: isToday ? today : future,
        behavior: Math.random() > 0.8 ? "Needs improvement" : "Good",
        contactParent: Math.random() > 0.9,
        headTeacher: Math.random() > 0.95,
        time: "5:20-6:20"
      };
    });

    if (window.confirm(`Add 20 demo students to ${state.currentTab === 'attendance' ? 'Attendance list' : state.currentTab}?`)) {
      setState(prev => ({
        ...prev,
        students: [...demoStudents, ...prev.students]
      }));
    }
  };

  const updateStudent = (id: string, field: keyof Student, value: any) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const deleteStudent = (id: string) => {
    // Soft delete not implemented fully for visual clarity, just removing for now
    if (confirm('Are you sure you want to delete this student?')) {
        setState(prev => ({
            ...prev,
            students: prev.students.filter(s => s.id !== id)
        }));
    }
  };

  const handleAIAdd = (newStudents: Partial<Student>[]) => {
    const processed: Student[] = newStudents.map(s => ({
      ...DEFAULT_STUDENT,
      ...s,
      id: uuidv4(),
      section: state.currentTab as Section,
      // Ensure booleans are false if undefined
      contactParent: !!s.contactParent,
      headTeacher: !!s.headTeacher
    }));

    setState(prev => ({
      ...prev,
      students: [...processed, ...prev.students]
    }));
  };

  const updateAttendance = (studentId: string, date: string, shift: string, status: 0 | 0.25 | 1) => {
    setState(prev => {
      // Remove existing for this slot
      const filtered = prev.attendance.filter(r => !(r.studentId === studentId && r.date === date && r.timeShift === shift));
      
      // Even if status is 0, we now store it because 0 implies explicitly "Present" (Green) vs Undefined (White/Future)
      // This supports the "Hide Zeros but Show Green" requirement
      return {
        ...prev,
        attendance: [...filtered, { id: uuidv4(), studentId, date, timeShift: shift, status }]
      };
    });
  };

  const handleBatchAttendanceMark = (updates: { studentId: string; status: 0 | 0.25 | 1 }[], date: string) => {
    setState(prev => {
      // Filter out records for the target date because we are overwriting ALL shifts for this date
      const otherRecords = prev.attendance.filter(r => r.date !== date);

      const newRecords: AttendanceRecord[] = [];

      // Loop through ALL time shifts
      TIME_SHIFTS.forEach(shift => {
        updates.forEach(u => {
          newRecords.push({
            id: uuidv4(),
            studentId: u.studentId,
            date,
            timeShift: shift,
            status: u.status
          });
        });
      });

      return {
        ...prev,
        attendance: [...otherRecords, ...newRecords]
      };
    });
  };

  // derived data
  const filteredStudents = useMemo(() => {
    // Strictly filter by section. 'attendance' tab shows only students with section='attendance'
    return state.students.filter(s => s.section === state.currentTab);
  }, [state.students, state.currentTab]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setState(prev => ({ ...prev, isFullScreen: true }));
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            setState(prev => ({ ...prev, isFullScreen: false }));
        }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 font-sans ${state.isFullScreen ? 'h-screen' : ''}`}>
      <Superman students={state.students} />
      
      {/* Header */}
      {!state.isFullScreen && (
        <header className="bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg z-20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold leading-tight">DPSS Management</h1>
                  <p className="text-xs text-orange-100 opacity-90">Build Wisdom with Virtues</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={generateDemoStudents} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors" title="Add 20 demo students">
                    <Database className="w-4 h-4" /> Demo Data
                 </button>
                 <div className="h-6 w-px bg-white/30 mx-2"></div>
                 <button onClick={() => setIsQuickAddOpen(true)} className="flex items-center gap-1 bg-white text-orange-600 px-3 py-1.5 rounded-full text-sm font-bold shadow hover:bg-orange-50 transition-colors">
                    <Sparkles className="w-4 h-4" /> AI Quick Add
                 </button>
                 <div className="h-6 w-px bg-white/30 mx-2"></div>
                 <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50"><RotateCcw className="w-5 h-5"/></button>
                 <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50"><RotateCw className="w-5 h-5"/></button>
                 <button className="p-2 hover:bg-white/10 rounded-full"><Settings className="w-5 h-5"/></button>
                 <button className="p-2 hover:bg-white/10 rounded-full"><HelpCircle className="w-5 h-5"/></button>
              </div>
            </div>

            <div className="flex items-end gap-1">
              {[
                { id: 'hall_study', label: 'Hall Study', icon: Users },
                { id: 'office_study', label: 'Office Study', icon: BookOpen },
                { id: 'class_levels', label: 'Class Levels', icon: GraduationCap },
                { id: 'attendance', label: 'Attendance', icon: Calendar },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setState(prev => ({ ...prev, currentTab: tab.id as any }))}
                  className={`flex items-center gap-2 px-6 py-2 rounded-t-lg font-medium transition-all ${
                    state.currentTab === tab.id 
                      ? 'bg-slate-50 text-orange-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] translate-y-0.5' 
                      : 'bg-white/10 text-orange-100 hover:bg-white/20'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>
      )}

      {/* Toolbar / Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between shadow-sm z-10">
         <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Filter students..." className="pl-9 pr-4 py-1.5 bg-slate-100 rounded-full text-sm focus:ring-2 focus:ring-orange-200 outline-none w-64" />
            </div>
            
            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center gap-1 text-slate-600">
               <button onClick={() => setState(p => ({...p, zoomLevel: Math.max(0.5, p.zoomLevel - 0.1)}))} className="p-1.5 hover:bg-slate-100 rounded"><ZoomOut className="w-4 h-4"/></button>
               <span className="text-xs font-mono w-12 text-center">{Math.round(state.zoomLevel * 100)}%</span>
               <button onClick={() => setState(p => ({...p, zoomLevel: Math.min(1.5, p.zoomLevel + 0.1)}))} className="p-1.5 hover:bg-slate-100 rounded"><ZoomIn className="w-4 h-4"/></button>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            {/* Always show Add Row, it adapts to the current tab */}
            <button onClick={addStudent} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Row
            </button>
            <button onClick={toggleFullScreen} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" title="Toggle Full Screen">
              {state.isFullScreen ? <Minimize className="w-5 h-5"/> : <Maximize className="w-5 h-5"/>}
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-4 relative">
         {state.currentTab === 'attendance' ? (
           <AttendanceTable 
              students={filteredStudents}
              records={state.attendance}
              onMark={updateAttendance}
              onBatchMark={handleBatchAttendanceMark}
           />
         ) : (
           <DataTable 
             students={filteredStudents}
             section={state.currentTab as Section}
             levels={state.classLevels}
             onUpdate={updateStudent}
             onDelete={deleteStudent}
             zoomLevel={state.zoomLevel}
             fontSize={state.fontSize}
           />
         )}
      </main>

      {/* Modals */}
      <QuickAddModal 
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAdd={handleAIAdd}
      />

    </div>
  );
}