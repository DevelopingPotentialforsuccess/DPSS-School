import React, { useState } from 'react';
import { X, Globe, Code, CheckCircle, Youtube, ExternalLink, Search, Download, AlertTriangle, ArrowRight, MousePointer2, Globe2, ChevronDown, ChevronUp, Server, WifiOff, ShoppingCart, CreditCard, Calendar, Clock, CloudLightning, Settings } from 'lucide-react';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpGuide: React.FC<HelpGuideProps> = ({ isOpen, onClose }) => {
  // STRICTLY default to HTML/GSC flow
  const [activeTab, setActiveTab] = useState<'html' | 'wordpress' | 'dns'>('html');
  const [activeStep, setActiveStep] = useState(5); // Default to Step 5 (Hosting) since user just bought domain
  
  const verificationCode = '<meta name="google-site-verification" content="b6o5Uep7k2pXs514VueUpuhtibGYBvVk-qux-D54uew" />';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-slate-900">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Globe className="text-blue-600 w-8 h-8" />
              Domain Verification Walkthrough
            </h2>
            <p className="text-slate-500 mt-1">Follow these exact steps to verify <strong>dpssschoolvirtues.site</strong></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Steps */}
             <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
                <div className="p-4 space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">YOUR PROGRESS</div>
                    
                    <button 
                      onClick={() => setActiveStep(4)} 
                      className={`w-full text-left p-4 rounded-xl text-sm font-bold transition-all flex items-start gap-3 ${activeStep === 4 ? 'bg-white shadow-lg ring-1 ring-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                         <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs border ${activeStep === 4 ? 'bg-green-600 border-green-600 text-white' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>
                           {activeStep > 4 ? <CheckCircle className="w-4 h-4" /> : '4'}
                         </div>
                         <div>
                           <div>Buy Domain</div>
                           <div className="text-[10px] font-normal opacity-70 mt-1">Done</div>
                         </div>
                    </button>

                    <button 
                      onClick={() => setActiveStep(5)} 
                      className={`w-full text-left p-4 rounded-xl text-sm font-bold transition-all flex items-start gap-3 ${activeStep === 5 ? 'bg-white shadow-lg ring-1 ring-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                         <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs border ${activeStep === 5 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>5</div>
                         <div>
                           <div>Hosting & DNS</div>
                           <div className="text-[10px] font-normal opacity-70 mt-1">Current Step</div>
                         </div>
                    </button>

                     <button 
                      onClick={() => setActiveStep(6)} 
                      className={`w-full text-left p-4 rounded-xl text-sm font-bold transition-all flex items-start gap-3 ${activeStep === 6 ? 'bg-white shadow-lg ring-1 ring-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                         <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs border ${activeStep === 6 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>6</div>
                         <div>
                           <div>Final Verify</div>
                           <div className="text-[10px] font-normal opacity-70 mt-1">Google Console</div>
                         </div>
                    </button>
                </div>
             </div>
             
             {/* Main Visual Area */}
             <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex justify-center">

                {/* STEP 4: BOUGHT (Reference) */}
                {activeStep === 4 && (
                    <div className="w-full max-w-4xl flex flex-col items-center">
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-slate-800">You bought the domain!</h3>
                            <p className="text-slate-500">dpssschoolvirtues.site is yours.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <p className="text-lg text-slate-700 mb-6">Great job. Now we need to connect it.</p>
                            <button onClick={() => setActiveStep(5)} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
                                Proceed to Hosting <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
                
                {/* STEP 5: HOSTING & DNS */}
                {activeStep === 5 && (
                    <div className="w-full max-w-5xl">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                                <Server className="w-8 h-8 text-blue-600" />
                                Connect Namecheap to Netlify
                            </h3>
                            <p className="text-slate-500 mt-2">
                                We will use <strong>Netlify</strong> (Free) to host your site, and point Namecheap to it.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* PHASE 1: NETLIFY */}
                            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-800 text-white p-4 font-bold flex items-center gap-2">
                                    <span className="bg-white text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    On Netlify.com
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <p className="font-semibold text-slate-800 mb-2">1. Deploy Code</p>
                                        <p className="text-sm text-slate-600 mb-2">Create a free account on Netlify and deploy this project.</p>
                                        <div className="text-xs bg-slate-100 p-2 rounded border border-slate-200">
                                            If you are coding locally: Run <code>npm run build</code> and drag the <code>dist</code> folder to Netlify Drop.<br/>
                                            If using GitHub: Select "Import from GitHub".
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="font-semibold text-slate-800 mb-2">2. Add Domain</p>
                                        <p className="text-sm text-slate-600">
                                            Go to <strong>Site Settings &gt; Domain Management</strong>.<br/>
                                            Click <strong>Add Custom Domain</strong>.<br/>
                                            Enter: <code className="bg-yellow-100 px-1 rounded">dpssschoolvirtues.site</code>
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-semibold text-slate-800 mb-2">3. Get Nameservers</p>
                                        <p className="text-sm text-slate-600 mb-2">
                                            Netlify will show a warning "Check DNS configuration". Click it.<br/>
                                            It will give you <strong>4 Nameservers</strong>. Copy them.
                                        </p>
                                        <div className="bg-slate-900 text-slate-300 p-3 rounded font-mono text-xs">
                                            dns1.p01.nsone.net<br/>
                                            dns2.p01.nsone.net<br/>
                                            dns3.p01.nsone.net<br/>
                                            dns4.p01.nsone.net
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PHASE 2: NAMECHEAP */}
                            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                                <div className="bg-orange-600 text-white p-4 font-bold flex items-center gap-2">
                                    <span className="bg-white text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                    On Namecheap.com
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <p className="font-semibold text-slate-800 mb-2">1. Manage Domain</p>
                                        <p className="text-sm text-slate-600">
                                            Go to your <strong>Dashboard</strong>.<br/>
                                            Find <code>dpssschoolvirtues.site</code> and click <strong>Manage</strong>.
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <p className="font-semibold text-slate-800 mb-2">2. Change Nameservers</p>
                                        <p className="text-sm text-slate-600 mb-2">
                                            Find the <strong>Nameservers</strong> section.<br/>
                                            Change dropdown from "Namecheap BasicDNS" to <strong>Custom DNS</strong>.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-semibold text-slate-800 mb-2">3. Paste & Save</p>
                                        <p className="text-sm text-slate-600 mb-3">
                                            Paste the 4 lines from Netlify into the boxes.
                                        </p>
                                        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded border border-green-200 text-sm font-bold">
                                            <CheckCircle className="w-4 h-4" />
                                            Click the small green checkmark to save!
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="mt-8 text-center">
                            <div className="inline-block bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="font-bold text-slate-800 mb-1">Wait for it to update</p>
                                <p className="text-sm text-slate-600 mb-4">It usually takes 30 minutes, but can take up to 48 hours.</p>
                                <a 
                                   href="https://dpssschoolvirtues.site" 
                                   target="_blank" 
                                   rel="noreferrer"
                                   className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md"
                                >
                                   Test Link Now <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                            
                            <div className="mt-6">
                                <button onClick={() => setActiveStep(6)} className="text-slate-500 hover:text-slate-800 font-medium text-sm flex items-center gap-1 mx-auto">
                                    Skip to Google Verification <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 6: GOOGLE VERIFY */}
                {activeStep === 6 && (
                    <div className="w-full max-w-4xl flex flex-col items-center">
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-slate-800">Final Step: Verify with Google</h3>
                            <p className="text-slate-500">Only do this AFTER the link above is working.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 w-full space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">1</div>
                                <div>
                                    <p className="font-bold">Go back to Google Search Console</p>
                                    <p className="text-sm text-slate-500">The tab where you got the red error.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">2</div>
                                <div>
                                    <p className="font-bold">Enter the CORRECT URL</p>
                                    <p className="text-sm text-red-600 font-bold bg-red-50 p-2 rounded mt-1">
                                        Make sure you type: https://dpssschoolvirtues.site
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">(Do not use .com)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">3</div>
                                <div>
                                    <p className="font-bold">Click Verify</p>
                                    <p className="text-sm text-slate-500">It should turn Green now!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

             </div>
        </div>
      </div>
    </div>
  );
};

export default HelpGuide;