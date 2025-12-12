import React, { useState, useRef } from 'react';
import { X, Sparkles, Loader2, Check, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { parseStudentData } from '../services/geminiService';
import { Student } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (students: Partial<Student>[]) => void;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Partial<Student>[]>([]);
  
  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<{data: string, mimeType: string} | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      
      // Extract base64 data and mime type
      const matches = result.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        setSelectedImage({
          mimeType: matches[1],
          data: matches[2]
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcess = async () => {
    if (!text.trim() && !selectedImage) return;
    setLoading(true);
    try {
      const results = await parseStudentData(text, selectedImage?.data, selectedImage?.mimeType);
      setPreview(results);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onAdd(preview);
    setText('');
    setPreview([]);
    clearImage();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-bold text-slate-900">AI Quick Add</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {preview.length === 0 ? (
            <div className="space-y-4">
               <p className="text-sm text-slate-500">
                 Paste unstructured text or upload an image of a student list. The AI will extract names, dates, teachers, and study details.
               </p>
               
               <textarea
                 className="w-full h-32 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                 placeholder="Example: John Doe starts on Jan 15 with Teacher Sreypov. Mary needs parent contact."
                 value={text}
                 onChange={(e) => setText(e.target.value)}
               />

               {/* Image Preview Area */}
               {imagePreview && (
                  <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={imagePreview} alt="Upload Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button 
                         onClick={clearImage}
                         className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors"
                       >
                         <Trash2 className="w-4 h-4" /> Remove Image
                       </button>
                    </div>
                  </div>
               )}

               <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${imagePreview ? 'border-primary-200 bg-primary-50 text-primary-600' : 'border-slate-200 text-slate-400 hover:border-primary-400 hover:text-primary-500'}`}
                  >
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                  </button>
                  
                  <button className="flex-1 py-8 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors">
                    <FileText className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">Upload PDF (Coming Soon)</span>
                  </button>
               </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Preview ({preview.length} students)</h3>
              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 font-medium">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((s, idx) => (
                      <tr key={idx} className="border-t border-slate-200">
                        <td className="p-3 font-medium text-slate-900">{s.fullName}</td>
                        <td className="p-3 text-slate-600">{s.startDate || '-'}</td>
                        <td className="p-3 text-slate-600">{s.teachers || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
           {preview.length === 0 ? (
             <button 
               onClick={handleProcess}
               disabled={(!text && !selectedImage) || loading}
               className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
               Process with AI
             </button>
           ) : (
             <>
               <button 
                 onClick={() => setPreview([])}
                 className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
               >
                 Back
               </button>
               <button 
                 onClick={handleConfirm}
                 className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
               >
                 <Check className="w-4 h-4" />
                 Confirm Import
               </button>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;