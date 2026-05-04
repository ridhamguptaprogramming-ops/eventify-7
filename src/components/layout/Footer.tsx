import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="px-12 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-[#0F0A1F]">
      <div className="flex flex-wrap gap-12 lg:gap-24">
        <div className="flex flex-col gap-6">
          <div className="protocol-label">Directives</div>
          <div className="flex flex-col gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link to="/events" className="hover:text-[#9D4EDD] transition-colors flex flex-col">
              Calendar
              <span className="text-[7px] text-gray-800">Schedule</span>
            </Link>
            <Link to="/about" className="hover:text-[#9D4EDD] transition-colors flex flex-col">
              Experience
              <span className="text-[7px] text-gray-800">About</span>
            </Link>
            <Link to="/dashboard" className="hover:text-[#9D4EDD] transition-colors flex flex-col">
              My Portal
              <span className="text-[7px] text-gray-800">Account</span>
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="protocol-label">Comms</div>
          <div className="flex flex-col gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span className="flex flex-col">
              support@eventpulse.io
              <span className="text-[7px] text-gray-800">Network_Support</span>
            </span>
            <span className="flex flex-col">
              +1 (888) PULSE-26
              <span className="text-[7px] text-gray-800">Priority_Line</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="protocol-label">Integrity</div>
          <div className="flex flex-col gap-1">
            <span className="text-[#9D4EDD] text-[10px] font-black uppercase tracking-widest">Vault_Active</span>
            <span className="text-[7px] text-gray-800 uppercase font-black">256_BIT_ENCRYPTION</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-start md:items-end gap-4">
        <div className="flex items-center gap-2 group cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
          <Zap size={14} className="text-[#9D4EDD]" />
          <span className="text-xs font-mono tracking-tighter">#EP_SYSTEM26_PRTCL</span>
        </div>
        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          © 2026 EventPulse Engineering. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
