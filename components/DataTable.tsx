import React from 'react';
import { Student, Section } from '../types';
import { Trash2, AlertCircle, Phone, CheckCircle, MoreHorizontal } from 'lucide-react';
import { differenceInDays, parseISO, isValid } from 'date-fns';

interface DataTableProps {
  students: Student[];
  section: Section;
  levels: string[];
  onUpdate: (id: string, field: keyof Student, value: any) => void;
  onDelete: (id: string) => void;
  zoomLevel: number;
  fontSize: number;
}

const DataTable: React.FC<DataTableProps> = ({ 
  students, 
  section, 
  levels, 
  onUpdate, 
  onDelete,
  zoomLevel,
  fontSize
}) => {
  
  // Row Color Logic
  const getRowColor = (student: Student) => {
    if (student.headTeacher) return 'bg-red-50 hover:bg-red-100';
    if (student.contactParent) return 'bg-red-50/50 hover:bg-red-100/50';
    
    // Check Overdue
    if (student.deadline && isValid(parseISO(student.deadline))) {
      const today = new Date();
      const deadline = parseISO(student.deadline);
      if (differenceInDays(deadline, today) < 0) return 'bg-yellow-50 hover:bg-yellow-100';
    }

    // Assistant Coloring (Simple Hash-like distribution for demo)
    if (student.assistant) {
      const charCode = student.assistant.charCodeAt(0);
      if (charCode % 3 === 0) return 'bg-blue-50 hover:bg-blue-100';
      if (charCode % 3 === 1) return 'bg-green-50 hover:bg-green-100';
      return 'bg-purple-50 hover:bg-purple-100';
    }

    return 'bg-white hover:bg-slate-50';
  };

  const scaleStyle = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'top left',
    width: `${100 / zoomLevel}%`,
    fontSize: `${fontSize}px`
  };

  return (
    <div className="overflow-x-auto custom-scrollbar h-full border rounded-lg bg-white shadow-sm relative">
       <div style={scaleStyle}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm text-slate-600 font-semibold select-none">
            <tr>
              <th className="p-3 border-b border-r min-w-[50px] w-[50px]">#</th>
              <th className="p-3 border-b border-r min-w-[200px]">Full Name</th>
              <th className="p-3 border-b border-r min-w-[150px]">Behavior</th>
              <th className="p-3 border-b border-r min-w-[100px]">Level</th>
              <th className="p-3 border-b border-r min-w-[150px]">Teachers</th>
              <th className="p-3 border-b border-r min-w-[120px]">Time</th>
              <th className="p-3 border-b border-r min-w-[120px]">Start Date</th>
              <th className="p-3 border-b border-r min-w-[120px]">Deadline</th>
              <th className="p-3 border-b border-r text-center w-[80px]" title="Contact Parent">Parent</th>
              <th className="p-3 border-b border-r text-center w-[80px]" title="Head Teacher">HT</th>
              <th className="p-3 border-b border-r min-w-[150px]">Assistant</th>
              <th className="p-3 border-b w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student, index) => {
              const rowClass = getRowColor(student);
              return (
                <tr key={student.id} className={`transition-colors group ${rowClass}`}>
                  <td className="p-3 border-r text-slate-400 text-xs">{index + 1}</td>
                  
                  {/* Name */}
                  <td className="p-0 border-r relative">
                     <input 
                       type="text" 
                       value={student.fullName}
                       onChange={(e) => onUpdate(student.id, 'fullName', e.target.value)}
                       className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400"
                     />
                  </td>

                  {/* Behavior */}
                  <td className="p-0 border-r relative">
                     <input 
                       type="text" 
                       value={student.behavior}
                       onChange={(e) => onUpdate(student.id, 'behavior', e.target.value)}
                       className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400"
                     />
                  </td>

                  {/* Level */}
                  <td className="p-0 border-r relative">
                     <select
                       value={student.level}
                       onChange={(e) => onUpdate(student.id, 'level', e.target.value)}
                       className="w-full h-full px-2 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 appearance-none cursor-pointer"
                     >
                       <option value="">Select</option>
                       {levels.map(l => <option key={l} value={l}>{l}</option>)}
                     </select>
                  </td>

                  {/* Teachers */}
                  <td className="p-0 border-r relative">
                     <input 
                       type="text" 
                       value={student.teachers}
                       onChange={(e) => onUpdate(student.id, 'teachers', e.target.value)}
                       className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400"
                     />
                  </td>

                  {/* Time */}
                  <td className="p-0 border-r relative">
                     <input 
                       type="text" 
                       value={student.time}
                       onChange={(e) => onUpdate(student.id, 'time', e.target.value)}
                       className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400"
                     />
                  </td>

                  {/* Start Date */}
                  <td className="p-0 border-r relative">
                     <input 
                       type="date" 
                       value={student.startDate}
                       onChange={(e) => onUpdate(student.id, 'startDate', e.target.value)}
                       className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 text-xs"
                     />
                  </td>

                  {/* Deadline */}
                  <td className="p-0 border-r relative">
                     <input 
                       type="date" 
                       value={student.deadline}
                       onChange={(e) => onUpdate(student.id, 'deadline', e.target.value)}
                       className={`w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 text-xs ${student.deadline && isValid(parseISO(student.deadline)) && differenceInDays(parseISO(student.deadline), new Date()) < 0 ? 'text-red-600 font-bold' : ''}`}
                     />
                  </td>

                  {/* Contact Parent */}
                  <td className="p-0 border-r text-center align-middle">
                     <input 
                        type="checkbox"
                        checked={student.contactParent}
                        onChange={(e) => onUpdate(student.id, 'contactParent', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 cursor-pointer"
                     />
                  </td>

                  {/* Head Teacher */}
                  <td className="p-0 border-r text-center align-middle">
                     <input 
                        type="checkbox"
                        checked={student.headTeacher}
                        onChange={(e) => onUpdate(student.id, 'headTeacher', e.target.checked)}
                        className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500 cursor-pointer"
                     />
                  </td>

                  {/* Assistant */}
                  <td className="p-0 border-r relative">
                     <input 
                       type="text" 
                       value={student.assistant}
                       onChange={(e) => onUpdate(student.id, 'assistant', e.target.value)}
                       className="w-full h-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400"
                     />
                  </td>

                  {/* Actions */}
                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onDelete(student.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {/* Empty State / Add Row Placeholder */}
            {students.length === 0 && (
               <tr>
                 <td colSpan={12} className="p-12 text-center text-slate-400">
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
    </div>
  );
};

export default DataTable;
