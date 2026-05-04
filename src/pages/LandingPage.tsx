import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Users, Zap, Shield, Rocket } from 'lucide-react';
import { PremiumButton, GlassCard } from '../components/ui/PremiumComponents';

export default function LandingPage() {
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

      {/* Featured Stats */}
      <section className="py-20 px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-10 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl hover:border-[#9D4EDD]/30 transition-colors">
            <span className="text-5xl font-black block mb-2 tracking-tighter text-[#9D4EDD]">18</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-black">Curated_Tracks</span>
          </div>
          
          <div className="p-10 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl hover:border-[#00E5FF]/30 transition-colors">
            <span className="text-5xl font-black block mb-2 tracking-tighter text-[#00E5FF]">24</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-black">Industry_Masters</span>
          </div>

          <div className="p-10 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/[0.01]">
            <p className="text-center text-gray-500 text-[10px] px-6 font-black uppercase tracking-widest leading-relaxed">
              Verify identity to unlock <br/> encrypted portal tools.
            </p>
            <Link to="/login">
              <PremiumButton variant="outline" size="sm">INITIALIZE_SYNC</PremiumButton>
            </Link>
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
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 flex items-center justify-center">
               <div className="w-full h-full rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center gap-6">
                  <div className="w-32 h-32 bg-white rounded-xl p-2">
                     {/* Mock QR Code Pattern */}
                     <div className="w-full h-full bg-black flex flex-col gap-1 p-2">
                        <div className="flex gap-1 h-1/4">
                           <div className="w-1/4 bg-white"></div>
                           <div className="grow bg-white/20"></div>
                        </div>
                        <div className="grow bg-white/20"></div>
                        <div className="flex gap-1 h-1/4">
                           <div className="grow bg-white/20"></div>
                           <div className="w-1/4 bg-white"></div>
                        </div>
                     </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-mono tracking-widest text-[#00E5FF]">#EVP-8829-X</div>
                    <div className="text-xs text-white/30 uppercase tracking-[0.2em]">Verified Attendee</div>
                  </div>
               </div>
               {/* Decorative floating elements */}
               <motion.div 
                 animate={{ y: [0, -20, 0] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="absolute -top-10 -right-10 w-24 h-24 backdrop-blur-md bg-white/10 rounded-full border border-white/20"
               />
               <motion.div 
                 animate={{ y: [0, 20, 0] }}
                 transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                 className="absolute -bottom-10 -left-10 w-32 h-32 backdrop-blur-lg bg-[#9D4EDD]/10 rounded-full border border-white/20"
               />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
