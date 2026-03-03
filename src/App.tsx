/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  CheckCircle2,
  RefreshCw,
  Loader2,
  X,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Download,
  Send
} from 'lucide-react';

// --- Constants ---
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAE7f5NxSiORQ14taLor7KWyPGCVumjo4IrTTE_UiFwL9KYUjdSjOcb_Z7DbBWpPG-/exec'; 

// --- Helper Functions ---
const fetchWithTimeout = async (url: string, options: any = {}, timeout = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    // For GET requests, we expect JSON
    if (!options.method || options.method === 'GET') {
      const data = await response.json();
      clearTimeout(timer);
      return data;
    }
    
    clearTimeout(timer);
    return response;
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your internet or if the Script URL is correct.');
    }
    throw error;
  }
};

// --- Components ---

const IDCardPreview = ({ data, participantId }: { data: any; participantId: string }) => {
  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-2xl shadow-2xl text-black font-sans border border-gray-200">
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="relative z-10">
          <h3 className="text-2xl font-bold tracking-tighter">AXION 2K26</h3>
          <p className="text-[10px] uppercase tracking-widest opacity-80">Hardware & Intelligence Workshop</p>
        </div>
      </div>
      
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
          <Users size={40} className="text-gray-400" />
        </div>
        
        <h4 className="text-xl font-bold text-gray-900 uppercase">{data.name || "Participant Name"}</h4>
        <p className="text-sm text-blue-600 font-semibold mb-4">{data.department || "Department"} • {data.year || "X"} Year</p>
        
        <div className="space-y-2 text-left bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
          <div className="flex justify-between text-[10px] uppercase text-gray-400 font-bold">
            <span>College</span>
            <span className="text-gray-900">{data.college || "Institution Name"}</span>
          </div>
          <div className="flex justify-between text-[10px] uppercase text-gray-400 font-bold">
            <span>ID Number</span>
            <span className="text-blue-600">{participantId || "AXION2026-XXX"}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-white border border-gray-200 rounded-lg">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${participantId || 'AXION2026-PENDING'}`} 
              alt="QR Code" 
              className="w-20 h-20"
            />
          </div>
          <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Scan for Verification</p>
        </div>
      </div>
      
      <div className="bg-gray-900 p-3 text-center">
        <p className="text-[8px] text-white/50 uppercase tracking-widest">Vidyaa Vikas College of Engineering and Technology</p>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'register' | 'history'>('register');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successData, setSuccessData] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: '',
    paymentStatus: 'Paid'
  });
  
  const formRef = useRef<HTMLFormElement>(null);

  const fetchHistory = async () => {
    if (isLoadingHistory) return;
    setIsLoadingHistory(true);
    setError(null);
    console.log("Fetching history...");
    
    try {
      if (APPS_SCRIPT_URL.includes('XXXXXXXXX')) {
        setHistory([
          { participantid: 'AXION2026-001', name: 'John Doe', email: 'john@example.com', college: 'VVCET', department: 'ECE', year: '3', paymentstatus: 'Paid', timestamp: new Date().toISOString() }
        ]);
      } else {
        const urlWithCacheBuster = `${APPS_SCRIPT_URL}${APPS_SCRIPT_URL.includes('?') ? '&' : '?'}_t=${Date.now()}`;
        const data = await fetchWithTimeout(urlWithCacheBuster, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store'
        });
        
        console.log("History received:", data);
        
        if (Array.isArray(data)) {
          setHistory(data);
        } else if (data && data.error) {
          throw new Error(data.error);
        } else {
          setHistory([]);
        }
      }
    } catch (err: any) {
      console.error("History fetch failed:", err);
      setError(err.message || "Failed to load history. Please ensure the Script is deployed as a Web App.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchStr) ||
      item.email?.toLowerCase().includes(searchStr) ||
      item.participantid?.toLowerCase().includes(searchStr) ||
      item.college?.toLowerCase().includes(searchStr) ||
      item.department?.toLowerCase().includes(searchStr)
    );
  });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory().catch(err => {
        console.error("Effect fetchHistory failed:", err);
        setError("Could not initialize history: " + err.message);
      });
    }
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (APPS_SCRIPT_URL.includes('XXXXXXXXX')) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSuccessData({ id: "AXION2026-001", name: formData.name });
      } else {
        console.log("Submitting...");
        // For POST to Apps Script, we use no-cors because we can't handle the redirect with CORS headers
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        // Assume success if fetch didn't throw
        setSuccessData({ id: "AXION2026-XXX", name: formData.name }); 
      }
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        department: '',
        year: '',
        paymentStatus: 'Paid'
      });
      formRef.current?.reset();
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(`Registration Failed: ${err.message || "Please check your internet connection."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Cpu className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AXION 2K26</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Coordinator Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('register')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'register' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Plus size={18} />
            Register Participant
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <History size={18} />
            Registration History
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Logged in as</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full" />
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate">Coordinator Alpha</p>
                <p className="text-[10px] text-slate-500 truncate">vvcet.coordinator@edu</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {activeTab === 'register' ? 'New Registration' : 'Registration History'}
              </h2>
              {APPS_SCRIPT_URL.includes('XXXXXXXXX') ? (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Demo Mode</span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Connected</span>
              )}
            </div>
            <p className="text-sm text-slate-500">Manage workshop participants and issue digital ID cards.</p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'history' && (
              <button 
                onClick={fetchHistory}
                disabled={isLoadingHistory}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={isLoadingHistory ? 'animate-spin' : ''} size={16} />
                Refresh
              </button>
            )}
            {activeTab === 'history' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search participants..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            )}
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {activeTab === 'register' ? (
            <>
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <input 
                          required
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          type="text" 
                          placeholder="Enter full name"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                        <input 
                          required
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          type="email" 
                          placeholder="participant@email.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                        <input 
                          required
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          type="tel" 
                          placeholder="+91 00000 00000"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">College Name</label>
                        <input 
                          required
                          name="college"
                          value={formData.college}
                          onChange={handleInputChange}
                          type="text" 
                          placeholder="Institution Name"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                        <select 
                          required
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                        >
                          <option value="">Select Dept</option>
                          <option value="ECE">ECE</option>
                          <option value="CSE">CSE</option>
                          <option value="IT">IT</option>
                          <option value="EEE">EEE</option>
                          <option value="MECH">MECH</option>
                          <option value="CSE(CS)">CSE(CS)</option>
                          <option value="AI&DS">AI&DS</option>
                          <option value="OTHERS">OTHERS</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year</label>
                        <select 
                          required
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                        >
                          <option value="">Select Year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</label>
                        <select 
                          required
                          name="paymentStatus"
                          value={formData.paymentStatus}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Not Paid">Not Paid</option>
                        </select>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold">
                        {error}
                      </div>
                    )}

                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Registering & Issuing ID...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Register & Send ID Card
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Preview Section */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Digital ID Card Preview</h3>
                  <IDCardPreview data={formData} participantId="" />
                  <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                      * This ID card will be automatically generated and sent to the participant's email upon successful registration.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-3 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                  <X size={14} />
                  {error}
                </div>
              )}
              
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">College</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {isLoadingHistory ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={24} />
                            <p className="text-sm text-slate-500">Loading registrations...</p>
                          </td>
                        </tr>
                      ) : filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <Users className="mx-auto text-slate-300 mb-2" size={32} />
                            <p className="text-sm text-slate-500">
                              {searchTerm ? `No results found for "${searchTerm}"` : "No registrations found."}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-blue-600 font-bold">{row.participantid}</td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-slate-900">{row.name}</div>
                              <div className="text-[10px] text-slate-500">{row.email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{row.department} • {row.year} Year</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{row.college}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${row.paymentstatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {row.paymentstatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400">
                              {row.timestamp ? new Date(row.timestamp).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {successData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md p-8 text-center bg-white rounded-3xl shadow-2xl"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-emerald-100 rounded-full text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Registration Complete!</h2>
              <p className="mb-6 text-slate-500 text-sm">
                Participant <strong>{successData.name}</strong> has been registered. The digital ID card has been sent to their email.
              </p>
              
              <div className="p-4 mb-8 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Assigned ID</p>
                <p className="text-xl font-bold font-mono text-blue-600 tracking-wider">{successData.id}</p>
              </div>
              
              <button 
                onClick={() => setSuccessData(null)}
                className="w-full py-4 font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
