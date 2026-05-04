import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Users, Zap, Shield, Rocket, Clock, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { PremiumButton, GlassCard } from '../components/ui/PremiumComponents';
import { db } from '../lib/firebase';
import { Event, Stats } from '../types';

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Events Stream
    const q = query(collection(db, 'events'), orderBy('startDate', 'asc'));
    const unsubEvents = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventData);
      setLoading(false);
    });

    // Stats Stream
    const unsubStats = onSnapshot(doc(db, 'stats', 'overall'), (doc) => {
      if (doc.exists()) {
        setStats(doc.data() as Stats);
      }
    });

    return () => {
      unsubEvents();
      unsubStats();
    };
  }, []);

  const now = Date.now();
  const liveEvents = events.filter(e => e.startDate && e.endDate && now >= e.startDate && now <= e.endDate);
  const endingSoon = liveEvents.filter(e => e.endDate && (e.endDate - now) <= 7200000); // 2 hours
  const [currentSlide, setCurrentSlide] = useState(0);

  const highlights = events.filter(e => e.endDate && now > e.endDate).sort((a, b) => (b.endDate || 0) - (a.endDate || 0)).slice(0, 3);
  const activeEvents = [...liveEvents];
  
  useEffect(() => {
    if (activeEvents.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeEvents.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % activeEvents.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + activeEvents.length) % activeEvents.length);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden px-6">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00E5FF]/20 blur-[100px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -120, 0],
              opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#9D4EDD]/10 blur-[120px] rounded-full"
          />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-left w-full max-w-7xl px-12"
        >
          <motion.div variants={itemVariants} className="protocol-label">
            <span>Identity Protocol — Alpha.0</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-huge !mb-10">
            Gather.<br />
            <span className="text-[#9D4EDD]">Secure.</span><br />
            Experience.
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-400 max-w-2xl font-light leading-relaxed mb-12">
            The high-fidelity portal for tech summit pioneers and industry creators. 
            <span className="text-white"> Instant hardware-grade verification</span> at every digital gate.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-6">
            <Link to="/events">
              <PremiumButton size="lg" className="group">
                Secure Your Spot
                <ArrowRight size={24} className="ml-3 group-hover:translate-x-1 transition-transform" />
              </PremiumButton>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-[#1E1642] bg-gray-800" />
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-[#1E1642] bg-[#9D4EDD] flex items-center justify-center text-[10px] font-black tracking-tighter shadow-lg">
                  +12k
                </div>
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] leading-tight">Verified Pioneer <br/> Global Network</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Dynamic Event Streams */}
      <section className="py-20 px-12 max-w-7xl mx-auto space-y-32">
        {/* Live Now */}
        {liveEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="protocol-label !text-green-500 !border-green-500/30 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live_Node_Stream
                </div>
                <h2 className="text-display">Active Now.</h2>
              </div>
              <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest hidden md:block">
                Synchronized Across {liveEvents.length} Nodes
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveEvents.map(event => (
                <Link key={event.id} to={`/events/${event.id}`}>
                  <GlassCard className="h-full border-green-500/20 bg-green-500/[0.02] hover:border-green-500/40 transition-all group">
                     <div className="flex items-center justify-between mb-6">
                        <div className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest rounded">
                           Live
                        </div>
                        <ArrowUpRight size={16} className="text-gray-700 group-hover:text-green-500 transition-colors" />
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-green-500 transition-colors">{event.title}</h3>
                     <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                           <MapPin size={12} className="text-green-500" /> {event.venue}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                           <Users size={12} className="text-green-500" /> {event.registeredCount} Synced
                        </div>
                     </div>
                     <div className="text-[9px] font-black text-green-500/50 uppercase tracking-widest mt-auto">
                        In_Progress
                     </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Ending Soon */}
        {endingSoon.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="protocol-label !text-amber-500 !border-amber-500/30 mb-4 flex items-center gap-2">
                  <Clock size={12} className="animate-spin-slow" />
                  Terminal_Phase
                </div>
                <h2 className="text-display">Ending Soon.</h2>
              </div>
              <Link to="/highlights">
                <PremiumButton variant="ghost" size="sm" className="text-amber-500">View Archive</PremiumButton>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {endingSoon.map(event => (
                <Link key={event.id} to={`/events/${event.id}`}>
                  <GlassCard className="border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/40 transition-all flex gap-6 items-center p-8 group">
                    <div className="w-24 h-24 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                      <Clock size={32} className="text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black uppercase tracking-tight mb-2">{event.title}</h3>
                      <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest mb-4">
                        Ends_In: {Math.max(1, Math.floor((event.endDate! - now) / 60000))} Minutes
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-1 flex-1 bg-amber-500/10 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: "0%" }}
                             animate={{ width: "85%" }}
                             className="h-full bg-amber-500"
                           />
                        </div>
                        <span className="text-[10px] font-black text-amber-500">Final_Call</span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="protocol-label !text-[#9D4EDD] !border-[#9D4EDD]/30 mb-4 flex items-center gap-2">
                  <TrendingUp size={12} />
                  Peak_Performance
                </div>
                <h2 className="text-display">Recent Highlights.</h2>
              </div>
              <Link to="/highlights">
                <PremiumButton size="sm" variant="outline">Full Archive</PremiumButton>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {highlights.map(event => (
                <motion.div key={event.id} whileHover={{ y: -10 }}>
                   <Link to={`/events/${event.id}`}>
                    <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 border border-white/10 group">
                      <img src={event.imageUrl || "https://images.unsplash.com/photo-1540575861501-7ad05823c94b?auto=format&fit=crop&q=80"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                        <div className="flex items-center justify-between w-full">
                           <div className="text-[8px] font-black uppercase tracking-widest text-white/50">{event.date}</div>
                           <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[#9D4EDD]">
                              <Users size={10} /> {event.registeredCount} Attendees
                           </div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight hover:text-[#9D4EDD] transition-colors">{event.title}</h3>
                   </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* Featured Stats */}
      <section className="py-20 px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-10 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl hover:border-[#9D4EDD]/30 transition-colors">
            <span className="text-5xl font-black block mb-2 tracking-tighter text-[#9D4EDD]">{stats?.totalEvents || events.length}</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-black">Active_Protocols</span>
          </div>
          
          <div className="p-10 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl hover:border-[#00E5FF]/30 transition-colors">
            <span className="text-5xl font-black block mb-2 tracking-tighter text-[#00E5FF]">{stats?.completedEvents || highlights.length}</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-black">Success_Stories</span>
          </div>

          <div className="p-10 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/[0.01]">
            <span className="text-5xl font-black block mb-2 tracking-tighter text-white/20">{stats?.totalUsers || 100}</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-black">Verified_Pioneers</span>
          </div>
        </div>
      </section>

      {/* Modern Split Section */}
      <section className="py-24 px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="protocol-label">Verification / Entry</div>
            <h2 className="text-display mb-10">
              Atomic <br />
              <span className="text-white/20 italic">Check-in.</span>
            </h2>
            <p className="text-xl text-gray-400 font-light leading-relaxed mb-10">
              Our high-fidelity credential system ensures entry management is handled with precision. No queues, no friction—just the event. 
            </p>
            <div className="flex gap-12">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Deployment</span>
                <span className="text-sm font-medium">Nexus_Main_Hall</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Status</span>
                <span className="text-sm font-medium text-[#FFD166]">Real_Time_Sync</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-[500px]"
          >
            <AnimatePresence mode="wait">
              {activeEvents.length > 0 ? (
                <motion.div
                  key={activeEvents[currentSlide].id}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "circOut" }}
                  className="absolute inset-0"
                >
                  <GlassCard className="h-full p-0 overflow-hidden border-[#9D4EDD]/30 group bg-black/40 backdrop-blur-3xl shadow-[0_0_50px_-12px_rgba(157,78,221,0.3)]">
                    <div className="h-2/3 overflow-hidden relative">
                      <img 
                        src={activeEvents[currentSlide].imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt="" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      
                      {/* Status Badges */}
                      <div className="absolute top-6 left-6 flex gap-3">
                         {endingSoon.some(e => e.id === activeEvents[currentSlide].id) ? (
                           <div className="px-3 py-1 bg-amber-500/20 backdrop-blur-md border border-amber-500/50 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                             Ending_Soon
                           </div>
                         ) : (
                           <div className="px-3 py-1 bg-green-500/20 backdrop-blur-md border border-green-500/50 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                             Live_Now
                           </div>
                         )}
                      </div>
                    </div>

                    <div className="p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{activeEvents[currentSlide].title}</h3>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-1">
                              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block">Frequency / Status</span>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <Clock size={12} className="text-[#00E5FF]" /> 
                                {endingSoon.some(e => e.id === activeEvents[currentSlide].id) 
                                  ? `${Math.max(1, Math.floor((activeEvents[currentSlide].endDate! - now) / 60000))}M Remaining`
                                  : "Running_Active"
                                }
                              </div>
                           </div>
                           <div className="space-y-1">
                              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block">Node_Location</span>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <MapPin size={12} className="text-[#9D4EDD]" /> {activeEvents[currentSlide].venue.split(',')[0]}
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-8">
                        <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                           <Users size={12} className="text-white/20" /> {activeEvents[currentSlide].registeredCount} Sync_Nodes
                        </div>
                        <Link to={`/events/${activeEvents[currentSlide].id}`}>
                          <PremiumButton size="sm" variant="premium">JOIN_PROTOCOL</PremiumButton>
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div
                  key="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]"
                >
                  <p className="text-gray-700 font-black uppercase tracking-[0.4em] text-sm">No active events currently</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Carousel Controls */}
            {activeEvents.length > 1 && (
              <div className="absolute -bottom-16 right-0 flex gap-4">
                <button 
                  onClick={prevSlide}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
            
            {/* Progress Indicators */}
            {activeEvents.length > 1 && (
              <div className="absolute -bottom-16 left-0 flex items-center gap-3">
                {activeEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1 transition-all rounded-full ${idx === currentSlide ? 'w-12 bg-[#9D4EDD]' : 'w-4 bg-white/10 hover:bg-white/20'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Simple internal icon for TrendingUp since it wasn't in the initial import
function TrendingUp({ size = 20, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}
