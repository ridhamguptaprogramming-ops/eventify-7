import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Play, 
  LayoutGrid, 
  Search, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  Monitor, 
  Crown,
  Zap,
  Target,
  Sword,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tournament, Match } from '../types';
import { GlassCard, PremiumButton } from '../components/ui/PremiumComponents';
import { useAuth } from '../context/AuthContext';

export default function GamingPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TOURNAMENTS' | 'LEADERBOARD' | 'SCHEDULE'>('TOURNAMENTS');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Only fetch live data, no automatic seeding to prevent restoring unwanted data
    const unsubTournaments = onSnapshot(collection(db, 'tournaments'), (snapshot) => {
      setTournaments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tournament)));
    });

    const qMatches = query(collection(db, 'matches'), orderBy('scheduledAt', 'asc'), limit(20));
    const unsubMatches = onSnapshot(qMatches, (snapshot) => {
      setMatches(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match)));
      setLoading(false);
    });

    return () => {
      unsubTournaments();
      unsubMatches();
    };
  }, []);

  const filteredTournaments = tournaments.filter(t => 
    t.gameName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-[#0B0618] min-h-screen text-white overflow-x-hidden">
      {/* Cinematic Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E1642]/40 via-[#0B0618] to-[#0B0618]" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#9D4EDD] filter blur-[150px] rounded-full opacity-30"
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#00E5FF] filter blur-[180px] rounded-full opacity-20"
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00E5FF] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              < Zap size={14} className="fill-[#00E5FF]" /> Level Up Your Game
            </span>
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-8 leading-tight">
              Enter The <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#9D4EDD] to-[#FF4D9D] animate-gradient-x">Gaming Arena</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-medium tracking-wide max-w-2xl mx-auto mb-12 uppercase leading-relaxed opacity-80 italic">
              Compete, conquer, and claim your legacy in the most immersive 
              esports environment ever built.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <PremiumButton size="lg" variant="primary" className="w-full md:w-auto h-16 px-10 group bg-transparent border-2 border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#0B0618] transition-all duration-500 shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                JOIN TOURNAMENT <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </PremiumButton>
              <PremiumButton size="lg" variant="outline" className="w-full md:w-auto h-16 px-10 group border-white/20 hover:border-[#9D4EDD]/50 hover:bg-[#9D4EDD]/10">
                VIEW LEADERBOARD <Crown className="ml-2 text-[#9D4EDD]" />
              </PremiumButton>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* Stats Quick Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: <Trophy />, label: "Total Prize Pool", value: "00", color: "#FFD000" },
            { icon: <Users />, label: "Active Pro Teams", value: "00", color: "#00E5FF" },
            { icon: <Gamepad2 />, label: "Live Tournaments", value: tournaments.length.toString(), color: "#9D4EDD" },
            { icon: <Monitor />, label: "Matches Detected", value: matches.length.toString(), color: "#FF4D9D" },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
               <GlassCard className="p-8 border-white/5 hover:border-white/10 transition-all text-center group cursor-default shadow-none">
                  <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-6 bg-white/[0.03] text-gray-500 group-hover:scale-110 group-hover:rotate-6 transition-all" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black mb-2 tracking-tighter" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors">{stat.label}</div>
               </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Main Content Area with Tabs */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 border-b border-white/5 pb-8">
           <div className="flex items-center gap-8 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
              {['TOURNAMENTS', 'SCHEDULE', 'LEADERBOARD'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`text-sm font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap relative pb-4 ${
                    activeTab === tab ? 'text-[#00E5FF]' : 'text-gray-600 hover:text-white'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
                  )}
                </button>
              ))}
           </div>
           <div className="relative w-full md:w-80 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E5FF] transition-colors" size={18} />
              <input 
                placeholder="SEARCH_ARENA..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-16 pr-8 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-[#00E5FF]/50 focus:bg-white/[0.05] transition-all"
              />
           </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'TOURNAMENTS' && (
            <motion.div 
              key="tournaments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
               {filteredTournaments.length > 0 ? filteredTournaments.map((t) => (
                 <motion.div key={t.id} whileHover={{ y: -10 }}>
                   <GlassCard className="p-0 overflow-hidden group border-white/5 hover:border-[#9D4EDD]/30 transition-all h-[550px] shadow-none bg-white/[0.01]">
                      <div className="h-[240px] relative overflow-hidden">
                        <img src={t.bannerImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0618] to-transparent" />
                        <div className="absolute top-6 left-6 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${t.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                           <span className="text-[10px] font-black uppercase tracking-widest">{t.status === 'live' ? 'LIVE NOW' : 'UPCOMING'}</span>
                        </div>
                        <div className="absolute bottom-6 left-6">
                           <h3 className="text-3xl font-black italic tracking-tighter uppercase">{t.gameName}</h3>
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-1">Prize Pool</span>
                              <span className="text-xl font-black text-[#FFD000] tracking-tight">{t.prizePool}</span>
                           </div>
                           <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-1">Entry Fee</span>
                              <span className="text-xl font-black text-white tracking-tight">{t.entryFee}</span>
                           </div>
                        </div>
                        <div className="flex items-center justify-between mb-8 px-2">
                           <div className="flex items-center gap-3">
                              <Users size={16} className="text-[#00E5FF]" />
                              <div>
                                <div className="text-[10px] font-black text-white tracking-widest uppercase">{t.registeredTeamsCount} Teams</div>
                                <div className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">{t.teamSize} vs {t.teamSize} Squads</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <Clock size={16} className="text-[#9D4EDD]" />
                              <div>
                                <div className="text-[10px] font-black text-white tracking-widest uppercase">Start Time</div>
                                <div className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">{new Date(t.startDate).toLocaleDateString()}</div>
                              </div>
                           </div>
                        </div>
                        <PremiumButton variant="premium" className="w-full h-14 uppercase font-black text-xs tracking-[0.3em] rounded-2xl shadow-[0_4px_20px_rgba(157,78,221,0.2)]">
                           REGISTER_TEAM
                        </PremiumButton>
                      </div>
                   </GlassCard>
                 </motion.div>
               )) : (
                 <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-gray-700 font-black uppercase tracking-[0.4em] text-sm italic">No active tournaments deployed in sector</p>
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === 'SCHEDULE' && (
             <motion.div 
               key="schedule"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
             >
                {matches.length > 0 ? matches.map((m, i) => (
                  <motion.div key={m.id} whileHover={{ x: 10 }}>
                    <GlassCard className="p-8 border-white/5 hover:border-[#00E5FF]/30 transition-all flex flex-col md:flex-row items-center justify-between gap-8 bg-white/[0.01]">
                       <div className="flex items-center gap-4 text-gray-500 italic font-black uppercase text-[10px] tracking-[0.3em] w-32">
                          <Play size={14} className={m.matchStatus === 'live' ? 'text-red-500' : ''} /> {m.matchStatus === 'live' ? 'LIVE_NOW' : new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                       
                       <div className="flex-1 flex items-center justify-center gap-4 md:gap-12">
                          <div className="flex flex-col items-center md:flex-row-reverse gap-4 flex-1 justify-end">
                             <div className="text-xl md:text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">{m.teamA.name}</div>
                             <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#9D4EDD]">
                                <Rocket size={24} />
                             </div>
                          </div>
                          
                          <div className="flex flex-col items-center gap-2">
                             <div className="text-3xl md:text-5xl font-black tracking-tighter text-white font-mono">{m.scoreA} - {m.scoreB}</div>
                             <div className="px-3 py-1 bg-white/[0.05] border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-[#00E5FF]">Best of 3</div>
                          </div>
 
                          <div className="flex flex-col items-center md:flex-row gap-4 flex-1 justify-start">
                             <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#00E5FF]">
                                <Sword size={24} />
                             </div>
                             <div className="text-xl md:text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">{m.teamB.name}</div>
                          </div>
                       </div>
                       
                       <div className="w-full md:w-auto">
                          <PremiumButton variant="outline" size="sm" className="w-full md:w-auto border-white/10 hover:border-[#00E5FF]/50 text-[10px] tracking-[0.2em] uppercase font-black h-12 px-8">
                             {m.matchStatus === 'live' ? 'WATCH_LIVE' : 'PRE-MATCH_VIEW'}
                          </PremiumButton>
                       </div>
                    </GlassCard>
                  </motion.div>
                )) : (
                  <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
                     <p className="text-gray-700 font-black uppercase tracking-widest text-xs">No scheduled matches detected</p>
                  </div>
                )}
             </motion.div>
          )}

          {activeTab === 'LEADERBOARD' && (
             <motion.div 
               key="leaderboard"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
             >
                <GlassCard className="p-0 border-white/5 overflow-hidden bg-white/[0.01]">
                   <div className="overflow-x-auto">
                      <table className="w-full">
                         <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                               <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Rank</th>
                               <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Team_Protocol</th>
                               <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Matches</th>
                               <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Wins</th>
                               <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">K/D Ratio</th>
                               <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Global_Points</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5">
                            {[
                              { rank: 1, name: "CYBER_WOLF", matches: 42, wins: 38, kd: 1.85, pts: 12450, color: "#FFD000" },
                              { rank: 2, name: "NEON_KNIGHTS", matches: 40, wins: 34, kd: 1.62, pts: 11200, color: "#C0C0C0" },
                              { rank: 3, name: "VIRTUAL_FORCE", matches: 45, wins: 32, kd: 1.58, pts: 10850, color: "#CD7F32" },
                              { rank: 4, name: "NOX_GAMING", matches: 38, wins: 28, kd: 1.42, pts: 9400, color: "transparent" },
                              { rank: 5, name: "VOID_SQUAD", matches: 41, wins: 26, kd: 1.38, pts: 8900, color: "transparent" },
                            ].map((row, i) => (
                              <motion.tr 
                                key={i} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="hover:bg-white/[0.02] transition-colors group"
                              >
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                       <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${row.rank <= 3 ? 'border-transparent' : 'border-white/10 text-gray-500'}`} style={row.rank <= 3 ? { background: `${row.color}33`, color: row.color, borderColor: row.color } : {}}>
                                          {row.rank}
                                       </span>
                                       {row.rank === 1 && <Crown className="text-[#FFD000]" size={16} />}
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 text-lg font-black italic uppercase tracking-tighter text-white group-hover:text-[#00E5FF] transition-colors">
                                    {row.name}
                                 </td>
                                 <td className="px-8 py-6 text-center font-mono text-gray-500">{row.matches}</td>
                                 <td className="px-8 py-6 text-center font-mono text-green-500">{row.wins}</td>
                                 <td className="px-8 py-6 text-center font-mono text-[#9D4EDD]">{row.kd}</td>
                                 <td className="px-8 py-6 text-right font-black italic text-xl tracking-tighter text-[#00E5FF]">
                                    {row.pts.toLocaleString()}
                                 </td>
                              </motion.tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </GlassCard>
             </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Live Stream Section */}
      <section className="py-20 bg-gradient-to-t from-[#1E1642]/20 to-transparent">
        <div className="px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
             <div className="space-y-4">
                <span className="text-[#FF4D9D] text-[10px] font-black uppercase tracking-[0.4em]">Live Event Feed</span>
                <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight">Watch Global <br/> <span className="text-white/20">Operations</span></h2>
             </div>
             <PremiumButton variant="outline" className="h-14 px-10 border-white/10 hover:border-[#FF4D9D]/50 group">
                BROWSE ALL STREAMS <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
             </PremiumButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black group">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-20 h-20 rounded-full bg-[#00E5FF] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_40px_rgba(0,229,255,0.4)]">
                      <Play className="text-[#0B0618] ml-1 fill-current" size={32} />
                   </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2080&auto=format&fit=crop" 
                  className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" 
                  alt="" 
                />
                <div className="absolute top-8 left-8 flex items-center gap-4">
                   <div className="px-4 py-1.5 bg-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      LIVE
                   </div>
                   <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white/80">
                      <Users size={14} />
                      14.2K VIEWERS
                   </div>
                </div>
                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                   <div className="space-y-1">
                      <div className="text-2xl font-black uppercase tracking-tighter">Grand Finals: Sector_7 vs Apex_Predators</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00E5FF]">Valorant Champions Tour 2026</div>
                   </div>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mb-20"
        >
           <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-6">Legendary <span className="text-[#FFD000]">Rewards</span></h2>
           <p className="text-gray-500 uppercase font-black tracking-[0.3em] text-sm">Earn your place in the hall of fame</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           {[
             { title: "Grand Champion", reward: "$10,000", icon: <Crown size={48} />, color: "#FFD000" },
             { title: "MVP Badge", reward: "Custom Skin", icon: <Target size={48} />, color: "#00E5FF" },
             { title: "Team Protocol", reward: "Pro Contract", icon: <ShieldCheck size={48} />, color: "#9D4EDD" },
           ].map((reward, i) => (
             <motion.div
               key={i}
               whileHover={{ scale: 1.05 }}
               className="relative group"
             >
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-[40px] blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <GlassCard className="relative p-12 border-white/5 h-full flex flex-col items-center gap-8 bg-white/[0.02]">
                   <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:rotate-[360deg]" style={{ color: reward.color, boxShadow: `0 0 40px ${reward.color}11` }}>
                      {reward.icon}
                   </div>
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">{reward.title}</h3>
                      <div className="text-4xl font-black italic tracking-tight" style={{ color: reward.color }}>{reward.reward}</div>
                   </div>
                   <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] leading-relaxed">
                      Unlocked at Diamond Tier <br/> and above status.
                   </p>
                </GlassCard>
             </motion.div>
           ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
         <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           whileInView={{ scale: 1, opacity: 1 }}
           viewport={{ once: true }}
           className="relative rounded-[3rem] overflow-hidden border border-[#00E5FF]/20 bg-[#1E1642]/40 p-20 text-center group"
         >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
            <div className="relative z-10">
               <h2 className="text-5xl md:text-7xl font-black italic tracking-tight uppercase mb-8 leading-tight">Ready to <br/> <span className="text-[#00E5FF]">Dominate?</span></h2>
               <p className="text-gray-400 font-medium tracking-widest uppercase text-sm mb-12 max-w-xl mx-auto leading-relaxed">
                  Join 100,000+ warriors in the arena. Your journey from zero to legend starts with a single click.
               </p>
               <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <PremiumButton size="lg" variant="primary" className="h-16 px-12 group bg-[#00E5FF] text-[#0B0618] hover:scale-105 transition-transform shadow-[0_0_50px_rgba(0,229,255,0.3)]">
                     INITIALIZE_SIGNUP
                  </PremiumButton>
                  <PremiumButton size="lg" variant="outline" className="h-16 px-12 border-white/20 hover:border-[#9D4EDD]/50">
                     LEARN_MORE
                  </PremiumButton>
               </div>
            </div>
            
            <motion.div 
              animate={{ x: [-500, 500], y: [-500, 500] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-[200%] h-2 bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent rotate-45"
            />
         </motion.div>
      </section>
    </div>
  );
}
