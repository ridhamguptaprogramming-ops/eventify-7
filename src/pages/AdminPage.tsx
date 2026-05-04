import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Search, 
  Trash2, 
  Plus, 
  LayoutGrid, 
  List,
  Scan,
  X,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Type,
  FileText,
  Users as UsersIcon,
  Layers
} from 'lucide-react';
import { db } from '../lib/firebase';
import { Registration, Event, OperationType } from '../types';
import { GlassCard, PremiumButton } from '../components/ui/PremiumComponents';
import { handleFirestoreError } from '../lib/utils';

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanId, setScanId] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: 'TECH_FEST',
    speakers: '',
    capacity: 100,
    imageUrl: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const regSnap = await getDocs(query(collection(db, 'registrations'), orderBy('registeredAt', 'desc')));
      setRegistrations(regSnap.docs.map(d => ({ id: d.id, ...d.data() } as Registration)));
      
      const eventSnap = await getDocs(collection(db, 'events'));
      setEvents(eventSnap.docs.map(d => ({ id: d.id, ...d.data() } as Event)));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAttendance = async (reg: Registration) => {
    try {
      const regRef = doc(db, 'registrations', reg.id);
      const newStatus = reg.status === 'attended' ? 'registered' : 'attended';
      await updateDoc(regRef, { 
        status: newStatus,
        attendedAt: newStatus === 'attended' ? Date.now() : null
      });
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `registrations/${reg.id}`);
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to remove this registration?')) return;
    try {
      await deleteDoc(doc(db, 'registrations', id));
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `registrations/${id}`);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanId.trim()) return;
    
    // Check if registration exists
    const reg = registrations.find(r => r.id === scanId);
    if (reg) {
      await toggleAttendance(reg);
      setScanId('');
      alert(`Attendance marked for ${reg.userName}`);
    } else {
      alert('Invalid Pass ID');
    }
  };

  const filteredRegistrations = registrations.filter(r => 
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.includes(searchTerm)
  );

  // Helper to get event name
  const getEventName = (eventId: string) => {
    return events.find(e => e.id === eventId)?.title || 'Event Removed';
  };

  const createDummyEvent = async () => {
    const newEvent: Omit<Event, 'id'> = {
      title: 'Global Tech Summit 2026',
      description: 'The premier gathering for developers, designers, and tech enthusiasts. Experience 3 days of intensive workshops, keynote speeches from industry leaders, and networking opportunities that will shape the next decade of innovation. Join us at the Intersection of humanity and technology.',
      date: 'Oct 12-14, 2026',
      venue: 'Nexus Convention Center, Silicon Valley',
      category: 'TECH_FEST',
      speakers: ['Elena Rodriguez', 'David Chen', 'Sarah Jenkins'],
      capacity: 500,
      registeredCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'
    };
    try {
      await addDoc(collection(db, 'events'), newEvent);
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'events');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Omit<Event, 'id'> = {
      ...eventForm,
      speakers: eventForm.speakers.split(',').map(s => s.trim()).filter(Boolean),
      registeredCount: 0,
    };
    
    try {
      await addDoc(collection(db, 'events'), newEvent);
      setIsModalOpen(false);
      setEventForm({
        title: '',
        description: '',
        date: '',
        venue: '',
        category: 'TECH_FEST',
        speakers: '',
        capacity: 100,
        imageUrl: ''
      });
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'events');
    }
  };

  if (loading) return <div className="pt-32 text-center text-white/40">Loading Command Center...</div>;

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Command Center</h1>
          <p className="text-white/50 text-sm">System integrity: Optimal. Active registrations: {registrations.length}</p>
        </div>
        <div className="flex items-center gap-3">
           <PremiumButton variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} className="mr-2" /> Add Event
           </PremiumButton>
           <PremiumButton size="sm" onClick={fetchData}>Sync</PremiumButton>
        </div>
      </header>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <GlassCard className="!p-0 overflow-hidden flex flex-col h-full border-white/10 shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <div className="protocol-label !mb-2">System / Update</div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Deploy New Protocol</h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#1E1642]/20">
                <form onSubmit={handleAddEvent} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Type size={12} className="text-[#00E5FF]" /> Event Title
                      </label>
                      <input 
                        required
                        type="text"
                        value={eventForm.title}
                        onChange={e => setEventForm({...eventForm, title: e.target.value})}
                        placeholder="ALPHA_PROTOCOL_26"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all placeholder:text-gray-800 uppercase"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Layers size={12} className="text-[#9D4EDD]" /> Category
                      </label>
                      <select 
                        value={eventForm.category}
                        onChange={e => setEventForm({...eventForm, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#9D4EDD]/50 transition-all uppercase"
                      >
                        <option value="TECH_FEST" className="bg-[#0F0A1F]">TECH_FEST</option>
                        <option value="WORKSHOP" className="bg-[#0F0A1F]">WORKSHOP</option>
                        <option value="SUMMIT" className="bg-[#0F0A1F]">SUMMIT</option>
                        <option value="HACKATHON" className="bg-[#0F0A1F]">HACKATHON</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Calendar size={12} className="text-[#00E5FF]" /> Date Info
                      </label>
                      <input 
                        required
                        type="text"
                        value={eventForm.date}
                        onChange={e => setEventForm({...eventForm, date: e.target.value})}
                        placeholder="MAY 12 — OCT 24, 2026"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all placeholder:text-gray-800 uppercase"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <MapPin size={12} className="text-[#9D4EDD]" /> Nexus Point
                      </label>
                      <input 
                        required
                        type="text"
                        value={eventForm.venue}
                        onChange={e => setEventForm({...eventForm, venue: e.target.value})}
                        placeholder="GLOBAL_TECH_PAVILION"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#9D4EDD]/50 transition-all placeholder:text-gray-800 uppercase"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <UsersIcon size={12} className="text-[#00E5FF]" /> Speakers (CSV)
                      </label>
                      <input 
                        type="text"
                        value={eventForm.speakers}
                        onChange={e => setEventForm({...eventForm, speakers: e.target.value})}
                        placeholder="ELENA_R, DAVID_C..."
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all placeholder:text-gray-800 uppercase"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <UsersIcon size={12} className="text-[#9D4EDD]" /> Max Nodes
                      </label>
                      <input 
                        required
                        type="number"
                        value={eventForm.capacity}
                        onChange={e => setEventForm({...eventForm, capacity: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#9D4EDD]/50 transition-all uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <ImageIcon size={12} className="text-[#00E5FF]" /> Asset Mapping (Image URL)
                    </label>
                    <input 
                      type="url"
                      value={eventForm.imageUrl}
                      onChange={e => setEventForm({...eventForm, imageUrl: e.target.value})}
                      placeholder="HTTPS://IMAGES.UNSPLASH.COM/..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all placeholder:text-gray-800"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <FileText size={12} className="text-[#9D4EDD]" /> Data Stream (Description)
                    </label>
                    <textarea 
                      required
                      rows={4}
                      value={eventForm.description}
                      onChange={e => setEventForm({...eventForm, description: e.target.value})}
                      placeholder="INITIALIZE_MISSION_PARAMETERS..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#9D4EDD]/50 transition-all placeholder:text-gray-800 uppercase resize-none"
                    />
                  </div>

                  <div className="pt-8 border-t border-white/5 flex gap-4">
                    <PremiumButton size="lg" className="flex-1" type="submit">Deploy Protocol</PremiumButton>
                    <PremiumButton size="lg" variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Abort</PremiumButton>
                  </div>
                </form>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Scan & Stats */}
        <div className="space-y-6">
           <GlassCard>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Scan size={20} className="text-indigo-400" /> Verify Pass
              </h3>
              <form onSubmit={handleScan} className="space-y-3">
                 <input 
                   type="text" 
                   value={scanId}
                   onChange={e => setScanId(e.target.value)}
                   placeholder="Enter Pass ID"
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                 />
                 <PremiumButton size="sm" className="w-full">Initialize Check-in</PremiumButton>
              </form>
           </GlassCard>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                 <div className="text-indigo-400 font-bold text-xl">{registrations.length}</div>
                 <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Total</div>
              </div>
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                 <div className="text-green-400 font-bold text-xl">
                   {registrations.filter(r => r.status === 'attended').length}
                 </div>
                 <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Attended</div>
              </div>
           </div>
        </div>

        {/* Right: Registration List */}
        <div className="lg:col-span-3 space-y-6">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                   type="text" 
                   placeholder="Search name, email or pass ID..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                 <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-white/40'}`}
                 >
                    <List size={18} />
                 </button>
                 <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-white/40'}`}
                 >
                    <LayoutGrid size={18} />
                 </button>
              </div>
           </div>

           <div className={viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              {filteredRegistrations.map(reg => (
                <motion.div layout key={reg.id}>
                  <GlassCard className={`p-4 flex items-center justify-between gap-4 ${reg.status === 'attended' ? 'border-green-500/20' : ''}`}>
                    <div className="flex items-center gap-4 min-w-0">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${reg.status === 'attended' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                          {reg.status === 'attended' ? <CheckCircle size={20} /> : <Users size={20} />}
                       </div>
                       <div className="min-w-0">
                          <div className="font-bold truncate">{reg.userName}</div>
                          <div className="text-[10px] text-white/40 truncate">{reg.userEmail} • {getEventName(reg.eventId)}</div>
                          <div className="text-[10px] font-mono text-indigo-400 truncate opacity-50">#{reg.id}</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                       <button 
                         onClick={() => toggleAttendance(reg)}
                         className={`p-2 rounded-xl transition-all ${reg.status === 'attended' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                         title={reg.status === 'attended' ? 'Unmark Attendance' : 'Mark as Attended'}
                       >
                          {reg.status === 'attended' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                       </button>
                       <button 
                         onClick={() => deleteRegistration(reg.id)}
                         className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
                       >
                          <Trash2 size={18} />
                       </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
              {filteredRegistrations.length === 0 && (
                <div className="text-center py-20 text-white/20 italic">No matches found for your search query.</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
