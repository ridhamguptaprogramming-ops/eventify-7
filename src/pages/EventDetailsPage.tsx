import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, addDoc, query, where } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  LucideIcon,
  Mic2,
  Zap
} from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Event, Registration, OperationType } from '../types';
import { PremiumButton, GlassCard } from '../components/ui/PremiumComponents';
import { handleFirestoreError } from '../lib/utils';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!id) {
          const querySnapshot = await getDocs(collection(db, 'events'));
          const eventList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
          setEvents(eventList);
        } else {
          const docRef = doc(db, 'events', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCurrentEvent({ id: docSnap.id, ...docSnap.data() } as Event);
            
            // Check if user is registered
            if (user) {
              const q = query(
                collection(db, 'registrations'), 
                where('eventId', '==', id), 
                where('userId', '==', user.uid)
              );
              const regSnap = await getDocs(q);
              setIsRegistered(!regSnap.empty);
            }
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!user.emailVerified) {
       alert("Please verify your email before registering.");
       return;
    }

    setRegistering(true);
    try {
      const registration: Omit<Registration, 'id'> = {
        eventId: id!,
        userId: user.uid,
        userEmail: user.email!,
        userName: profile?.displayName || 'Unknown',
        status: 'registered',
        registeredAt: Date.now(),
      };
      
      await addDoc(collection(db, 'registrations'), registration);
      setIsRegistered(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'registrations');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 px-6 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[#9D4EDD]/30 border-t-[#9D4EDD] rounded-full animate-spin mb-4" />
        <p className="text-white/40">Loading digital assets...</p>
      </div>
    );
  }

  if (id && !currentEvent) {
    return (
      <div className="pt-32 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Event Not Found</h2>
        <PremiumButton onClick={() => navigate('/events')}>Back to Events</PremiumButton>
      </div>
    );
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || event.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...Array.from(new Set(events.map(e => e.category || 'TECH_FEST')))];

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      {id ? (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <button 
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={18} /> Back to Events
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10">
                <img 
                  src={currentEvent?.imageUrl || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop`} 
                  className="w-full h-full object-cover"
                  alt={currentEvent?.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00E5FF] mb-4">Event Details</div>
                  <h1 className="text-huge !text-[50px] md:!text-[80px] mb-4">{currentEvent?.title}</h1>
                  <div className="flex flex-wrap gap-6 text-gray-400 font-medium text-xs uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                      <Calendar size={14} /> {currentEvent?.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={14} /> {currentEvent?.venue}
                    </span>
                  </div>
                </div>
              </div>

              <section>
                <h2 className="text-2xl font-bold mb-4">About Event</h2>
                <p className="text-white/60 leading-relaxed text-lg">
                  {currentEvent?.description}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6">Keynote Speakers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentEvent?.speakers.map((speaker, i) => (
                    <GlassCard key={i} className="flex items-center gap-4 py-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9D4EDD] to-[#1E1642] flex items-center justify-center text-white">
                        <Mic2 size={20} />
                      </div>
                      <div>
                        <div className="font-bold">{speaker}</div>
                        <div className="text-xs text-white/40">Industry Expert</div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <GlassCard className="sticky top-24 border-[#9D4EDD]/20">
                <h3 className="text-xl font-bold mb-6">Registration</h3>
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-white/50">Capacity</span>
                      <span className="font-mono">{currentEvent?.capacity} Seats</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-white/50">Registered</span>
                      <span className="font-mono">{currentEvent?.registeredCount} Users</span>
                   </div>
                   <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#9D4EDD] h-full" 
                        style={{ width: `${(currentEvent!.registeredCount / currentEvent!.capacity) * 100}%` }} 
                      />
                   </div>
                </div>

                {isRegistered ? (
                  <div className="text-center">
                    <div className="bg-green-500/10 text-green-400 p-4 rounded-2xl flex flex-col items-center gap-2 mb-6">
                      <CheckCircle2 size={32} />
                      <span className="font-bold">Reserved Successfully</span>
                    </div>
                    <PremiumButton variant="secondary" className="w-full" onClick={() => navigate('/dashboard')}>
                      View Ticket
                    </PremiumButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <PremiumButton 
                      className="w-full" 
                      onClick={handleRegister}
                      disabled={registering || (currentEvent!.registeredCount >= currentEvent!.capacity)}
                    >
                      {registering ? 'Confirming...' : (currentEvent!.registeredCount >= currentEvent!.capacity ? 'Event Full' : 'Secure my Seat')}
                    </PremiumButton>
                    {!user && (
                      <p className="text-[10px] text-center text-white/40 uppercase tracking-widest">Login required to register</p>
                    )}
                    {user && !user.emailVerified && (
                      <div className="flex items-start gap-2 text-amber-400/80 text-xs p-3 bg-amber-400/5 rounded-xl">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>Email verification required to register. Check your inbox.</span>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="space-y-16"
        >
          <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-12">
            <div className="text-left w-full lg:w-2/3">
              <div className="protocol-label">Reference / Archives</div>
              <h1 className="text-huge leading-tight">
                The<br />
                <span className="text-white/20 italic">Global Calendar.</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl font-light leading-relaxed mt-6">
                A high-fidelity archive of upcoming digital summits, technical workshops, and elite networking encounters.
              </p>
            </div>
            
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="flex flex-wrap gap-2 justify-end">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat 
                        ? 'bg-[#9D4EDD] text-white shadow-[0_0_20px_rgba(157,78,221,0.4)]' 
                        : 'bg-white/5 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                  <Zap size={14} className="group-focus-within:text-[#00E5FF] transition-colors" />
                </div>
                <input 
                  type="text"
                  placeholder="SYNC_SEARCH_QUERY..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1E1642]/30 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-[10px] font-mono tracking-[0.2em] focus:outline-none focus:border-[#00E5FF]/30 transition-all placeholder:text-gray-700 uppercase"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
                  <AlertCircle size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-500 font-mono tracking-widest text-xs uppercase">No active protocols detected for the current query.</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                  whileHover={{ y: -12 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Link to={`/events/${event.id}`}>
                    <GlassCard className="group relative h-[560px] rounded-[40px] overflow-hidden border-white/5 hover:border-[#9D4EDD]/30 transition-all p-0 shadow-none">
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={event.imageUrl || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop`} 
                          className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                          alt={event.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1F] via-[#0F0A1F]/40 to-transparent z-10" />
                      </div>

                      <div className="relative z-20 h-full p-10 flex flex-col">
                        <div className="mt-auto">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="px-3 py-1 bg-[#9D4EDD]/20 border border-[#9D4EDD]/30 rounded-full text-[10px] font-black uppercase tracking-widest text-[#9D4EDD]">
                              LIVE_EVENT
                            </div>
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                               {event.category || "TECH_FEST"}
                            </div>
                          </div>
                          
                          <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-[0.9] group-hover:text-[#00E5FF] transition-colors">
                            {event.title.split(' ').map((word, i) => (
                              <span key={i} className="block">{word}</span>
                            ))}
                          </h3>

                          <div className="overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-500 ease-in-out">
                            <p className="text-gray-500 text-[10px] font-light leading-relaxed uppercase tracking-wider mb-6 line-clamp-3">
                              {event.description}
                            </p>
                          </div>

                          <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-gray-400 font-mono text-[10px] tracking-widest uppercase">
                              <Calendar size={14} className="text-[#9D4EDD]" /> {event.date}
                            </div>
                            <div className="flex items-center gap-3 text-gray-400 font-mono text-[10px] tracking-widest uppercase">
                              <MapPin size={14} className="text-[#9D4EDD]" /> {event.venue}
                            </div>
                          </div>

                          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                             <div className="flex -space-x-2">
                               {[1,2,3].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1E1642] bg-gray-800" />
                               ))}
                               <div className="w-8 h-8 rounded-full border-2 border-[#1E1642] bg-[#9D4EDD] flex items-center justify-center text-[8px] font-bold">+ {event.registeredCount}</div>
                             </div>
                             <PremiumButton variant="ghost" size="sm" className="group-hover:text-white">
                               ACCESS <Zap size={10} className="ml-2" />
                             </PremiumButton>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
