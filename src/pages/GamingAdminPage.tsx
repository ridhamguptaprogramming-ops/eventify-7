import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Gamepad2, 
  Settings, 
  ChevronRight, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  Zap, 
  Monitor, 
  LayoutGrid,
  BarChart3, 
  Calendar, 
  Clock, 
  Sword,
  Target,
  Rocket,
  ShieldAlert,
  Save,
  Plus,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell
} from 'recharts';
import { db } from '../lib/firebase';
import { Tournament, Match, Team, UserProfile, UserRole, OperationType } from '../types';
import { GlassCard, PremiumButton } from '../components/ui/PremiumComponents';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError } from '../lib/utils';

import { seedGamingData } from '../services/gamingService';

type AdminPanel = 'OVERVIEW' | 'PLAYERS' | 'TEAMS' | 'TOURNAMENTS' | 'MATCHES';

export default function GamingAdminPage() {
  const { profile: currentUser, loading: authLoading } = useAuth();
  const [activePanel, setActivePanel] = useState<AdminPanel>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Data States
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (authLoading || !currentUser || currentUser.role === UserRole.USER) return;

    // Seed data on admin entry if needed
    seedGamingData();

    const unsubTournaments = onSnapshot(collection(db, 'tournaments'), (snapshot) => {
      setTournaments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tournament)));
    });

    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      setTeams(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
    });

    const unsubMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
      setMatches(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match)));
    });

    const unsubPlayers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setPlayers(snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as any as UserProfile)));
    });

    setLoading(false);

    return () => {
      unsubTournaments();
      unsubTeams();
      unsubMatches();
      unsubPlayers();
    };
  }, [currentUser, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0618] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="text-[#00E5FF] animate-spin" size={48} />
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00E5FF]">INITIALIZING_SESSION...</div>
        </div>
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.MODERATOR)) {
    return (
      <div className="min-h-screen bg-[#0B0618] flex items-center justify-center p-6 text-center">
        <GlassCard className="max-w-md p-12 border-red-500/20">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">ACCESS DENIED</h1>
          <p className="text-gray-500 text-sm font-black uppercase tracking-[0.2em] mb-8">
            You do not have the required clearance to access the Command Terminal.
          </p>
          <PremiumButton onClick={() => window.location.href = '/'} variant="outline" className="w-full">
            RETURN TO SECTOR_7
          </PremiumButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0618] text-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-[#0B0618] border-r border-white/5 flex flex-col pt-24">
        <div className="px-8 mb-12">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2">Command Center</div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#00E5FF]">TERMINAL_V.2</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'OVERVIEW', icon: <LayoutDashboard size={20} />, label: 'SYSTEM_OVERVIEW' },
            { id: 'PLAYERS', icon: <Users size={20} />, label: 'PLAYER_DATABASE' },
            { id: 'TEAMS', icon: <Rocket size={20} />, label: 'TEAM_PROTOCOLS' },
            { id: 'TOURNAMENTS', icon: <Trophy size={20} />, label: 'TOURNAMENT_OPS' },
            { id: 'MATCHES', icon: <Sword size={20} />, label: 'MATCH_CONTROL' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id as AdminPanel)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] group ${
                activePanel === item.id 
                  ? 'bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.1)]' 
                  : 'text-gray-600 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`${activePanel === item.id ? 'text-[#00E5FF]' : 'text-gray-700'}`}>
                {item.icon}
              </div>
              {item.label}
              {activePanel === item.id && (
                <motion.div layoutId="active-nav" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto border-t border-white/5">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#9D4EDD] p-[1px]">
                 <div className="w-full h-full rounded-full bg-[#0B0618] flex items-center justify-center text-[10px] font-black">
                    {currentUser.displayName?.[0]}
                 </div>
              </div>
              <div>
                 <div className="text-[10px] font-black uppercase text-white truncate max-w-[120px]">{currentUser.displayName}</div>
                 <div className="text-[8px] font-black text-[#00E5FF] uppercase tracking-widest">{currentUser.role}</div>
              </div>
           </div>
           <PremiumButton variant="outline" size="sm" className="w-full text-[8px] border-white/10 opacity-50 hover:opacity-100">
              TERMINATE_SESSION
           </PremiumButton>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-8 pt-24 md:p-12 md:pt-24 overflow-y-auto h-screen no-scrollbar">
        <AnimatePresence mode="wait">
          {activePanel === 'OVERVIEW' && (
            <AdminOverview key="overview_comp" players={players} tournaments={tournaments} matches={matches} teams={teams} />
          )}
          {activePanel === 'PLAYERS' && (
            <PlayerManager key="players_comp" players={players} />
          )}
          {activePanel === 'TEAMS' && (
            <TeamManager key="teams_comp" teams={teams} tournaments={tournaments} />
          )}
          {activePanel === 'TOURNAMENTS' && (
            <TournamentController key="tournaments_comp" tournaments={tournaments} />
          )}
          {activePanel === 'MATCHES' && (
            <MatchControlCenter key="matches_comp" matches={matches} tournaments={tournaments} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function AdminOverview({ players, tournaments, matches, teams }: any) {
  const statsCards = [
    { label: 'Total Players', value: players.length, icon: <Users />, color: '#00E5FF' },
    { label: 'Active Teams', value: teams.length, icon: <Rocket />, color: '#9D4EDD' },
    { label: 'Total Tournaments', value: tournaments.length, icon: <Trophy />, color: '#FFD000' },
    { label: 'Live Matches', value: matches.filter((m: any) => m.matchStatus === 'live').length, icon: <Monitor />, color: '#FF4D9D' },
  ];

  const chartData = [
    { name: 'MON', value: 400 },
    { name: 'TUE', value: 600 },
    { name: 'WED', value: 550 },
    { name: 'THU', value: 800 },
    { name: 'FRI', value: 1200 },
    { name: 'SAT', value: 1800 },
    { name: 'SUN', value: 2100 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
         <div>
            <span className="text-[#00E5FF] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">System Analytics</span>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase">OPERATIONS_SUMMARY</h1>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                seedGamingData();
                window.location.reload();
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all flex items-center gap-2"
            >
              <RefreshCw size={12} /> RE-INITIALIZE_DATABASE
            </button>
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE_SYNC
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <GlassCard key={i} className="p-8 border-white/5 group hover:border-[#00E5FF]/20 transition-all bg-white/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-6 text-gray-500 group-hover:scale-110 transition-transform" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="text-4xl font-black tracking-tighter mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-gray-400">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <GlassCard className="lg:col-span-2 p-10 border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-12">
               <h3 className="text-xl font-black uppercase tracking-tighter italic">Registration Activity</h3>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-[#00E5FF]" />
                     <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">New Users</span>
                  </div>
               </div>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis 
                        dataKey="name" 
                        stroke="#ffffff20" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#4b5563', fontWeight: 900 }}
                     />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ 
                           backgroundColor: '#0B0618', 
                           border: '1px solid rgba(255,255,255,0.1)',
                           borderRadius: '12px',
                           fontSize: '10px',
                           fontFamily: 'monospace'
                        }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00E5FF" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </GlassCard>

         <GlassCard className="p-10 border-white/5 bg-white/[0.01]">
            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-8">Popular Arenas</h3>
            <div className="space-y-6">
               {[
                  { name: 'VALORANT', percent: 85, color: '#00E5FF' },
                  { name: 'BGMI', percent: 72, color: '#9D4EDD' },
                  { name: 'FIFA 26', percent: 45, color: '#FFD000' },
                  { name: 'CS2', percent: 30, color: '#FF4D9D' },
               ].map((game, i) => (
                  <div key={i} className="space-y-3">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{game.name}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: game.color }}>{game.percent}%</span>
                     </div>
                     <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           whileInView={{ width: `${game.percent}%` }}
                           transition={{ duration: 1, delay: i * 0.1 }}
                           className="h-full rounded-full shadow-[0_0_10px]"
                           style={{ backgroundColor: game.color, boxShadow: `0 0 10px ${game.color}66` }}
                        />
                     </div>
                  </div>
               ))}
            </div>
         </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <GlassCard className="p-8 border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black uppercase tracking-tighter italic">Recent Transmissions</h3>
               <button className="text-[8px] font-black uppercase tracking-widest text-[#00E5FF]">VIEW_LOGS</button>
            </div>
            <div className="space-y-4">
               {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                     <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
                        <RefreshCw size={14} className="animate-pulse" />
                     </div>
                     <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-tight">New Team Registration: PROTOCOL_X</div>
                        <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest">2 Minutes ago • Valorant Ops</div>
                     </div>
                  </div>
               ))}
            </div>
         </GlassCard>

         <GlassCard className="p-8 border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black uppercase tracking-tighter italic">Threat Assessment</h3>
               <ShieldAlert className="text-red-500" size={20} />
            </div>
            <div className="flex flex-col items-center justify-center h-48 text-center">
               <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4 border border-green-500/20">
                  <CheckCircle2 size={32} />
               </div>
               <div className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">Security: Stable</div>
               <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-2">No integrity violations detected</div>
            </div>
         </GlassCard>
      </div>
    </motion.div>
  );
}

function PlayerManager({ players }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPlayers = players.filter(p => 
    p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.gamerTag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBanStatus = async (player: UserProfile) => {
     try {
        const newStatus = player.status === 'active' ? 'banned' : 'active';
        await updateDoc(doc(db, 'users', player.uid), { status: newStatus });
     } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${player.uid}`);
     }
  };

  const updateRole = async (player: UserProfile, role: UserRole) => {
     try {
        await updateDoc(doc(db, 'users', player.uid), { role });
     } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${player.uid}`);
     }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
         <div>
            <span className="text-[#9D4EDD] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Database Ops</span>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase">PLAYER_REGISTRY</h1>
         </div>
         <div className="relative w-full md:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="SCAN_GAMERTAG..." 
               className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-16 pr-8 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all"
            />
         </div>
      </div>

      <GlassCard className="p-0 border-white/5 bg-white/[0.01] overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Node_ID</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Identity</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Rank/Stats</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Clearance</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredPlayers.map((player) => (
                    <tr key={player.uid} className="hover:bg-white/[0.02] transition-colors group">
                       <td className="px-8 py-6">
                          <code className="text-[10px] text-gray-700 uppercase font-mono">#{player.uid.slice(0, 8)}</code>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center font-black italic">
                                {player.displayName[0]}
                             </div>
                             <div>
                                <div className="text-sm font-black uppercase italic tracking-tighter">{player.displayName}</div>
                                <div className="text-[8px] font-black text-gray-600 tracking-widest uppercase">{player.email}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="px-2 py-1 bg-[#00E5FF]/10 text-[#00E5FF] text-[8px] font-black rounded border border-[#00E5FF]/20">
                                {player.rank || 'BRONZE'}
                             </div>
                             <div className="text-[10px] font-black italic text-gray-500">K/D: {player.kdRatio || '1.0'}</div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <select 
                             value={player.role}
                             onChange={(e) => updateRole(player, e.target.value as UserRole)}
                             className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#9D4EDD] focus:outline-none cursor-pointer"
                          >
                             <option value={UserRole.USER} className="bg-[#0B0618]">USER</option>
                             <option value={UserRole.MODERATOR} className="bg-[#0B0618]">MODERATOR</option>
                             <option value={UserRole.ADMIN} className="bg-[#0B0618]">ADMIN</option>
                          </select>
                       </td>
                       <td className="px-8 py-6">
                          <div className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${player.status === 'banned' ? 'text-red-500' : 'text-green-500'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${player.status === 'banned' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                             {player.status || 'ACTIVE'}
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-2 border border-white/5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                                <Edit3 size={14} />
                             </button>
                             <button 
                                onClick={() => toggleBanStatus(player)}
                                className={`p-2 border border-white/5 rounded-lg hover:bg-red-500/10 transition-all ${player.status === 'banned' ? 'text-green-500' : 'text-red-500'}`}
                             >
                                {player.status === 'banned' ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </GlassCard>
    </motion.div>
  );
}

function TeamManager({ teams, tournaments }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
         <div>
            <span className="text-[#FF4D9D] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Squad Ops</span>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase">TEAM_MODERATION</h1>
         </div>
         <PremiumButton size="sm" variant="outline" className="border-white/10 hover:border-[#00E5FF]/50 text-[10px]">
            EXPEDITION_DUMP <LayoutGrid size={14} className="ml-2" />
         </PremiumButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {teams.map((team) => (
            <GlassCard key={team.id} className="p-8 border-white/5 bg-white/[0.01] group hover:border-[#00E5FF]/20 transition-all">
               <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center p-2">
                     {team.logoUrl ? (
                        <img src={team.logoUrl} className="w-full h-full object-contain" alt="" />
                     ) : (
                        <Rocket size={32} className="text-[#00E5FF]" />
                     )}
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest italic mb-1">Rank_Score</span>
                     <span className="text-xl font-black italic text-[#FFD000]">#1420</span>
                  </div>
               </div>

               <div className="mb-8">
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 line-clamp-1">{team.teamName}</h3>
                  <div className="text-[10px] font-black text-[#9D4EDD] uppercase tracking-widest">
                     {tournaments.find(t => t.id === team.tournamentId)?.gameName || 'UNASSIGNED'}
                  </div>
               </div>

               <div className="flex items-center gap-2 mb-8">
                  <div className="flex -space-x-3">
                     {[1, 2, 3, 4].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white/[0.05] border border-[#0B0618] flex items-center justify-center text-[10px] font-black">
                           {String.fromCharCode(65 + i)}
                        </div>
                     ))}
                  </div>
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">+{team.members.length} Members</span>
               </div>

               <div className="flex gap-2">
                  <button className="flex-1 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                     INSPECT
                  </button>
                  <button className="p-3 rounded-xl border border-white/5 text-gray-600 hover:text-red-500 hover:border-red-500/30 transition-all">
                     <Trash2 size={16} />
                  </button>
               </div>
            </GlassCard>
         ))}
      </div>
    </motion.div>
  );
}

function TournamentController({ tournaments }: any) {
   const [isCreating, setIsCreating] = useState(false);
   const [newTourney, setNewTourney] = useState<Partial<Tournament>>({
      gameName: '',
      prizePool: '',
      status: 'upcoming',
      teamSize: 5,
      entryFee: 'FREE'
   });

   const createTournament = async () => {
      try {
         await addDoc(collection(db, 'tournaments'), {
            ...newTourney,
            startDate: Date.now(),
            registeredTeamsCount: 0,
            bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'
         });
         setIsCreating(false);
      } catch (err) {
         handleFirestoreError(err, OperationType.CREATE, 'tournaments');
      }
   };

   return (
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -20 }}
         className="space-y-8"
      >
         <div className="flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
               <span className="text-[#FFD000] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Event Control</span>
               <h1 className="text-5xl font-black italic tracking-tighter uppercase">TOURNAMENT_ENGINE</h1>
            </div>
            <PremiumButton onClick={() => setIsCreating(true)} size="sm" variant="primary" className="bg-[#FFD000] text-[#0B0618] text-[10px]">
               INITIALIZE_NEW_TOURNAMENT <Plus size={14} className="ml-2" />
            </PremiumButton>
         </div>

         {isCreating && (
            <GlassCard className="p-10 border-[#FFD000]/30 shadow-[0_0_30px_rgba(255,208,0,0.1)] bg-white/[0.01]">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">NEW_TOURNAMENT_PROTOCOL</h3>
                  <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-white"><Trash2 size={20} /></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">GAME_NAME</label>
                     <input 
                        value={newTourney.gameName}
                        onChange={(e) => setNewTourney({...newTourney, gameName: e.target.value})}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-[#FFD000]/50" 
                        placeholder="ENTER_GAME..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">PRIZE_POOL</label>
                     <input 
                        value={newTourney.prizePool}
                        onChange={(e) => setNewTourney({...newTourney, prizePool: e.target.value})}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-[#FFD000]/50" 
                        placeholder="e.g. $50,000"
                     />
                  </div>
               </div>
               <div className="flex justify-end gap-4">
                  <PremiumButton variant="outline" onClick={() => setIsCreating(false)}>ABORT</PremiumButton>
                  <PremiumButton onClick={createTournament} variant="primary" className="bg-[#FFD000] text-[#0B0618]">DEPLOY_PROTOCOL</PremiumButton>
               </div>
            </GlassCard>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tournaments.map((t) => (
               <GlassCard key={t.id} className="p-0 overflow-hidden border-white/5 bg-white/[0.01] flex flex-col md:flex-row h-72 group">
                  <div className="w-full md:w-48 overflow-hidden relative">
                     <img src={t.bannerImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0B0618]" />
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-between">
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black text-[#FFD000] uppercase tracking-widest">{t.status}</span>
                           <code className="text-[8px] text-gray-700 uppercase">ID: {t.id.slice(0, 8)}</code>
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 shadow-sm">{t.gameName}</h3>
                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-2">
                              <Target size={14} className="text-[#00E5FF]" />
                              <span className="text-[10px] font-black uppercase text-gray-400">{t.registeredTeamsCount} Teams</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-[#9D4EDD]" />
                              <span className="text-[10px] font-black uppercase text-gray-400">{new Date(t.startDate).toLocaleDateString()}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <button className="flex-1 p-3 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest hover:border-[#FFD000]/30 transition-all">EDIT</button>
                        <button 
                           onClick={async () => await deleteDoc(doc(db, 'tournaments', t.id))}
                           className="p-3 rounded-xl border border-white/5 text-gray-700 hover:text-red-500 transition-all"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               </GlassCard>
            ))}
         </div>
      </motion.div>
   );
}

function MatchControlCenter({ matches, tournaments }: any) {
   const updateScore = async (matchId: string, team: 'A' | 'B', currentScore: number) => {
      try {
         const updates: any = {};
         if (team === 'A') updates.scoreA = currentScore + 1;
         else updates.scoreB = currentScore + 1;
         await updateDoc(doc(db, 'matches', matchId), updates);
      } catch (err) {
         handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
      }
   };

   const setStatus = async (matchId: string, status: 'upcoming' | 'live' | 'completed') => {
      try {
         await updateDoc(doc(db, 'matches', matchId), { matchStatus: status });
      } catch (err) {
         handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
      }
   };

   return (
      <motion.div 
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0 }}
         exit={{ opacity: 0, x: 20 }}
         className="space-y-8"
      >
         <div className="flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
               <span className="text-[#00FF9D] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Live Operations</span>
               <h1 className="text-5xl font-black italic tracking-tighter uppercase">MATCH_CONTROL_CENTER</h1>
            </div>
            <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{matches.filter(m => m.matchStatus === 'live').length} LIVE_BUFFERS</span>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            {matches.map((match) => (
               <GlassCard key={match.id} className="p-8 border-white/5 bg-white/[0.01] hover:border-[#00FF9D]/20 transition-all">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                     <div className="w-full lg:w-48">
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Scenario_ID</div>
                        <div className="text-xs font-black uppercase tracking-tight text-[#00E5FF] truncate">
                           {tournaments.find(t => t.id === match.tournamentId)?.gameName || 'UNKNOWN_OP'}
                        </div>
                     </div>

                     <div className="flex-1 flex items-center justify-center gap-12">
                        <TeamControl team={match.teamA} score={match.scoreA} onScore={() => updateScore(match.id, 'A', match.scoreA)} />
                        
                        <div className="flex flex-col items-center gap-4">
                           <div className="text-5xl font-black italic tracking-tighter font-mono text-white/20">VS</div>
                           <div className="px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#00FF9D]">
                              {match.matchStatus}
                           </div>
                        </div>

                        <TeamControl team={match.teamB} score={match.scoreB} onScore={() => updateScore(match.id, 'B', match.scoreB)} isReverse />
                     </div>

                     <div className="w-full lg:w-64 flex flex-col gap-3">
                        <button 
                           onClick={() => setStatus(match.id, 'live')}
                           className="w-full py-4 rounded-2xl bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-[10px] font-black uppercase tracking-widest hover:bg-[#00FF9D]/20 transition-all"
                        >
                           INITIALIZE_LIVE
                        </button>
                        <div className="flex gap-3">
                           <button 
                              onClick={() => setStatus(match.id, 'completed')}
                              className="flex-1 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/5"
                           >
                              TERMINATE
                           </button>
                           <button className="p-4 rounded-2xl border border-white/5 text-gray-600 hover:text-[#00E5FF]">
                              <Settings size={18} />
                           </button>
                        </div>
                     </div>
                  </div>
               </GlassCard>
            ))}
         </div>
      </motion.div>
   );
}

function TeamControl({ team, score, onScore, isReverse }: any) {
   return (
      <div className={`flex items-center gap-8 flex-1 ${isReverse ? 'flex-row' : 'flex-row-reverse'} justify-end`}>
         <div className={`text-right ${isReverse ? 'text-left' : 'text-right'}`}>
            <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-1 truncate max-w-[150px]">{team.name}</h4>
            <div className="text-5xl font-black italic tracking-tighter font-mono text-[#00FF9D]">{score}</div>
         </div>
         <div className="relative group">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center p-4">
               {team.logo ? (
                  <img src={team.logo} className="w-full h-full object-contain" alt="" />
               ) : (
                  <Zap size={32} className="text-gray-700" />
               )}
            </div>
            <button 
               onClick={onScore}
               className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-[#00FF9D] text-[#0B0618] flex items-center justify-center shadow-[0_0_20px_#00FF9D] hover:scale-110 transition-transform"
            >
               <Plus size={18} />
            </button>
         </div>
      </div>
   );
}
