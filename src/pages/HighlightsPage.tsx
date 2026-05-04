import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { Event } from '../types';
import { GlassCard, PremiumButton } from '../components/ui/PremiumComponents';
import { Calendar, Users, Clock, ArrowUpRight, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const HighlightsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'TOP'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'ATTENDANCE'>('NEWEST');

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('endDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const now = Date.now();
  const completedEvents = events.filter(e => e.endDate && now > e.endDate);
  const liveEvents = events.filter(e => e.startDate && e.endDate && now >= e.startDate && now <= e.endDate);
  const endingSoon = liveEvents.filter(e => e.endDate && (e.endDate - now) <= 7200000); // 2 hours

  const displayedEvents = completedEvents
    .filter(e => filter === 'ALL' || (e.registeredCount / e.capacity >= 0.8))
    .sort((a, b) => {
      if (sortBy === 'ATTENDANCE') return b.registeredCount - a.registeredCount;
      return (b.endDate || 0) - (a.endDate || 0);
    });

  if (loading) return <div className="pt-32 text-center text-white/40">Accessing Archive...</div>;

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <section className="mb-20">
        <div className="protocol-label mb-4">Archive / Performance</div>
        <h1 className="text-huge mb-12">Event<br/><span className="text-white/20 italic">Highlights.</span></h1>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <GlassCard className="border-[#9D4EDD]/20 bg-[#9D4EDD]/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#9D4EDD]/20 rounded-xl text-[#9D4EDD]">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Archived_Nodes</div>
                <div className="text-3xl font-black">{completedEvents.length}</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl text-green-500">
                <Zap size={24} className="animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active_Streams</div>
                <div className="text-3xl font-black">{liveEvents.length}</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-[#00E5FF]/20 bg-[#00E5FF]/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#00E5FF]/20 rounded-xl text-[#00E5FF]">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Peak_Attendance</div>
                <div className="text-3xl font-black">
                  {completedEvents.length > 0 ? Math.max(...completedEvents.map(e => e.registeredCount)) : 0}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between mb-12">
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 block">Tier_Filter</label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {['ALL', 'TOP'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === f ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 block">Pulse_Sort</label>
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-white/5 rounded-xl px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-[#9D4EDD]/40"
              >
                <option value="NEWEST" className="bg-[#0F0A1F]">CHRONOLOGICAL</option>
                <option value="ATTENDANCE" className="bg-[#0F0A1F]">RESONANCE_LEVEL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ending Soon Section */}
        {endingSoon.length > 0 && (
          <div className="mb-20">
            <div className="protocol-label !text-amber-500 !border-amber-500/30 mb-8 flex items-center gap-4">
              <Clock size={12} className="animate-spin-slow" /> Terminal_Warning / Nearing_Completion
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {endingSoon.map(event => (
                <GlassCard key={event.id} className="border-amber-500/20 bg-amber-500/5 group">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                      <img src={event.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                    </div>
                    <div className="flex-1 py-2">
                      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2">Sync_Ending_Soon</div>
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{event.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase text-gray-400">
                          Expires_In: {Math.max(1, Math.floor((event.endDate! - now) / 60000))}M
                        </div>
                        <Link to={`/events/${event.id}`}>
                          <PremiumButton size="sm" variant="outline" className="border-amber-500/30 text-amber-500">Emergency_Join</PremiumButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedEvents.map(event => (
            <motion.div layout key={event.id}>
              <GlassCard className="h-full border-white/5 hover:border-[#9D4EDD]/30 transition-all group p-0 overflow-hidden">
                <div className="h-48 overflow-hidden relative">
                  <img src={event.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1F] to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="px-2 py-1 rounded bg-[#0F0A1F]/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-[#9D4EDD] border border-[#9D4EDD]/30">
                      Completed_Protocol
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-[#9D4EDD] transition-colors">{event.title}</h3>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <Calendar size={12} className="text-[#00E5FF]" /> {event.date}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <Users size={12} className="text-[#9D4EDD]" /> {event.registeredCount} Total_Nodes
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link to={`/events/${event.id}`} className="flex-1">
                      <PremiumButton variant="outline" size="sm" className="w-full">Replay_Recap</PremiumButton>
                    </Link>
                    <button className="p-3 bg-white/5 rounded-xl border border-white/5 text-gray-500 hover:text-white transition-colors">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {displayedEvents.length === 0 && (
          <div className="text-center py-40 border border-dashed border-white/10 rounded-3xl">
            <p className="text-gray-700 font-black uppercase tracking-[0.4em] text-sm">No archived protocols found</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HighlightsPage;
