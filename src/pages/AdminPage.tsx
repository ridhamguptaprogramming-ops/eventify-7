import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, deleteDoc, addDoc, setDoc } from 'firebase/firestore';
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
  Layers,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Gamepad2,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { Registration, Event, OperationType, Stats } from '../types';
import { GlassCard, PremiumButton } from '../components/ui/PremiumComponents';
import { handleFirestoreError } from '../lib/utils';

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [scanId, setScanId] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventFilter, setEventFilter] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: 'TECH_FEST',
    speakers: '',
    capacity: 100,
    imageUrl: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const qReg = query(collection(db, 'registrations'), orderBy('registeredAt', 'desc'));
    const unsubReg = onSnapshot(qReg, (snapshot) => {
      setRegistrations(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Registration)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'registrations'));

    const qEvents = collection(db, 'events');
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      const eventData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Event));
      setEvents(eventData);
      
      // Sync stats when events change
      const now = Date.now();
      const stats: Stats = {
        totalEvents: eventData.length,
        liveEvents: eventData.filter(e => e.startDate && e.endDate && now >= e.startDate && now <= e.endDate).length,
        completedEvents: eventData.filter(e => e.endDate && now > e.endDate).length,
        totalUsers: 100, // Placeholder or fetch from users collection
      };
      setDoc(doc(db, 'stats', 'overall'), stats).catch(console.error);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'events'));

    return () => {
      unsubReg();
      unsubEvents();
    };
  }, []);

  const toggleAttendance = async (reg: Registration) => {
    try {
      const regRef = doc(db, 'registrations', reg.id);
      const newStatus = reg.status === 'attended' ? 'registered' : 'attended';
      await updateDoc(regRef, { 
        status: newStatus,
        attendedAt: newStatus === 'attended' ? Date.now() : null
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `registrations/${reg.id}`);
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to remove this registration?')) return;
    try {
      await deleteDoc(doc(db, 'registrations', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `registrations/${id}`);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanId.trim()) return;
    const reg = registrations.find(r => r.id === scanId);
    if (reg) {
      await toggleAttendance(reg);
      setScanId('');
      alert(`Attendance marked for ${reg.userName}`);
    } else {
      alert('Invalid Pass ID');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent = {
      ...eventForm,
      speakers: eventForm.speakers.split(',').map(s => s.trim()).filter(Boolean),
      registeredCount: 0,
      startDate: new Date(eventForm.startDate).getTime(),
      endDate: new Date(eventForm.endDate).getTime(),
    };
    
    try {
      await addDoc(collection(db, 'events'), newEvent);
      setIsModalOpen(false);
      setEventForm({
        title: '', description: '', date: '', venue: '', category: 'TECH_FEST',
        speakers: '', capacity: 100, imageUrl: '', startDate: '', endDate: ''
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'events');
    }
  };

  const deleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await deleteDoc(doc(db, 'events', eventToDelete.id));
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `events/${eventToDelete.id}`);
    }
  };

  const getEventStatus = (event: Event) => {
    const now = Date.now();
    if (!event.startDate || !event.endDate) return 'UPCOMING';
    if (now >= event.startDate && now <= event.endDate) return 'ACTIVE';
    if (now > event.endDate) return 'COMPLETED';
    return 'UPCOMING';
  };

  const filteredEvents = events.filter(e => {
    const status = getEventStatus(e);
    const matchesFilter = eventFilter === 'ALL' || status === eventFilter;
    const matchesSearch = e.title.toLowerCase().includes(eventSearchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeEventsCount = events.filter(e => getEventStatus(e) === 'ACTIVE').length;
  const filteredRegistrations = registrations.filter(r => 
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.includes(searchTerm)
  );

  const getEventName = (eventId: string) => {
    return events.find(e => e.id === eventId)?.title || 'Event Removed';
  };

  if (loading) return <div className="pt-32 text-center text-white/40 font-black uppercase tracking-[0.4em]">Acquiring Control Stream...</div>;

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Admin Command Center</h1>
          <div className="flex items-center gap-6">
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">System integrity: Optimal</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${activeEventsCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Active Events: {activeEventsCount}</span>
            </div>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest border-l border-white/10 pl-6">Active registrations: {registrations.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link to="/gaming/admin">
              <PremiumButton variant="outline" size="sm" className="border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10">
                 <Gamepad2 size={18} className="mr-2" /> Gaming Admin
              </PremiumButton>
           </Link>
           <PremiumButton variant="outline" size="sm" onClick={() => setIsModalOpen(true)} title="Initialize New Event Protocol">
              <Plus size={18} className="mr-2" /> Add Event
           </PremiumButton>
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
                  title="Close Deletion Module"
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
                        <Calendar size={12} className="text-[#00E5FF]" /> Display Date Info
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
                        <Clock size={12} className="text-[#9D4EDD]" /> Data Sync Start
                      </label>
                      <input 
                        required
                        type="datetime-local"
                        value={eventForm.startDate}
                        onChange={e => setEventForm({...eventForm, startDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#9D4EDD]/50 transition-all uppercase"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Clock size={12} className="text-[#00E5FF]" /> Data Sync End
                      </label>
                      <input 
                        required
                        type="datetime-local"
                        value={eventForm.endDate}
                        onChange={e => setEventForm({...eventForm, endDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all uppercase"
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && eventToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="border-red-500/30">
              <div className="flex items-center gap-4 text-red-500 mb-6">
                 <AlertTriangle size={32} />
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Confirm Deletion</h3>
                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Protocol Removal Request</p>
                 </div>
              </div>

              <p className="text-gray-400 text-sm mb-8 leading-relaxed font-black uppercase tracking-tight">
                Are you sure you want to delete this event?
              </p>

              <div className="flex gap-4">
                <PremiumButton 
                 variant="outline" 
                 className="flex-1 border-red-500/20 hover:bg-red-500/10 text-red-500"
                 onClick={deleteEvent}
                >
                  Confirm
                </PremiumButton>
                <PremiumButton 
                  variant="ghost"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 border-white/5"
                >
                  Cancel
                </PremiumButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Main Grid: Events & Registrations */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        {/* Events Management Section */}
        <div className="xl:col-span-4 space-y-8">
           <div className="flex flex-col lg:flex-row items-end justify-between gap-8">
              <div className="w-full lg:w-2/3">
                 <div className="protocol-label">Deployment / Active Protocols</div>
                 <h2 className="text-display leading-tight">Events Hub.</h2>
              </div>
              
              <div className="w-full lg:w-1/3 space-y-4">
                 <div className="flex flex-wrap gap-2 justify-end">
                    {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'].map(f => (
                       <button
                         key={f}
                         onClick={() => setEventFilter(f as any)}
                         className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                           eventFilter === f 
                             ? 'bg-[#9D4EDD] text-white shadow-[0_0_15px_rgba(157,78,221,0.3)]' 
                             : 'bg-white/5 text-gray-500 hover:bg-white/10'
                         }`}
                       >
                         {f}
                       </button>
                    ))}
                 </div>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                    <input 
                      type="text"
                      placeholder="SEARCH_PROTOCOLS..."
                      value={eventSearchTerm}
                      onChange={e => setEventSearchTerm(e.target.value)}
                      className="w-full bg-[#1E1642]/30 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-[10px] font-mono tracking-[0.2em] focus:outline-none focus:border-[#9D4EDD]/30 transition-all placeholder:text-gray-800 uppercase"
                    />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map(event => {
                const status = getEventStatus(event);
                return (
                  <motion.div layout key={event.id}>
                    <GlassCard className="p-6 h-full border-white/5 hover:border-[#9D4EDD]/20 transition-all group overflow-hidden">
                       <div className="flex items-start justify-between mb-6">
                          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                            status === 'ACTIVE' ? 'bg-green-500/20 text-green-500 animate-pulse' :
                            status === 'UPCOMING' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' :
                            'bg-gray-800 text-gray-500'
                          }`}>
                            {status === 'ACTIVE' ? 'LIVE_NOW' : status}
                          </div>
                          <button 
                             onClick={() => {
                               setEventToDelete(event);
                               setIsDeleteModalOpen(true);
                             }}
                             className="p-2 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                             title="Purge Event Protocol"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>

                       <h3 className="text-xl font-black uppercase tracking-tight mb-4 line-clamp-1 group-hover:text-[#9D4EDD] transition-colors">{event.title}</h3>
                       
                       <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono tracking-tight uppercase">
                             <Calendar size={12} className="text-[#9D4EDD]" /> {event.date}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono tracking-tight uppercase">
                             <UsersIcon size={12} className="text-[#00E5FF]" /> {event.registeredCount} / {event.capacity} Nodes
                          </div>
                       </div>

                       <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex -space-x-1">
                             {[1,2,3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border border-[#1E1642] bg-gray-900" />
                             ))}
                          </div>
                          <Link to={`/events/${event.id}`}>
                             <PremiumButton variant="ghost" size="sm" className="!p-0 h-auto hover:text-[#00E5FF]">
                               Details <ArrowUpRight size={12} className="ml-1" />
                             </PremiumButton>
                          </Link>
                       </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
              {filteredEvents.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                   <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">No events detected in current filter</p>
                </div>
              )}
           </div>
        </div>

        {/* Separator */}
        <div className="xl:col-span-4 h-px bg-white/5 my-4" />

        {/* Attendance Scan & Stats */}
        <div className="space-y-8">
           <div className="protocol-label">Logistics / Attendance</div>
           <GlassCard>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" title="Biometric/QR Verification Source">
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
                  title="List View Protocol"
                 >
                    <List size={18} />
                 </button>
                 <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-white/40'}`}
                  title="Grid View Protocol"
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
                         title="Purge Attendance Record"
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
