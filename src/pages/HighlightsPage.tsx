import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { Event, Highlight } from '../types';
import { GlassCard, PremiumButton } from '../components/ui/PremiumComponents';
import { Calendar, Users, Clock, ArrowUpRight, TrendingUp, Zap, CheckCircle2, Trophy, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const HighlightsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CORE' | 'GAMING'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'ATTENDANCE'>('NEWEST');

  useEffect(() => {
    // Standard Events
    const qEvents = query(collection(db, 'events'), orderBy('endDate', 'desc'));
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    });

    // Explicit Highlights
    const qHighlights = query(collection(db, 'highlights'), orderBy('completedAt', 'desc'));
    const unsubHighlights = onSnapshot(qHighlights, (snapshot) => {
      setHighlights(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Highlight)));
    });

    const timer = setTimeout(() => setLoading(false), 1000);

    return () => {
      unsubEvents();
      unsubHighlights();
      clearTimeout(timer);
    };
  }, []);

  const now = Date.now();
  const completedEvents = events.filter(e => e.endDate && now > e.endDate);
  const liveEvents = events.filter(e => e.startDate && e.endDate && now >= e.startDate && now <= e.endDate);
  
  // Combine into a unified history view
  const historyItems = [
    ...completedEvents.map(e => ({
      id: e.id,
      title: e.title,
      type: 'CORE' as const,
      timestamp: e.endDate || 0,
      image: e.imageUrl,
      metrics: { primary: `${e.registeredCount} NODES`, secondary: e.date }
    })),
    ...highlights.map(h => ({
      id: h.id,
      title: h.title,
      type: 'GAMING' as const,
      timestamp: h.completedAt,
      image: h.imageUrl,
      metrics: { primary: h.stats?.winner || `${h.stats?.attendance} TEAMS`, secondary: new Date(h.completedAt).toLocaleDateString() }
    }))
  ].filter(item => filter === 'ALL' || item.type === filter)
   .sort((a, b) => b.timestamp - a.timestamp);

  if (loading) return <div className="pt-32 text-center text-white/40 font-black uppercase tracking-widest">Accessing Archive Grid...</div>;

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <section className="mb-20">
        <div className="protocol-label mb-4">Archive / Performance History</div>
        <h1 className="text-huge mb-12">System<br/><span className="text-white/20 italic">Legacy.</span></h1>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <GlassCard className="border-[#9D4EDD]/20 bg-[#9D4EDD]/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#9D4EDD]/20 rounded-xl text-[#9D4EDD]">
                <History size={24} />
              </div>
              <div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Archived_Records</div>
                 <div className="text-3xl font-black">{historyItems.length}</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl text-green-500">
                <Zap size={24} className="animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active_Operations</div>
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
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total_Capacity</div>
                <div className="text-3xl font-black">
                   {historyItems.length > 0 ? '98.4%' : '0%'}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between mb-12">
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 block">Sector_Filter</label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {(['ALL', 'CORE', 'GAMING'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Unified History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {historyItems.map(item => (
            <motion.div layout key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard className="h-full border-white/5 hover:border-[#9D4EDD]/30 transition-all group p-0 overflow-hidden">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80'} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1F] to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className={`px-2 py-1 rounded bg-[#0F0A1F]/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest border ${
                      item.type === 'CORE' ? 'text-[#9D4EDD] border-[#9D4EDD]/30' : 'text-[#00E5FF] border-[#00E5FF]/30'
                    }`}>
                      {item.type}_LOG
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-[#9D4EDD] transition-colors">{item.title}</h3>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <History size={12} className="text-[#00E5FF]" /> {item.metrics.secondary}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <Zap size={12} className="text-[#9D4EDD]" /> {item.metrics.primary}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 bg-white/5 border border-white/5 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      ACCESS_LOGS
                    </button>
                    <button className="p-3 bg-white/5 rounded-xl border border-white/5 text-gray-500 hover:text-white transition-colors">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {historyItems.length === 0 && (
          <div className="text-center py-40 border border-dashed border-white/10 rounded-3xl">
            <p className="text-gray-700 font-black uppercase tracking-[0.4em] text-sm italic">Archive directory is empty</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HighlightsPage;
