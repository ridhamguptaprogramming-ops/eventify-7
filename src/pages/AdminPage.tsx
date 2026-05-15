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
  Rocket,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { Registration, Event, OperationType, Stats, Tournament, Match, Highlight, UserRole } from '../types';
import { seedGamingData } from '../services/gamingService';
import { GlassCard, PremiumButton } from '../components/ui/PremiumComponents';
import { handleFirestoreError } from '../lib/utils';

type AdminTab = 'CORE_EVENTS' | 'GAMING_HUB' | 'HISTORY_LOG';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('CORE_EVENTS');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [scanId, setScanId] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventFilter, setEventFilter] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [gamingStatusFilter, setGamingStatusFilter] = useState<'ALL' | 'live' | 'upcoming' | 'completed'>('ALL');
  const [itemToDelete, setItemToDelete] = useState<{ id: string; collection: string; title: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  
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

  const [isGamingModalOpen, setIsGamingModalOpen] = useState(false);
  const [gamingForm, setGamingForm] = useState({
    type: 'TOURNAMENT' as 'TOURNAMENT' | 'MATCH',
    gameName: '',
    prizePool: '$10,000',
    startDate: '',
    teamSize: '5',
    entryFee: 'FREE',
    // Match fields
    tournamentId: '',
    teamAName: '',
    teamBName: '',
    scoreA: 0,
    scoreB: 0,
    matchStatus: 'upcoming' as 'upcoming' | 'live' | 'completed'
  });

  useEffect(() => {
    // 1. Core Data
    const qReg = query(collection(db, 'registrations'), orderBy('registeredAt', 'desc'));
    const unsubReg = onSnapshot(qReg, (snapshot) => {
      setRegistrations(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Registration)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'registrations'));

    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Event));
      setEvents(eventData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'events'));

    // 2. Gaming Data
    const unsubTournaments = onSnapshot(collection(db, 'tournaments'), (snapshot) => {
      setTournaments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tournament)));
    });

    const unsubMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
      setMatches(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match)));
    });

    // 3. Highlights
    const unsubHighlights = onSnapshot(collection(db, 'highlights'), (snapshot) => {
      setHighlights(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Highlight)));
    });

    return () => {
      unsubReg();
      unsubEvents();
      unsubTournaments();
      unsubMatches();
      unsubHighlights();
    };
  }, []);

  const deleteItem = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.collection === 'tournaments') {
        const relatedMatches = matches.filter(m => m.tournamentId === itemToDelete.id);
        for (const m of relatedMatches) {
          await deleteDoc(doc(db, 'matches', m.id));
        }
        const relatedHighlights = highlights.filter(h => h.sourceId === itemToDelete.id);
        for (const h of relatedHighlights) {
          await deleteDoc(doc(db, 'highlights', h.id));
        }
      }
      await deleteDoc(doc(db, itemToDelete.collection, itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${itemToDelete.collection}/${itemToDelete.id}`);
    }
  };

  const handleAddGaming = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (gamingForm.type === 'TOURNAMENT') {
        await addDoc(collection(db, 'tournaments'), {
          gameName: gamingForm.gameName,
          prizePool: gamingForm.prizePool,
          startDate: new Date(gamingForm.startDate).getTime() || Date.now(),
          registeredTeamsCount: 0,
          teamSize: parseInt(gamingForm.teamSize),
          entryFee: gamingForm.entryFee,
          status: 'upcoming',
          bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'
        });
      } else {
        await addDoc(collection(db, 'matches'), {
          tournamentId: gamingForm.tournamentId,
          teamA: { id: 'team_a', name: gamingForm.teamAName },
          teamB: { id: 'team_b', name: gamingForm.teamBName },
          scoreA: gamingForm.scoreA,
          scoreB: gamingForm.scoreB,
          matchStatus: gamingForm.matchStatus,
          scheduledAt: Date.now()
        });
      }
      setIsGamingModalOpen(false);
      setGamingForm({
        type: 'TOURNAMENT', gameName: '', prizePool: '$10,000', startDate: '', teamSize: '5', entryFee: 'FREE',
        tournamentId: '', teamAName: '', teamBName: '', scoreA: 0, scoreB: 0, matchStatus: 'upcoming'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, gamingForm.type.toLowerCase() + 's');
    }
  };

  const archiveTournament = async (tournament: Tournament) => {
    try {
      const highlight: Omit<Highlight, 'id'> = {
        sourceId: tournament.id,
        type: 'TOURNAMENT',
        title: tournament.gameName,
        description: `Concluded gaming event with ${tournament.registeredTeamsCount} teams.`,
        imageUrl: tournament.bannerImage,
        completedAt: Date.now(),
        stats: {
          attendance: tournament.registeredTeamsCount,
          score: tournament.prizePool
        }
      };
      await addDoc(collection(db, 'highlights'), highlight);
      await updateDoc(doc(db, 'tournaments', tournament.id), { status: 'completed' });
    } catch (err) {
      console.error('Archiving Error:', err);
    }
  };

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

  const filteredTournaments = tournaments.filter(t => {
    const statusMatch = gamingStatusFilter === 'ALL' || t.status === gamingStatusFilter;
    const searchMatch = t.gameName.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const filteredMatches = matches.filter(m => {
    const tournament = tournaments.find(t => t.id === m.tournamentId);
    const tournamentName = tournament?.gameName || '';
    const statusMatch = gamingStatusFilter === 'ALL' || m.matchStatus === gamingStatusFilter;
    const searchMatch = (m.teamA.name + m.teamB.name + tournamentName).toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

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
  const gamingLiveCount = tournaments.filter(t => t.status === 'live').length;

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
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Unified Admin Console</h1>
          <div className="flex flex-wrap items-center gap-6">
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">System integrity: Optimal</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${activeEventsCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Active Events: {activeEventsCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${gamingLiveCount > 0 ? 'bg-[#00E5FF] animate-pulse' : 'bg-gray-700'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Gaming Now: {gamingLiveCount}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white/5 border border-white/10 p-1 rounded-2xl flex">
              {(['CORE_EVENTS', 'GAMING_HUB', 'HISTORY_LOG'] as AdminTab[]).map(tab => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     activeTab === tab ? 'bg-[#9D4EDD] text-white shadow-lg' : 'text-gray-500 hover:text-white'
                   }`}
                 >
                   {tab.replace('_', ' ')}
                 </button>
              ))}
           </div>
           {activeTab === 'CORE_EVENTS' && (
             <PremiumButton variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} className="mr-2" /> Add Event
             </PremiumButton>
           )}
           {activeTab === 'GAMING_HUB' && (
             <div className="flex items-center gap-2">
               <PremiumButton 
                 variant="outline" 
                 size="sm" 
                 className="border-white/10 hover:border-[#00E5FF]/30"
                 onClick={async () => {
                   setIsSeeding(true);
                   try {
                     await seedGamingData();
                   } catch (err) {
                     console.error('Seeding failed:', err);
                   }
                   setIsSeeding(false);
                 }}
                 disabled={isSeeding}
               >
                  <Rocket size={18} className="mr-2" /> {isSeeding ? 'SEEDING...' : 'SEED_DATA'}
               </PremiumButton>
               <PremiumButton variant="outline" size="sm" onClick={() => setIsGamingModalOpen(true)}>
                  <Plus size={18} className="mr-2" /> Deploy Gaming
               </PremiumButton>
             </div>
           )}
        </div>
      </header>

      {/* Item Deletion Modal */}
      {isDeleteModalOpen && itemToDelete && (
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
                    <h3 className="text-xl font-black uppercase tracking-tight">Purge Data Node</h3>
                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Protocol: {itemToDelete.collection}</p>
                 </div>
              </div>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed font-black uppercase tracking-tight">
                Are you confirming the deletion of <span className="text-white">"{itemToDelete.title}"</span>? This action is irreversible.
              </p>
              <div className="flex gap-4">
                <PremiumButton 
                 variant="outline" 
                 className="flex-1 border-red-500/20 hover:bg-red-500/10 text-red-500"
                 onClick={deleteItem}
                >
                  Confirm Purge
                </PremiumButton>
                <PremiumButton 
                  variant="ghost"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 border-white/5"
                >
                  Abort
                </PremiumButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Sector Tabs Content */}
      <div className="space-y-12">
        {activeTab === 'CORE_EVENTS' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
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
                                 ? 'bg-[#9D4EDD] text-white' 
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
                  {filteredEvents.map(event => (
                    <motion.div layout key={event.id}>
                      <GlassCard className="p-6 h-full border-white/5 hover:border-[#9D4EDD]/20 transition-all group overflow-hidden">
                         <div className="flex items-start justify-between mb-6">
                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                              getEventStatus(event) === 'ACTIVE' ? 'bg-green-500/20 text-green-500 animate-pulse' : 'bg-gray-800 text-gray-500'
                            }`}>
                              {getEventStatus(event)}
                            </div>
                            <button 
                               onClick={() => {
                                 setItemToDelete({ id: event.id, collection: 'events', title: event.title });
                                 setIsDeleteModalOpen(true);
                               }}
                               className="p-2 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
                            >
                               <Trash2 size={14} />
                            </button>
                         </div>
                         <h3 className="text-xl font-black uppercase tracking-tight mb-4">{event.title}</h3>
                         <div className="space-y-1 mb-6">
                            <div className="text-[8px] font-black text-white/30 uppercase tracking-widest">Venue</div>
                            <div className="text-[10px] text-gray-400 font-mono uppercase">{event.venue}</div>
                         </div>
                         <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="text-[10px] text-[#9D4EDD] font-black uppercase tracking-widest">{event.registeredCount} NODES</div>
                            <Link to={`/events/${event.id}`}>
                               <ArrowUpRight size={14} className="text-white/20" />
                            </Link>
                         </div>
                      </GlassCard>
                    </motion.div>
                  ))}
               </div>
            </div>

            <div className="xl:col-span-1 space-y-8">
               <div className="protocol-label">Logistics / Entry Scan</div>
               <GlassCard className="!p-8">
                  <form onSubmit={handleScan} className="space-y-6">
                     <div className="relative">
                        <Scan className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                          type="text" 
                          value={scanId}
                          onChange={e => setScanId(e.target.value)}
                          placeholder="SCANNER_INPUT"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-[#9D4EDD]"
                        />
                     </div>
                     <PremiumButton className="w-full">Initialize Verification</PremiumButton>
                  </form>
               </GlassCard>
            </div>

            <div className="xl:col-span-3">
               <div className="protocol-label mb-6">Transmission Log / Registrations</div>
               <div className="space-y-4">
                  {filteredRegistrations.slice(0, 10).map(reg => (
                    <GlassCard key={reg.id} className="!p-4 border-white/5 flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reg.status === 'attended' ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-white/20'}`}>
                             {reg.status === 'attended' ? <CheckCircle size={14} /> : <Users size={14} />}
                          </div>
                          <div>
                             <div className="text-[11px] font-black uppercase tracking-tight">{reg.userName}</div>
                             <div className="text-[9px] text-white/30 font-mono">{reg.userEmail}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleAttendance(reg)}
                            className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${
                              reg.status === 'attended' ? 'border-amber-500/30 text-amber-500' : 'border-green-500/30 text-green-500'
                            }`}
                          >
                             {reg.status === 'attended' ? 'REVERSE' : 'VERIFY'}
                          </button>
                          <button 
                            onClick={() => deleteRegistration(reg.id)}
                            className="p-1.5 text-white/10 hover:text-red-500 transition-colors"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </GlassCard>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'GAMING_HUB' && (
          <div className="space-y-12">
            <div className="flex items-center gap-4 mb-4">
               {(['ALL', 'live', 'upcoming', 'completed'] as const).map(f => (
                  <button
                     key={f}
                     onClick={() => setGamingStatusFilter(f)}
                     className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                       gamingStatusFilter === f ? 'bg-[#00E5FF] text-black border-[#00E5FF]' : 'border-white/10 text-gray-500 hover:text-white'
                     }`}
                  >
                     {f}
                  </button>
               ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredTournaments.map(tournament => (
                 <GlassCard key={tournament.id} className="group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00E5FF]/10 to-transparent pointer-events-none" />
                    <div className="flex items-start justify-between mb-8">
                       <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${
                         tournament.status === 'live' ? 'bg-red-500/20 text-red-500 animate-pulse' :
                         tournament.status === 'completed' ? 'bg-gray-800 text-gray-500' : 'bg-[#00E5FF]/20 text-[#00E5FF]'
                       }`}>
                          {tournament.status}
                       </div>
                       <div className="flex gap-2">
                          {tournament.status === 'live' && (
                             <button 
                               onClick={() => archiveTournament(tournament)}
                               className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-[#00E5FF] transition-all"
                               title="Archive to Highlights"
                             >
                                <ArrowUpRight size={14} />
                             </button>
                          )}
                          <button 
                             onClick={() => {
                               setItemToDelete({ id: tournament.id, collection: 'tournaments', title: tournament.gameName });
                               setIsDeleteModalOpen(true);
                             }}
                             className="p-2 bg-red-500/5 rounded-lg text-red-500/40 hover:text-red-500 transition-all"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{tournament.gameName}</h3>
                    <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] mb-8">Arena Protocol // {tournament.id}</div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                       <div>
                          <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Prize Pool</div>
                          <div className="text-sm font-black text-[#00E5FF]">{tournament.prizePool}</div>
                       </div>
                       <div>
                          <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Teams</div>
                          <div className="text-sm font-black uppercase tracking-widest">{tournament.registeredTeamsCount} NODES</div>
                       </div>
                    </div>
                 </GlassCard>
               ))}
            </div>

            <div className="space-y-8">
               <div className="protocol-label">Live Operation / Matches</div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMatches.map(match => (
                    <GlassCard key={match.id} className="!p-6 border-white/5 flex items-center justify-between">
                       <div className="flex-1 flex items-center gap-6">
                          <div className="text-center min-w-[80px]">
                             <div className="text-[11px] font-black uppercase mb-2 truncate">{match.teamA.name}</div>
                             <div className="text-2xl font-black">{match.scoreA}</div>
                          </div>
                          <div className="text-white/20 italic font-black text-xl">VS</div>
                          <div className="text-center min-w-[80px]">
                             <div className="text-[11px] font-black uppercase mb-2 truncate">{match.teamB.name}</div>
                             <div className="text-2xl font-black">{match.scoreB}</div>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-4 ml-8">
                          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${match.matchStatus === 'live' ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-500'}`}>
                             {match.matchStatus}
                          </div>
                          <button 
                             onClick={() => {
                               setItemToDelete({ id: match.id, collection: 'matches', title: `${match.teamA.name} VS ${match.teamB.name}` });
                               setIsDeleteModalOpen(true);
                             }}
                             className="p-2 text-white/5 hover:text-red-500 transition-colors"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </GlassCard>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'HISTORY_LOG' && (
          <div className="space-y-12">
            <div className="protocol-label">Static Archive / Highlights</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {highlights.map(highlight => (
                 <motion.div layout key={highlight.id}>
                    <GlassCard className="p-0 overflow-hidden group">
                       <div className="h-32 bg-gray-900 relative">
                          <img src={highlight.imageUrl} className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="" />
                          <button 
                             onClick={() => {
                               setItemToDelete({ id: highlight.id, collection: 'highlights', title: highlight.title });
                               setIsDeleteModalOpen(true);
                             }}
                             className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg text-white/40 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                       <div className="p-6">
                          <div className="text-[8px] font-black text-[#9D4EDD] uppercase tracking-widest mb-1">{highlight.type}</div>
                          <h4 className="text-sm font-black uppercase tracking-tight mb-4">{highlight.title}</h4>
                          <div className="text-[10px] font-mono text-gray-500 uppercase">
                             {new Date(highlight.completedAt).toLocaleDateString()}
                          </div>
                       </div>
                    </GlassCard>
                 </motion.div>
               ))}
               {highlights.length === 0 && (
                 <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-gray-600 font-black uppercase tracking-widest text-xs italic">Historical database empty</p>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

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
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Event Title</label>
                      <input 
                        required
                        type="text"
                        value={eventForm.title}
                        onChange={e => setEventForm({...eventForm, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all uppercase"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                      <select 
                        value={eventForm.category}
                        onChange={e => setEventForm({...eventForm, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#9D4EDD]/50 transition-all uppercase"
                      >
                        <option value="TECH_FEST">TECH_FEST</option>
                        <option value="WORKSHOP">WORKSHOP</option>
                        <option value="SUMMIT">SUMMIT</option>
                        <option value="HACKATHON">HACKATHON</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date Info</label>
                      <input 
                        required
                        type="text"
                        value={eventForm.date}
                        onChange={e => setEventForm({...eventForm, date: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all uppercase"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Venue</label>
                      <input 
                        required
                        type="text"
                        value={eventForm.venue}
                        onChange={e => setEventForm({...eventForm, venue: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#9D4EDD]/50 transition-all uppercase"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Start Date (ISO)</label>
                      <input 
                        required
                        type="datetime-local"
                        value={eventForm.startDate}
                        onChange={e => setEventForm({...eventForm, startDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all uppercase"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">End Date (ISO)</label>
                      <input 
                        required
                        type="datetime-local"
                        value={eventForm.endDate}
                        onChange={e => setEventForm({...eventForm, endDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#9D4EDD]/50 transition-all uppercase"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Speakers (Comma Separated)</label>
                      <input 
                        type="text"
                        value={eventForm.speakers}
                        onChange={e => setEventForm({...eventForm, speakers: e.target.value})}
                        placeholder="ORION_X, CYBER_PUNK..."
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all uppercase"
                      />
                    </div>
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
      {/* Gaming Entry Modal */}
      {isGamingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <GlassCard className="!p-0 overflow-hidden flex flex-col h-full border-white/10 shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <div className="protocol-label !mb-2">Gaming / Deployment</div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Deploy Gaming Strategy</h2>
                </div>
                <button 
                  onClick={() => setIsGamingModalOpen(false)}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#1E1642]/20">
                <form onSubmit={handleAddGaming} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Entry Type</label>
                      <div className="flex bg-white/5 p-1 rounded-xl">
                        {(['TOURNAMENT', 'MATCH'] as const).map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setGamingForm({...gamingForm, type: t})}
                            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              gamingForm.type === t ? 'bg-[#9D4EDD] text-white shadow-lg' : 'text-gray-500 hover:text-white'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {gamingForm.type === 'TOURNAMENT' ? (
                      <>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Game Name</label>
                          <input 
                            required
                            type="text"
                            value={gamingForm.gameName}
                            onChange={e => setGamingForm({...gamingForm, gameName: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all uppercase"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Prize Pool</label>
                          <input 
                            required
                            type="text"
                            value={gamingForm.prizePool}
                            onChange={e => setGamingForm({...gamingForm, prizePool: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#9D4EDD]/50 transition-all uppercase"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="md:col-span-2 space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Parent Tournament</label>
                          <select 
                            value={gamingForm.tournamentId}
                            onChange={e => setGamingForm({...gamingForm, tournamentId: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all uppercase"
                          >
                            <option value="">SELECT_TOURNAMENT</option>
                            {tournaments.map(t => (
                              <option key={t.id} value={t.id}>{t.gameName}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Team Alpha</label>
                          <input 
                            required
                            type="text"
                            value={gamingForm.teamAName}
                            onChange={e => setGamingForm({...gamingForm, teamAName: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all uppercase"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Team Omega</label>
                          <input 
                            required
                            type="text"
                            value={gamingForm.teamBName}
                            onChange={e => setGamingForm({...gamingForm, teamBName: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-mono tracking-widest focus:outline-none focus:border-[#9D4EDD]/50 transition-all uppercase"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="pt-8 border-t border-white/5 flex gap-4">
                    <PremiumButton size="lg" className="flex-1" type="submit">Execute Protocol</PremiumButton>
                    <PremiumButton size="lg" variant="outline" type="button" onClick={() => setIsGamingModalOpen(false)}>Abort</PremiumButton>
                  </div>
                </form>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}
