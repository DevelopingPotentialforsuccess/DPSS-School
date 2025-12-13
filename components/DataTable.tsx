import React, { useState, useEffect, useRef } from 'react';
import { Student, Section } from '../types';
import { Trash2, ArrowLeft, ArrowRight, MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
import { differenceInDays, parseISO, isValid, format } from 'date-fns';
import CustomScrollbar, { VerticalScrollbar } from './CustomScrollbar';

interface DataTableProps {
  students: Student[];
  section: Section;
  levels: string[];
  timeShifts?: string[];
  onUpdate: (id: string, field: keyof Student, value: any) => void;
  onDelete: (id: string) => void;
  onInsert: (id: string, position: 'above' | 'below') => void;
  zoomLevel: number;
  fontSize: number;
}

// Configuration for dynamic columns
interface ColumnConfig {
  id: keyof Student;
  label: string;
  width: number;
  minWidth: number;
  type: 'text' | 'select' | 'date' | 'checkbox';
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'fullName', label: 'Full Name', width: 200, minWidth: 150, type: 'text' },
  { id: 'behavior', label: 'Behavior', width: 150, minWidth: 100, type: 'text' },
  { id: 'level', label: 'Level', width: 100, minWidth: 80, type: 'select' },
  { id: 'teachers', label: 'Teachers', width: 150, minWidth: 100, type: 'text' },
  { id: 'time', label: 'Time', width: 120, minWidth: 100, type: 'text' },
  { id: 'startDate', label: 'Start Date', width: 130, minWidth: 110, type: 'date' },
  { id: 'deadline', label: 'Deadline', width: 130, minWidth: 110, type: 'date' },
  { id: 'contactParent', label: 'Parent', width: 70, minWidth: 60, type: 'checkbox' },
  { id: 'headTeacher', label: 'Head Teacher', width: 120, minWidth: 90, type: 'checkbox' },
  { id: 'assistant', label: 'Assistant', width: 150, minWidth: 100, type: 'text' },
];

const DataTable: React.FC<DataTableProps> = ({ 
  students, 
  section, 
  levels,
  timeShifts = [], 
  onUpdate, 
  onDelete,
  onInsert,
  zoomLevel,
  fontSize
}) => {
  // Dynamic storage key based on section so tabs have independent layouts
  // Updated to v3 to force new Head Teacher column width/label to apply
  const storageKey = `dpss_columns_v3_${section}`;

  // Load column config from local storage or use default
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    } catch (e) {
      return DEFAULT_COLUMNS;
    }
  });

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.action-menu-trigger') && !(event.target as Element).closest('.action-menu-dropdown')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Persist column changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(columns));
  }, [columns, storageKey]);

  // Resizing State
  const [resizing, setResizing] = useState<{ index: number; startX: number; startWidth: number } | null>(null);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper to get consistent color for assistant
  const getAssistantColor = (name: string) => {
    if (!name) return 'bg-white hover:bg-slate-50';
    
    const normalized = name.toLowerCase().trim();
    
    // Strict mapping based on screenshot
    if (normalized.includes('piseth')) return 'bg-blue-100 hover:bg-blue-200';
    if (normalized.includes('daro')) return 'bg-[#fff9c4] hover:bg-[#fff59d]'; // Yellow/Cream
    if (normalized.includes('somann')) return 'bg-green-100 hover:bg-green-200';
    if (normalized.includes('dalin')) return 'bg-pink-100 hover:bg-pink-200';
    if (normalized.includes('sokha')) return 'bg-cyan-100 hover:bg-cyan-200';
    if (normalized.includes('sreypov')) return 'bg-purple-100 hover:bg-purple-200';
    if (normalized.includes('dara')) return 'bg-orange-100 hover:bg-orange-200';
    
    // Additional common ones
    if (normalized.includes('visal')) return 'bg-rose-100 hover:bg-rose-200';
    if (normalized.includes('roth')) return 'bg-teal-100 hover:bg-teal-200';

    // Fallback
    return 'bg-slate-50 hover:bg-slate-100';
  };

  // Row Color Logic
  const getRowColor = (student: Student) => {
    // Priority 1: Assistant Name (Whole row changes based on assistant)
    if (student.assistant) {
      return getAssistantColor(student.assistant);
    }
    
    // Fallback logic if no assistant specified
    if (student.headTeacher) return 'bg-red-50 hover:bg-red-100';
    if (student.contactParent) return 'bg-red-50/50 hover:bg-red-100/50';
    
    // Check Overdue
    if (student.deadline && isValid(parseISO(student.deadline))) {
      const today = new Date();
      const deadline = parseISO(student.deadline);
      if (differenceInDays(deadline, today) < 0) return 'bg-yellow-50 hover:bg-yellow-100';
    }

    return 'bg-white hover:bg-slate-50';
  };

  // Handle Resizing Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      
      const diff = e.clientX - resizing.startX;
      // Adjust diff by zoomLevel because the visual pixel movement needs to be scaled back to logic pixels
      const adjustedDiff = diff / zoomLevel; 
      
      const newWidth = Math.max(columns[resizing.index].minWidth, resizing.startWidth + adjustedDiff);

      setColumns(prev => {
        const next = [...prev];
        next[resizing.index] = { ...next[resizing.index], width: newWidth };
        return next;
      });
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
  }, [resizing, columns, zoomLevel]);

  const startResize = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent sorting or other events
    setResizing({
      index,
      startX: e.clientX,
      startWidth: columns[index].width
    });
  };

  // Handle Move Logic
  const moveColumn = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index > 0) {
      setColumns(prev => {
        const next = [...prev];
        [next[index], next[index - 1]] = [next[index - 1], next[index]];
        return next;
      });
    } else if (direction === 'right' && index < columns.length - 1) {
       setColumns(prev => {
        const next = [...prev];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        return next;
      });
    }
  };

  const scaleStyle = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'top left',
    width: `${100 / zoomLevel}%`,
    fontSize: `${fontSize}px`
  };

  // Helper component for Date Cell to handle formatting
  const DateCell = ({ value, onChange, isOverdue }: { value: string, onChange: (val: string) => void, isOverdue: boolean }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const displayValue = value && isValid(parseISO(value)) 
      ? format(parseISO(value), 'dd-MMM-yyyy') 
      : value;

    if (isEditing) {
      return (
        <input 
          type="date"
          autoFocus
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          className={`w-full h-full px-2 py-2 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 text-xs`}
        />
      );
    }

    return (
      <div 
        onClick={() => setIsEditing(true)}
        className={`w-full h-full px-3 py-2 cursor-text flex items-center ${isOverdue ? 'text-red-600 font-bold' : ''}`}
      >
        {displayValue}
      </div>
    );
  };

  // Helper to render cell content
  const renderCellContent = (student: Student, col: ColumnConfig) => {
    switch (col.type) {
      case 'checkbox':
        return (
          <div className="flex justify-center items-center h-full">
            <input 
              type="checkbox"
              checked={!!student[col.id]}
              onChange={(e) => onUpdate(student.id, col.id, e.target.checked)}
              className={`w-4 h-4 rounded border-slate-300 cursor-pointer ${col.id === 'headTeacher' ? 'text-red-600 focus:ring-red-500' : 'text-primary-600 focus:ring-primary-500'}`}
            />
          </div>
        );
      case 'select':
        return (
          <select
            value={String(student[col.id] || '')}
            onChange={(e) => onUpdate(student.id, col.id, e.target.value)}
            className="w-full h-full px-2 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 appearance-none cursor-pointer"
          >
            <option value="">Select</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        );
      case 'date':
        const isOverdue = col.id === 'deadline' && student.deadline && isValid(parseISO(student.deadline)) && differenceInDays(parseISO(student.deadline), new Date()) < 0;
        return (
          <DateCell 
            value={String(student[col.id] || '')} 
            onChange={(val) => onUpdate(student.id, col.id, val)}
            isOverdue={isOverdue}
          />
        );
      default:
        // Special case for 'time' to use datalist suggestions
        if (col.id === 'time') {
           return (
            <input 
                type="text" 
                value={String(student[col.id] || '')}
                onChange={(e) => onUpdate(student.id, col.id, e.target.value)}
                list={`time-list-${section}`}
                className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400"
            />
           );
        }
        return (
          <input 
            type="text" 
            value={String(student[col.id] || '')}
            onChange={(e) => onUpdate(student.id, col.id, e.target.value)}
            className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400"
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="flex-1 relative overflow-hidden">
        {/* Scroll Container with hidden native scrollbar */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-auto no-scrollbar h-full bg-white relative"
        >
          <div style={scaleStyle}>
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-slate-100 sticky top-0 z-20 shadow-sm text-slate-600 font-semibold select-none">
                <tr>
                  {/* Fixed Index Column */}
                  <th className="p-3 border-b border-r w-[50px] bg-slate-100 sticky left-0 z-30">#</th>
                  
                  {/* Dynamic Columns */}
                  {columns.map((col, index) => (
                    <th 
                      key={col.id} 
                      className="p-2 border-b border-r relative group/th hover:bg-slate-200 transition-colors bg-slate-100"
                      style={{ width: col.width }}
                    >
                      <div className="flex items-center justify-between h-full relative">
                        <span className="truncate pr-8">{col.label}</span>
                        
                        {/* Move Buttons (Visible on Hover) */}
                        <div className="absolute right-2 z-20 flex items-center gap-1 opacity-0 group-hover/th:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded shadow-sm border border-slate-200">
                          <button 
                            onClick={() => moveColumn(index, 'left')} 
                            disabled={index === 0}
                            className="p-1 hover:bg-white hover:text-primary-600 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Move Left"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => moveColumn(index, 'right')} 
                            disabled={index === columns.length - 1}
                            className="p-1 hover:bg-white hover:text-primary-600 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Move Right"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Resize Handle */}
                      <div 
                        onMouseDown={(e) => startResize(e, index)}
                        className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary-400 z-10 transition-colors" 
                        title="Drag to resize"
                      />
                    </th>
                  ))}

                  {/* Fixed Actions Column */}
                  <th className="p-3 border-b w-[80px] text-center sticky right-0 bg-slate-100 z-30 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student, index) => {
                  const rowClass = getRowColor(student);
                  const isMenuOpen = openMenuId === student.id;
                  
                  // Decide if menu should open upwards (if near bottom)
                  const isNearBottom = index > students.length - 3 && students.length > 4;

                  return (
                    <tr key={student.id} className={`transition-colors group ${rowClass}`}>
                      {/* Fixed Index Cell */}
                      <td className="p-3 border-r text-slate-400 text-xs bg-inherit sticky left-0 z-10 border-b">{index + 1}</td>
                      
                      {/* Dynamic Cells */}
                      {columns.map((col) => (
                        <td key={col.id} className="p-0 border-r relative border-b">
                          {renderCellContent(student, col)}
                        </td>
                      ))}

                      {/* Fixed Actions Cell */}
                      <td className="p-2 text-center border-b sticky right-0 z-10 bg-inherit shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)]">
                        <div className={`flex justify-center transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <div className="relative">
                              <button 
                                onClick={(e) => {
                                   e.stopPropagation();
                                   setOpenMenuId(isMenuOpen ? null : student.id);
                                }}
                                className={`action-menu-trigger p-1.5 rounded transition-colors ${isMenuOpen ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                title="Actions"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {isMenuOpen && (
                                <div 
                                    className={`action-menu-dropdown absolute right-0 z-50 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-left ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'}`}
                                >
                                    <button 
                                        onClick={() => { onInsert(student.id, 'above'); setOpenMenuId(null); }}
                                        className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <ArrowUp className="w-3.5 h-3.5 text-slate-400" /> 
                                        <span>Insert Row Above</span>
                                    </button>
                                    <button 
                                        onClick={() => { onInsert(student.id, 'below'); setOpenMenuId(null); }}
                                        className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <ArrowDown className="w-3.5 h-3.5 text-slate-400" /> 
                                        <span>Insert Row Below</span>
                                    </button>
                                    <div className="h-px bg-slate-100 my-1"></div>
                                    <button 
                                        onClick={() => { onDelete(student.id); setOpenMenuId(null); }}
                                        className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> 
                                        <span>Delete Row</span>
                                    </button>
                                </div>
                              )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Empty State */}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <p>No students in this list yet.</p>
                          <p className="text-sm">Click "+ Add Row" or "AI Quick Add" to get started.</p>
                        </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Vertical Scrollbar Overlay */}
          <VerticalScrollbar containerRef={scrollContainerRef} />
        </div>
        
        {/* Datalist for Time Suggestions */}
        <datalist id={`time-list-${section}`}>
           {timeShifts.map((t) => (
             <option key={t} value={t} />
           ))}
        </datalist>

      </div>
      
      {/* Custom Scrollbar at Bottom */}
      <CustomScrollbar containerRef={scrollContainerRef} />
    </div>
  );
};

export default DataTable;