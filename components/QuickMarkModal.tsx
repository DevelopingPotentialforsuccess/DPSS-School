import React, { useState, useMemo } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Student } from '../types';

interface QuickMarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  date: string;
  shift: string;
  onConfirm: (updates: { studentId: string; status: 0 | 0.25 | 1 }[]) => void;
}

const QuickMarkModal: React.FC<QuickMarkModalProps> = ({ 
  isOpen, 
  onClose, 
  students, 
  date, 
  shift, 
  onConfirm 
}) => {
  const [text, setText] = useState('');

  const preview = useMemo(() => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const updates: { studentId: string; status: 0 | 0.25 | 1; name: string }[] = [];
    
    // Track which students have been manually marked
    const markedIds = new Set<string>();

    // Process manual entries (Absent or Permission)
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      let status: 0 | 0.25 | 1 = 1; // Default to Absent if listed
      let searchName = lowerLine;

      if (lowerLine.endsWith(' p') || lowerLine.endsWith(' permission')) {
        status = 0.25;
        searchName = lowerLine.replace(/ p$| permission$/, '').trim();
      }

      // Simple fuzzy match
      const student = students.find(s => 
        s.fullName.toLowerCase().includes(searchName) && !markedIds.has(s.id)
      );

      if (student) {
        updates.push({ studentId: student.id, status, name: student.fullName });
        markedIds.add(student.id);
      }
    });

    // Mark everyone else as Present (0)
    students.forEach(s => {
      if (!markedIds.has(s.id)) {
        updates.push({ studentId: s.id, status: 0, name: s.fullName });
      }
    });

    return updates;
  }, [text, students]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Red Header */}
        <div className="flex justify-between items-start p-6 bg-red-700 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-xl font-bold">Quick Mark Today</h2>
            </div>
            <p className="text-sm text-red-100 opacity-90">{date}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            
            <div className="space-y-2 text-sm text-slate-700">
               <p className="font-bold text-slate-900">Instructions:</p>
               <ul className="space-y-1 ml-4 list-disc marker:text-slate-400">
                  <li>Type absent student name → marked as <strong className="text-red-600">1</strong> (absent)</li>
                  <li>Type "Name P" or "Name Permission" → marked as <strong className="text-orange-500">0.25</strong> (permission)</li>
                  <li>All others → marked as <strong className="text-green-600">0</strong> (present)</li>
                  <li>Applied to all time shifts for today</li>
               </ul>
            </div>

            <div className="relative">
              <textarea
                className="w-full h-40 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none font-mono text-sm shadow-sm"
                placeholder={`Example:\nNeang Bunthouen\nSok Pisey P\nChan Dara Permission`}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium border border-slate-200 bg-white"
           >
             Cancel
           </button>
           <button 
             onClick={() => {
                onConfirm(preview);
                onClose();
                setText('');
             }}
             className="bg-red-400 hover:bg-red-500 text-white px-8 py-2 rounded-lg font-medium shadow-sm"
           >
             Process
           </button>
        </div>
      </div>
    </div>
  );
};

export default QuickMarkModal;