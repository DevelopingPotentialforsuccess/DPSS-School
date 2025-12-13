import React, { useState } from 'react';
import { Lock, Mail, Phone, ArrowRight, ShieldCheck, Building2, HelpCircle } from 'lucide-react';
import HelpGuide from './HelpGuide';

interface LoginScreenProps {
  onLogin: (user: string, schoolId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [identity, setIdentity] = useState('');
  const [schoolId, setSchoolId] = useState('Dpss-school');
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity.trim() || !schoolId.trim()) return;
    
    setIsLoading(true);
    // Simulate network request for "Team Collaboration" check
    setTimeout(() => {
      onLogin(identity, schoolId.toLowerCase().replace(/\s+/g, '-'));
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      
      {/* Help Button - Absolute Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center gap-2 bg-yellow-300 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-lg hover:bg-yellow-400 transition-all animate-pulse ring-4 ring-yellow-200"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Help / Verify</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-8 text-center">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">DPSS Team Portal</h1>
          <p className="text-orange-100 text-sm">Secure Access for Staff & Teachers</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* School/Team ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                School / Team ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none bg-slate-50"
                  placeholder="e.g. Dpss-school"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                This ID connects you to your team's shared database.
              </p>
            </div>

            {/* Identity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Email or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {identity.includes('@') ? (
                    <Mail className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                  placeholder="Enter your contact info"
                  autoFocus
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Real-time collaboration enabled. edits sync automatically with other team members in this School ID.</span>
                </p>
            </div>

            <button
              type="submit"
              disabled={!identity || !schoolId || isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold transition-all ${
                isLoading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isLoading ? (
                <span>Accessing Workspace...</span>
              ) : (
                <>
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400">
               Protected by DPSS Security System v2.0
             </p>
          </div>
        </div>
      </div>

      {/* Render Help Guide */}
      <HelpGuide isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default LoginScreen;