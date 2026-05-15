import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { PremiumButton } from '../ui/PremiumComponents';
import { UserRole } from '../../types';

export function Navbar() {
  const { user, profile } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/events', label: 'Calendar', sub: 'Schedule' },
    { path: '/highlights', label: 'Highlights', sub: 'Archive' },
    { path: '/gaming', label: 'Gaming', sub: 'Arena' },
    { path: '/about', label: 'Experience', sub: 'About' },
  ];

  if (user) {
    navLinks.push({ path: '/dashboard', label: 'My Portal', sub: 'Hub' });
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0F0A1F]/50 backdrop-blur-md border-b border-white/5"
    >
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 bg-[#9D4EDD] flex items-center justify-center rounded-lg group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(157,78,221,0.4)]">
          <Zap className="text-white fill-current" size={16} />
        </div>
        <span className="text-lg font-black tracking-tighter uppercase tracking-[-0.05em]">Event.Pulse</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
        {navLinks.map(link => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`transition-all relative group flex flex-col items-center ${
              location.pathname === link.path ? 'text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {link.label}
            <span className="text-[7px] text-gray-700 group-hover:text-[#9D4EDD] transition-colors">{link.sub}</span>
            {location.pathname === link.path && (
              <motion.div 
                layoutId="nav-underline"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#9D4EDD]" 
              />
            )}
          </Link>
        ))}
        <div className="flex items-center gap-4">
          {profile?.role === UserRole.ADMIN && (
            <Link to="/admin" className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-400 flex items-center gap-2 hover:bg-white/10 transition-colors">
              CORE_HUB
            </Link>
          )}
          {(profile?.role === UserRole.ADMIN || profile?.role === UserRole.MODERATOR) && (
            <Link to="/gaming/admin" className="px-4 py-1.5 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-full text-[#00E5FF] flex items-center gap-2 hover:bg-[#00E5FF]/20 transition-colors">
              <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-pulse" />
              CMD_TERMINAL
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <PremiumButton 
            variant="ghost" 
            size="sm"
            onClick={() => auth.signOut()}
            className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em]"
          >
            <LogOut size={12} /> EXIT_SESSION
          </PremiumButton>
        ) : (
          <Link to="/login">
            <PremiumButton size="sm" variant="primary">ACCESS_PORTAL</PremiumButton>
          </Link>
        )}
      </div>
    </motion.nav>
  );
}
