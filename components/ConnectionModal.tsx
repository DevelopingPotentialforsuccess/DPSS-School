import React, { useState } from 'react';
import { Cloud, CloudOff, Download, Upload, Check, AlertTriangle, X, Settings, Database } from 'lucide-react';
import { updateFirebaseConfig } from '../services/firebase';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ 
  isOpen, 
  onClose, 
  isOnline, 
  onExport, 
  onImport 
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'cloud'>('manual');
  const [configJson, setConfigJson] = useState('');
  const [configError, setConfigError] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleConfigSave = () => {
    try {
      const config = JSON.parse(configJson);
      if (!config.apiKey || !config.projectId) {
        throw new Error("Invalid Config: Missing apiKey or projectId");
      }
      updateFirebaseConfig(config);
      onClose();
    } catch (e) {
      setConfigError("Invalid JSON format. Please copy the object directly from Firebase Console.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const executeImport = () => {
    if (importFile) {
      if (confirm("This will overwrite your current data. Are you sure?")) {
        onImport(importFile);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {isOnline ? <Cloud className="text-green-500" /> : <CloudOff className="text-slate-400" />}
              Sync & Data Settings
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage how your data is saved and shared.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'manual' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Download className="w-4 h-4" /> Manual Transfer
          </button>
          <button 
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'cloud' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Database className="w-4 h-4" /> Cloud Setup
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'manual' ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p className="font-semibold mb-1">How to move data between browsers:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Click <strong>Export Data</strong> on your source browser (e.g., Brave).</li>
                  <li>Save the file.</li>
                  <li>Open this app in your target browser (e.g., Chrome).</li>
                  <li>Click <strong>Import Data</strong> and select the file.</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export */}
                <div className="border border-slate-200 rounded-xl p-5 hover:border-primary-200 transition-colors">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <Download className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">Export Data</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Download a copy of all students and attendance records to your computer.</p>
                  <button 
                    onClick={onExport}
                    className="w-full py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Download JSON
                  </button>
                </div>

                {/* Import */}
                <div className="border border-slate-200 rounded-xl p-5 hover:border-primary-200 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">Import Data</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Restore data from a backup file. This will replace current data.</p>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                      id="import-file"
                    />
                    <label 
                      htmlFor="import-file"
                      className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer truncate px-2"
                    >
                      {importFile ? importFile.name : 'Select File'}
                    </label>
                    <button 
                      onClick={executeImport}
                      disabled={!importFile}
                      className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-bold">Requires Firebase Setup</p>
                    <p>To enable real-time sync across devices, you need to create a free Firebase project and paste the configuration object here.</p>
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Firebase Config JSON</label>
                 <textarea 
                   value={configJson}
                   onChange={(e) => setConfigJson(e.target.value)}
                   className="w-full h-40 font-mono text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                   placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "...",
  "projectId": "...",
  ...
}`}
                 />
                 {configError && <p className="text-xs text-red-600 mt-1">{configError}</p>}
               </div>

               <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={() => {
                        if(confirm("Disconnect from cloud?")) updateFirebaseConfig(null);
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                  >
                    Reset / Disconnect
                  </button>
                  <button 
                    onClick={handleConfigSave}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                  >
                    Save & Connect
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;