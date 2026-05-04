import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, MapPin, Calendar, Clock, Download, RefreshCw, Zap, Shield } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Registration, Event, OperationType } from '../types';
import { GlassCard, PremiumButton } from '../components/ui/PremiumComponents';
import { handleFirestoreError } from '../lib/utils';

interface DetailedRegistration extends Registration {
  event?: Event;
}

export default function DashboardPage() {
  const { user, resendVerification } = useAuth();
  const [registrations, setRegistrations] = useState<DetailedRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchRegistrations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'registrations'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const regs = await Promise.all(querySnapshot.docs.map(async (d) => {
        const regData = { id: d.id, ...d.data() } as Registration;
        const evDoc = await getDoc(doc(db, 'events', regData.eventId));
        return {
          ...regData,
          event: evDoc.exists() ? { id: evDoc.id, ...evDoc.data() } as Event : undefined
        };
      }));
      
      setRegistrations(regs);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  const handleResend = async () => {
    setSendingEmail(true);
    try {
      await resendVerification();
      alert("Verification email sent! Check your inbox.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 px-6 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[#9D4EDD]/30 border-t-[#9D4EDD] rounded-full animate-spin mb-4" />
        <p className="text-white/40">Synchronizing tickets...</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <header className="mb-20">
        <div className="protocol-label">System Access / Root</div>
        <h1 className="text-huge">My<br/><span className="text-white/20 italic">Dashboard.</span></h1>
        <div className="flex flex-wrap gap-12 mt-12">
          <div className="flex flex-col gap-1">
             <span className="text-[8px] font-black uppercase text-gray-500 tracking-[0.2em]">Auth Level</span>
             <span className="text-sm font-mono text-[#00E5FF]">Level_02_Attendee</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[8px] font-black uppercase text-gray-500 tracking-[0.2em]">Active Passes</span>
             <span className="text-sm font-mono text-[#9D4EDD]">{registrations.length} Verified</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[8px] font-black uppercase text-gray-500 tracking-[0.2em]">Encrypted Handshake</span>
             <span className="text-sm font-mono text-[#FFD166]">Active_Secure</span>
          </div>
        </div>
      </header>

      {!user?.emailVerified && (
        <GlassCard className="mb-12 border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-amber-400">Identity Verification Pending</h3>
              <p className="text-white/60 text-sm">Please verify your email address to unlock all features, including QR generation and entry verification.</p>
            </div>
            <PremiumButton 
              variant="outline" 
              size="sm" 
              onClick={handleResend}
              disabled={sendingEmail}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              {sendingEmail ? 'Sending...' : 'Resend Verification Email'}
            </PremiumButton>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {registrations.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Ticket className="mx-auto text-white/10 mb-4" size={64} />
            <h2 className="text-xl font-bold mb-2 text-white/40">No Active Tickets</h2>
            <p className="text-white/30 text-sm">You haven't registered for any events yet. Head over to the events page to start your journey.</p>
          </div>
        ) : (
          registrations.map(reg => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <GlassCard className="p-0 overflow-hidden group">
                <div className="flex flex-col md:flex-row">
                  {/* Left side: Event Info */}
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-[#00E5FF] text-[10px] font-black uppercase tracking-widest">
                       <Zap size={10} className="fill-current" />
                       <span>{reg.status === 'attended' ? 'Access_Complete' : 'Protocol_Active'}</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter group-hover:text-[#9D4EDD] transition-colors leading-none">
                      {reg.event?.title || 'Unknown Event'}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Time_Window</span>
                        <span className="text-xs font-mono">{reg.event?.date}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Access_Point</span>
                        <span className="text-xs font-mono">{reg.event?.venue}</span>
                      </div>
                    </div>
                    <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Pass_Hash: {reg.id.slice(0, 16)}</div>
                      <button className="text-[#9D4EDD] hover:text-[#00E5FF] transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        Download <Download size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Right side: QR Code Section (Ticket Stub) */}
                  <div className="relative bg-white p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-dashed border-black/10 min-w-[180px]">
                     {user?.emailVerified ? (
                        <>
                          <div className="p-1 bg-white ring-1 ring-black/5">
                            <QRCodeSVG 
                              value={reg.id} 
                              size={100} 
                              level="H"
                              includeMargin={false}
                            />
                          </div>
                          <p className="mt-4 text-[10px] font-mono font-bold text-black uppercase tracking-widest">Scan_Entry</p>
                        </>
                     ) : (
                        <div className="text-center p-4">
                           <div className="w-16 h-16 bg-[#FFD166]/10 border border-[#FFD166]/30 rounded-xl flex items-center justify-center mb-2 mx-auto">
                              <Shield className="text-[#FF9E00]" size={24} />
                           </div>
                           <p className="text-[8px] text-gray-500 uppercase font-black leading-tight tracking-widest">Verify_Identity</p>
                        </div>
                     )}
                     {/* Perforation holes */}
                     <div className="hidden md:block absolute top-0 -left-3 w-6 h-6 bg-[#0F0A1F] rounded-full -translate-y-1/2 border border-[#1E1642]" />
                     <div className="hidden md:block absolute bottom-0 -left-3 w-6 h-6 bg-[#0F0A1F] rounded-full translate-y-1/2 border border-[#1E1642]" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-12 flex justify-center">
        <PremiumButton variant="secondary" onClick={fetchRegistrations}>
          <RefreshCw size={18} className="mr-2" /> Sync Data
        </PremiumButton>
      </div>
    </div>
  );
}
