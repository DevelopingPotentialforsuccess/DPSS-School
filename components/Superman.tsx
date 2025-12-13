import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '../types';
import { isSameDay, parseISO, isValid } from 'date-fns';

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
        // Broaden check slightly to ensure we catch relevant students
        if (s.section !== 'hall_study' && s.section !== 'office_study') return false;
        
        if (!s.deadline) return false;
        if (!isValid(parseISO(s.deadline))) return false;
        
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

    // Check every 20 seconds
    const interval = setInterval(checkDeadlines, 20000);
    
    // Initial check (delay 2s to allow app load)
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
          // High z-index to fly over everything
          className="fixed top-1/2 z-[100] pointer-events-none flex items-center justify-center"
        >
          <div className="relative group">
             {/* Supergirl Image - Full Body Transparent PNG */}
             <img 
               src="https://www.pngarts.com/files/3/Supergirl-PNG-Image-Background.png"
               onError={(e) => {
                 // Fallback to a clear Green placeholder if the external image is blocked
                 e.currentTarget.src = "https://placehold.co/300x600/15803d/ffffff?text=Supergirl+Alert";
               }}
               alt="Supergirl" 
               className="h-[250px] w-auto object-contain drop-shadow-2xl"
             />
             
             {/* Assistant Name Board - Green Theme */}
             <div className="absolute top-[60%] left-[-20%] transform -rotate-6 bg-gradient-to-br from-white to-green-50 p-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border-4 border-green-600 max-w-[200px] text-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Alert Assistant
                </div>
                <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 leading-tight">
                  {activeAlert.assistant}
                </div>
                <div className="mt-2 text-[10px] font-medium text-slate-500 border-t pt-1 border-green-200">
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