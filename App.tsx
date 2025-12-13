import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, Calendar, Users, GraduationCap, 
  Trash2, Download, Share2, HelpCircle, 
  RotateCcw, RotateCw, Settings, ZoomIn, ZoomOut, Maximize, Minimize,
  Plus, Sparkles, Database, Type, Clock, X, ChevronDown, Filter, LogOut,
  Cloud, CloudOff, Wifi
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, isValid } from 'date-fns';

import { Student, Section, AttendanceRecord, AppState } from './types';
import { INITIAL_LEVELS, DEFAULT_STUDENT, TIME_SHIFTS } from './constants';
import DataTable from './components/DataTable';
import AttendanceTable from './components/AttendanceTable';
import QuickAddModal from './components/QuickAddModal';
import Superman from './components/Superman';
import LoginScreen from './components/LoginScreen';
import ConnectionModal from './components/ConnectionModal';
import HelpGuide from './components/HelpGuide';
import { isCloudEnabled, saveSchoolData, subscribeToSchoolData } from './services/firebase';

const STORAGE_KEY = 'dpss_school_data_v1';
const AUTH_KEY = 'dpss_auth_user';
const SCHOOL_ID_KEY = 'dpss_school_id';

// Dropdown Component for Filters with Fixed Positioning
interface FilterOption {
  value: string;
  label?: string;
  count: number;
}

const FilterDropdown = ({ 
  icon: Icon, 
  label, 
  value, 
  options, 
  onChange 
}: { 
  icon: any, 
  label: string, 
  value: string | null, 
  options: FilterOption[], 
  onChange: (val: string | null) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, minWidth: 0 });

  // Update coordinates when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        minWidth: Math.max(rect.width, 240) // Ensure enough width for counts
      });
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle scroll to update position or close
  useEffect(() => {
    const handleScroll = () => {
        if(isOpen) setIsOpen(false); // Close on scroll for simplicity
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  const displayLabel = value 
    ? (options.find(o => o.value === value)?.label || value)
    : label;

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors shadow-sm min-w-fit ${value ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}
      >
        <Icon className={`w-4 h-4 ${value ? 'text-orange-600' : 'text-slate-500'}`} />
        <div className="text-left flex flex-col leading-none">
          <span className={`text-[10px] font-medium ${value ? 'text-orange-600' : 'text-slate-400'}`}>
            {value ? 'Filtered by' : 'All'}
          </span>
          <span className="text-sm font-semibold truncate max-w-[120px]">
            {displayLabel}
          </span>
        </div>
        <ChevronDown className={`w-3 h-3 ml-1 ${value ? 'text-orange-600' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed z-[100] bg-white border border-slate-200 rounded-lg shadow-xl max-h-80 overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-100"
          style={{ top: coords.top, left: coords.left, minWidth: coords.minWidth }}
        >
          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
            <input 
              type="text" 
              placeholder={`Search ${label}...`} 
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
              onClick={(e) => e.stopPropagation()} 
              autoFocus
            />
          </div>
          <button
            onClick={() => { onChange(null); setIsOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center justify-between ${!value ? 'font-bold text-primary-600 bg-primary-50' : 'text-slate-700'}`}
          >
             <span>All {label}</span>
             {!value && <CheckIcon className="w-3 h-3" />}
          </button>
          <div className="flex-1 overflow-y-auto">
            {options.map((opt) => (
                <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center justify-between border-t border-slate-50 ${value === opt.value ? 'font-bold text-primary-600 bg-primary-50' : 'text-slate-700'}`}
                >
                <span className="truncate pr-2">{opt.label || opt.value}</span>
                <div className="flex items-center gap-2">
                   <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium min-w-[20px] text-center">
                     {opt.count}
                   </span>
                   {value === opt.value && <CheckIcon className="w-3 h-3 flex-shrink-0" />}
                </div>
                </button>
            ))}
            {options.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 italic">No {label.toLowerCase()} found</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);


export default function App() {
  // Auth State
  const [authUser, setAuthUser] = useState<string | null>(() => localStorage.getItem(AUTH_KEY));
  const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(() => localStorage.getItem(SCHOOL_ID_KEY));
  
  // State initialization
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      students: [],
      attendance: [],
      classLevels: INITIAL_LEVELS,
      currentTab: 'hall_study',
      zoomLevel: 1,
      fontSize: 14,
      isFullScreen: false
    };
  });

  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // History for Undo/Redo
  const [history, setHistory] = useState<AppState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryAction, setIsHistoryAction] = useState(false);
  
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    teacher: null as string | null,
    assistant: null as string | null,
    deadline: null as string | null,
    time: null as string | null
  });

  // Local Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Cloud Persistence & Sync
  useEffect(() => {
    // 1. Subscribe to Cloud changes
    let unsubscribe = () => {};
    const useCloud = isCloudEnabled() && currentSchoolId;
    setIsCloudConnected(!!useCloud);

    if (useCloud) {
       unsubscribe = subscribeToSchoolData(currentSchoolId!, (newData) => {
         setState(prev => ({
           ...prev,
           students: newData.students || prev.students,
           attendance: newData.attendance || prev.attendance,
           classLevels: newData.classLevels || prev.classLevels
         }));
       });
    }

    return () => unsubscribe();
  }, [currentSchoolId]);

  // Save to Cloud on Change (Debounced ideally, but simple here)
  useEffect(() => {
    if (isCloudEnabled() && currentSchoolId && authUser) {
      const timeoutId = setTimeout(() => {
        saveSchoolData(currentSchoolId, {
          students: state.students,
          attendance: state.attendance,
          classLevels: state.classLevels
        });
      }, 1000); // 1s debounce to prevent write spam
      return () => clearTimeout(timeoutId);
    }
  }, [state.students, state.attendance, state.classLevels, currentSchoolId, authUser]);


  // Auth Persistence
  useEffect(() => {
    if (authUser) {
      localStorage.setItem(AUTH_KEY, authUser);
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
    
    if (currentSchoolId) {
      localStorage.setItem(SCHOOL_ID_KEY, currentSchoolId);
    } else {
      localStorage.removeItem(SCHOOL_ID_KEY);
    }
  }, [authUser, currentSchoolId]);

  // Handle Data Export
  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dpss_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle Data Import
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.students && Array.isArray(json.students)) {
           setState(prev => ({
             ...prev,
             students: json.students,
             attendance: json.attendance || [],
             classLevels: json.classLevels || INITIAL_LEVELS
           }));
           alert("Data imported successfully!");
        } else {
          alert("Invalid data file.");
        }
      } catch (err) {
        alert("Failed to parse file.");
      }
    };
    reader.readAsText(file);
  };


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

  const updateStudent = (id: string, field: keyof Student, value: any) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const deleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
        setState(prev => ({
            ...prev,
            students: prev.students.filter(s => s.id !== id)
        }));
    }
  };

  const handleInsertRow = (targetId: string, position: 'above' | 'below') => {
    setState(prev => {
        const index = prev.students.findIndex(s => s.id === targetId);
        if (index === -1) return prev;
        
        // Create new student with defaults + current active filters to ensure visibility
        const newStudent: Student = {
            ...DEFAULT_STUDENT,
            id: uuidv4(),
            section: prev.currentTab as Section,
            teachers: filters.teacher || DEFAULT_STUDENT.teachers,
            assistant: filters.assistant || DEFAULT_STUDENT.assistant,
            time: filters.time || DEFAULT_STUDENT.time,
        };
        
        const newStudents = [...prev.students];
        const insertIndex = position === 'above' ? index : index + 1;
        newStudents.splice(insertIndex, 0, newStudent);
        
        return { ...prev, students: newStudents };
    });
  };

  const handleAIAdd = (newStudents: Partial<Student>[]) => {
    const processed: Student[] = newStudents.map(s => ({
      ...DEFAULT_STUDENT,
      ...s,
      id: uuidv4(),
      section: state.currentTab as Section,
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
      const filtered = prev.attendance.filter(r => !(r.studentId === studentId && r.date === date && r.timeShift === shift));
      return {
        ...prev,
        attendance: [...filtered, { id: uuidv4(), studentId, date, timeShift: shift, status }]
      };
    });
  };

  const handleBatchAttendanceMark = (updates: { studentId: string; status: 0 | 0.25 | 1 }[], date: string) => {
    setState(prev => {
      const otherRecords = prev.attendance.filter(r => r.date !== date);
      const newRecords: AttendanceRecord[] = [];
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

  const updateFontSize = (delta: number) => {
      setState(prev => ({ ...prev, fontSize: Math.max(10, Math.min(24, prev.fontSize + delta)) }));
  };

  const updateZoom = (delta: number) => {
      setState(prev => ({ ...prev, zoomLevel: Math.max(0.5, Math.min(1.5, prev.zoomLevel + delta)) }));
  };

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

  const handleLogin = (user: string, schoolId: string) => {
    setAuthUser(user);
    setCurrentSchoolId(schoolId);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      setAuthUser(null);
      setCurrentSchoolId(null);
      // Clear data on logout so next user doesn't see it until they log in
      setState(prev => ({...prev, students: [], attendance: []})); 
    }
  };

  // derived data
  const currentTabStudents = useMemo(() => {
    return state.students.filter(s => s.section === state.currentTab);
  }, [state.students, state.currentTab]);

  // Extract Unique Values for Filters with Counts
  const uniqueTeachers = useMemo(() => {
    const counts: Record<string, number> = {};
    currentTabStudents.forEach(s => {
       if (s.teachers) {
           s.teachers.split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
               counts[t] = (counts[t] || 0) + 1;
           });
       }
    });
    return Object.entries(counts)
        .map(([val, count]) => ({ value: val, count }))
        .sort((a, b) => a.value.localeCompare(b.value));
  }, [currentTabStudents]);

  const uniqueAssistants = useMemo(() => {
    const counts: Record<string, number> = {};
    currentTabStudents.forEach(s => {
       if (s.assistant) {
           s.assistant.split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
               counts[t] = (counts[t] || 0) + 1;
           });
       }
    });
    return Object.entries(counts)
        .map(([val, count]) => ({ value: val, count }))
        .sort((a, b) => a.value.localeCompare(b.value));
  }, [currentTabStudents]);

  const uniqueTimes = useMemo(() => {
    const counts: Record<string, number> = {};
    currentTabStudents.forEach(s => {
        if (s.time) {
            counts[s.time] = (counts[s.time] || 0) + 1;
        }
    });
    return Object.entries(counts)
        .map(([val, count]) => ({ value: val, count }))
        .sort((a, b) => a.value.localeCompare(b.value));
  }, [currentTabStudents]);
  
  const uniqueDeadlines = useMemo(() => {
      const counts: Record<string, number> = {};
      currentTabStudents.forEach(s => {
          if (s.deadline && isValid(parseISO(s.deadline))) {
              counts[s.deadline] = (counts[s.deadline] || 0) + 1;
          }
      });
      return Object.entries(counts)
          .map(([val, count]) => ({ value: val, label: format(parseISO(val), 'dd-MMM-yyyy'), count }))
          .sort((a, b) => a.value.localeCompare(b.value));
  }, [currentTabStudents]);

  // Apply Filters
  const filteredStudents = useMemo(() => {
    return currentTabStudents.filter(s => {
      // Partial match for teachers/assistants because a student might have "T. John, T. Sarah"
      // If filter is "T. John", it should show.
      if (filters.teacher) {
         if (!s.teachers) return false;
         const studentTeachers = s.teachers.split(',').map(t => t.trim());
         if (!studentTeachers.includes(filters.teacher)) return false;
      }
      if (filters.assistant) {
        if (!s.assistant) return false;
        const studentAssistants = s.assistant.split(',').map(t => t.trim());
        if (!studentAssistants.includes(filters.assistant)) return false;
      }
      
      if (filters.time && s.time !== filters.time) return false;
      if (filters.deadline && s.deadline !== filters.deadline) return false;
      return true;
    });
  }, [currentTabStudents, filters]);

  // Auth Guard
  if (!authUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 font-sans ${state.isFullScreen ? 'h-screen' : ''}`}>
      <Superman students={state.students} />
      
      {/* Header */}
      {!state.isFullScreen && (
        <header className="bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg z-20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-lg">
                   <span className="text-orange-600 font-bold text-xl px-1">DS</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold leading-tight">DPSS School Management</h1>
                  <p className="text-xs text-orange-100 opacity-90 flex items-center gap-2">
                     <span>Build Wisdom with Virtues</span>
                     <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                     <span>{currentSchoolId}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 {/* Cloud Status Indicator with Click Handler */}
                 <button 
                   onClick={() => setIsConnectionModalOpen(true)}
                   className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                     isCloudConnected 
                      ? 'bg-green-500/20 text-white border-green-400/30 hover:bg-green-500/30' 
                      : 'bg-slate-900/20 text-white/80 border-white/10 hover:bg-slate-900/30'
                   }`}
                   title="Click to manage connection settings"
                 >
                    {isCloudConnected ? <Wifi className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                    {isCloudConnected ? 'Live Sync' : 'Offline'}
                 </button>

                 <div className="h-6 w-px bg-white/30 mx-2"></div>

                 {/* Top Right Actions */}
                 <div className="flex items-center gap-2 bg-orange-700/30 px-3 py-1 rounded-lg text-xs font-medium">
                    <span>Total: {currentTabStudents.length}</span>
                 </div>
                 <div className="flex items-center gap-2 bg-orange-700/30 px-3 py-1 rounded-lg text-xs font-medium">
                    <span>Showing: {filteredStudents.length}</span>
                 </div>

                 <div className="h-6 w-px bg-white/30 mx-2"></div>

                 <button onClick={() => setIsQuickAddOpen(true)} className="flex items-center gap-1 bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-purple-700 transition-colors">
                    <Sparkles className="w-4 h-4" /> Quick Add
                 </button>

                 <button 
                    onClick={() => setIsHelpOpen(true)} 
                    className="flex items-center gap-1 bg-yellow-300 text-yellow-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg hover:bg-yellow-400 transition-colors ml-2 ring-4 ring-yellow-200 animate-pulse" 
                    title="Watch Verification Tutorial"
                 >
                    <HelpCircle className="w-5 h-5 animate-bounce" />
                    <span>Help Video</span>
                 </button>

                 <div className="h-6 w-px bg-white/30 mx-2"></div>

                 <button onClick={handleLogout} className="text-orange-100 hover:text-white" title="Log Out">
                   <LogOut className="w-5 h-5" />
                 </button>
              </div>
            </div>

            <div className="flex items-end gap-8">
              {[
                { id: 'hall_study', label: 'Hall Study', icon: Users },
                { id: 'office_study', label: 'Office Study', icon: BookOpen },
                { id: 'class_levels', label: 'Class Levels', icon: GraduationCap },
                { id: 'attendance', label: 'Attendance', icon: Calendar },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setState(prev => ({ ...prev, currentTab: tab.id as any }))}
                  className={`flex flex-col items-center gap-1 pb-2 font-medium transition-all border-b-4 ${
                    state.currentTab === tab.id 
                      ? 'border-white text-white' 
                      : 'border-transparent text-orange-100 hover:text-white hover:border-orange-300'
                  }`}
                >
                  <span className="text-sm font-bold">{tab.label.replace(' ', '\n')}</span> 
                </button>
              ))}
            </div>
          </div>
        </header>
      )}

      {/* New Redesigned Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 overflow-x-auto shadow-sm z-10 custom-scrollbar">
         
         {/* Filter Buttons with Dropdowns */}
         <FilterDropdown 
            icon={Users} 
            label="Teachers" 
            value={filters.teacher} 
            options={uniqueTeachers} 
            onChange={(val) => setFilters(prev => ({...prev, teacher: val}))} 
         />
         <FilterDropdown 
            icon={Users} 
            label="Assistants" 
            value={filters.assistant} 
            options={uniqueAssistants} 
            onChange={(val) => setFilters(prev => ({...prev, assistant: val}))} 
         />
         <FilterDropdown 
            icon={Calendar} 
            label="Deadlines" 
            value={filters.deadline} 
            options={uniqueDeadlines} 
            onChange={(val) => setFilters(prev => ({...prev, deadline: val}))} 
         />
         <FilterDropdown 
            icon={Clock} 
            label="Times" 
            value={filters.time} 
            options={uniqueTimes} 
            onChange={(val) => setFilters(prev => ({...prev, time: val}))} 
         />

         {/* Clear Filters if any */}
         {Object.values(filters).some(Boolean) && (
            <button 
              onClick={() => setFilters({ teacher: null, assistant: null, deadline: null, time: null })}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
         )}

         <div className="h-8 w-px bg-slate-200 mx-1"></div>

         {/* Settings */}
         <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm flex-shrink-0" title="Settings">
             <Settings className="w-5 h-5" />
         </button>

         {/* Font Size */}
         <div className="flex items-center bg-slate-100/50 rounded-lg border border-slate-200 p-1 flex-shrink-0">
             <button onClick={() => updateFontSize(-1)} className="p-1.5 hover:bg-white rounded-md text-slate-500 transition-all shadow-sm hover:shadow" title="Decrease Font">
                 <Type className="w-4 h-4 transform scale-75" />
             </button>
             <span className="w-10 text-center text-sm font-semibold text-slate-700 select-none">{state.fontSize}</span>
              <button onClick={() => updateFontSize(1)} className="p-1.5 hover:bg-white rounded-md text-slate-500 transition-all shadow-sm hover:shadow" title="Increase Font">
                 <Type className="w-4 h-4" />
             </button>
         </div>

         {/* Zoom */}
         <div className="flex items-center bg-slate-100/50 rounded-lg border border-slate-200 p-1 gap-1 flex-shrink-0">
             <button onClick={() => updateZoom(-0.1)} className="p-1.5 hover:bg-white rounded-md text-slate-500 transition-all shadow-sm hover:shadow" title="Zoom Out">
                 <ZoomOut className="w-4 h-4" />
             </button>
             <span className="w-14 text-center text-sm font-semibold text-slate-700 select-none">{Math.round(state.zoomLevel * 100)}%</span>
              <button onClick={() => updateZoom(0.1)} className="p-1.5 hover:bg-white rounded-md text-slate-500 transition-all shadow-sm hover:shadow" title="Zoom In">
                 <ZoomIn className="w-4 h-4" />
             </button>
         </div>

         <div className="flex-1"></div>
         
         {/* Action Buttons */}
         <button onClick={toggleFullScreen} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium shadow-sm flex-shrink-0">
             {state.isFullScreen ? <Minimize className="w-4 h-4"/> : <Maximize className="w-4 h-4"/>}
             <span>Full Screen</span>
         </button>
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
             key={state.currentTab} 
             students={filteredStudents}
             section={state.currentTab as Section}
             levels={state.classLevels}
             timeShifts={TIME_SHIFTS}
             onUpdate={updateStudent}
             onDelete={deleteStudent}
             onInsert={handleInsertRow}
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
      <ConnectionModal 
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        isOnline={isCloudConnected}
        onExport={handleExport}
        onImport={handleImport}
      />
      <HelpGuide 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

    </div>
  );
}