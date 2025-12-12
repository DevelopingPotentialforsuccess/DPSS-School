import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '../types';
import { isSameDay, parseISO } from 'date-fns';

interface Props {
  students?: Student[];
}

const Superman: React.FC<Props> = ({ students = [] }) => {
  const [activeAlert, setActiveAlert] = useState<{assistant: string, student: string} | null>(null);

  useEffect(() => {
    const checkDeadlines = () => {
      // Logic: Trigger if student is in Hall/Office Study AND Deadline is TODAY
      const today = new Date();
      const dueStudents = students.filter(s => {
        if (s.section !== 'hall_study' && s.section !== 'office_study') return false;
        if (!s.deadline) return false;
        
        // Ensure assistant name exists to show
        if (!s.assistant) return false;

        return isSameDay(parseISO(s.deadline), today);
      });

      if (dueStudents.length > 0) {
        // Pick a random due student to showcase
        const target = dueStudents[Math.floor(Math.random() * dueStudents.length)];
        
        if (!activeAlert) { // Don't interrupt active animation
           setActiveAlert({ assistant: target.assistant, student: target.fullName });
           setTimeout(() => setActiveAlert(null), 10000); // Fly for 10 seconds
        }
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkDeadlines, 30000);
    
    // Initial check (delay slightly to allow app to load)
    const timeout = setTimeout(checkDeadlines, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [students, activeAlert]);

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div
          initial={{ x: '-40vw', y: '20vh' }}
          animate={{ x: '120vw', y: '-20vh' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 8, ease: "linear" }}
          className="fixed top-1/2 z-50 pointer-events-none flex items-center justify-center"
        >
          <div className="relative group">
             {/* Supergirl Image - Placeholder for the specific image requested */}
             <img 
               src="https://upload.wikimedia.org/wikipedia/en/3/30/Supergirl_%28Melissa_Benoist%29.jpg" 
               alt="Supergirl" 
               className="h-96 w-auto object-contain drop-shadow-2xl"
             />
             
             {/* Assistant Name Board - Positioned to look like she is holding it or it's floating with her */}
             <div className="absolute top-[60%] left-[-20%] transform -rotate-6 bg-gradient-to-br from-white to-slate-100 p-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border-4 border-red-600 max-w-[200px] text-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Alert Assistant
                </div>
                <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 leading-tight">
                  {activeAlert.assistant}
                </div>
                <div className="mt-2 text-[10px] font-medium text-slate-500 border-t pt-1 border-slate-200">
                  Student: {activeAlert.student}
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Superman;