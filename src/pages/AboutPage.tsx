import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Sparkles, Globe, Cpu, Users } from 'lucide-react';
import { GlassCard, PremiumButton } from '../components/ui/PremiumComponents';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-20"
      >
        <section className="text-left w-full">
          <div className="protocol-label">Inception / Origins</div>
          <motion.h1 variants={itemVariants} className="text-huge mb-8">
            The<br />
            <span className="text-white/20 italic">Gathering.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-2xl font-light leading-relaxed mb-10">
            EventPulse is the definitive attendance protocol for high-fidelity technical encounters. We bridge the gap between creators and pioneers using secure digital infrastructure and hardware-grade verification.
          </motion.p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Vault Security", desc: "Your identity is stored in an encrypted vault, ensuring your digital presence is strictly sovereign." },
            { icon: Zap, title: "Sync Check-ins", desc: "Instant QR-based verification that operates at the speed of the network. Zero friction entry." },
            { icon: Globe, title: "Node Access", desc: "A unified portal for elite events across the global network. One identity, infinite access." },
            { icon: Cpu, title: "Smart Pass", desc: "Transparency built into every ticket. Automated sync and secure peer-to-peer transfers." },
            { icon: Users, title: "Expert Hub", desc: "Join a network of verified pioneers in tech, design, and digital architecture." },
            { icon: Sparkles, title: "Elite UI", desc: "An interface designed for precision, prioritizing clarity and high-density performance." }
          ].map((feature, i) => (
            <motion.div key={i} variants={itemVariants}>
              <GlassCard className="h-full border-white/5 hover:border-[#9D4EDD]/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 flex items-center justify-center mb-6 text-[#9D4EDD] group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{feature.title}</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </section>

        <section className="py-20 border-t border-white/5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Ready to join the revolution?</h2>
              <p className="text-gray-400 font-light text-lg mb-8">
                The next cycle of events is about to begin. Secure your digital pass today and step into the future of attendance management.
              </p>
              <Link to="/login">
                <PremiumButton size="lg">Initialize Profile</PremiumButton>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                  <div className="text-[#00E5FF] font-black text-4xl mb-2 italic">12K+</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Pioneers</div>
               </div>
               <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                  <div className="text-[#9D4EDD] font-black text-4xl mb-2 italic">450+</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Deployments</div>
               </div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
