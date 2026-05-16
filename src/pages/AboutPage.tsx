import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Sparkles, Globe, Cpu, Users, Linkedin, Github, ExternalLink } from 'lucide-react';
import { GlassCard, PremiumButton } from '../components/ui/PremiumComponents';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { TeamMember } from '../types';

export default function AboutPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'team'), (snapshot) => {
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
      
      // If empty, use some defaults for first-time visibility
      if (members.length === 0) {
        setTeam([
          {
            id: '1',
            name: 'Ridham gupta',
            role: 'Chief Architect',
            bio: 'Pioneer in distributed identity protocols and neural interface design.',
            imageUrl: '2.png',
            linkedinUrl: 'https://www.linkedin.com/in/ridham-gupta-09056a386/',
          },
          {
            id: '2',
            name: 'Pranav Sharma',
            role: 'Hardware Lead',
            bio: 'Specialist in biometric security systems and proximity-based verification.',
            imageUrl: '6.png',
            linkedinUrl: 'https://www.linkedin.com/in/hackwithpranav/',
            
          }, 
          {
            id: '5',
            name: 'Ishika ',
            role: 'Core Systems',
            bio: 'Optimizing high-concurrency event data streams and real-time synchronization.',
            imageUrl: '1.png',
            linkedinUrl: '',
           
          },
          {
            id: '3',
            name: 'Arman Khan',
            role: 'Core Systems',
            bio: 'Optimizing high-concurrency event data streams and real-time synchronization.',
            imageUrl: '3.png',
            linkedinUrl: 'https://www.linkedin.com/in/arman-khan-778874350/',
            
          },
          {
            id: '4',
            name: 'Mohammad Ayan Khan',
            role: 'Core Systems',
            bio: 'Optimizing high-concurrency event data streams and real-time synchronization.',
            imageUrl: '5.png',
            linkedinUrl: 'https://www.linkedin.com/in/mohammad-ayan-khan-40a164333/',
           
          },
          {
            id: '6',
            name: 'KHUSHAL AGARWAL',
            role: 'Core Systems',
            bio: 'Optimizing high-concurrency event data streams and real-time synchronization.',
            imageUrl: '4.png',
            linkedinUrl: 'https://www.linkedin.com/in/khushal-agarwal-172406353/',
           
          },
          {
            id: '7',
            name: 'PRINCE YADAV',
            role: 'Core Systems',
            bio: 'Optimizing high-concurrency event data streams and real-time synchronization.',
            imageUrl: '7.png',
            linkedinUrl: 'https://www.linkedin.com/in/khushal-agarwal-172406353/',
           
          },
          {
            id: '8',
            name: 'AUNPAM SINGH',
            role: 'Core Systems',
            bio: 'Optimizing high-concurrency event data streams and real-time synchronization.',
            imageUrl: '4.png',
            linkedinUrl: 'https://www.linkedin.com/in/khushal-agarwal-172406353/',
           
          }
        ]);
      } else {
        setTeam(members);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'team');
    });

    return () => unsub();
  }, []);

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
        className="space-y-32"
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

        {/* Team Showcase Section */}
        <section>
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
            <div>
              <div className="protocol-label mb-4">Personnel / Collective</div>
              <h2 className="text-display">Meet the Builders.</h2>
            </div>
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
              Built by humans, <span className="text-[#9D4EDD]">powered by precision</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <motion.div 
                key={member.id} 
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <GlassCard className="p-0 overflow-hidden border-white/5 hover:border-[#9D4EDD]/30 transition-all group relative">
                  <div className="h-80 relative overflow-hidden bg-[#1E1642]/50">
                    {(member.imageUrl || (member as any).image) ? (
                      <img 
                        src={member.imageUrl || (member as any).image} 
                        alt={member.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110 relative z-10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white/10 uppercase z-0 pointer-events-none">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1F] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-20" />
                    
                    {/* Social Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-30">
                      {member.linkedinUrl && (
                        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-[#9D4EDD] hover:border-[#9D4EDD] transition-all">
                          <Linkedin size={20} />
                        </a>
                      )}
                      {member.githubUrl && (
                        <a href={member.githubUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-[#9D4EDD] hover:border-[#9D4EDD] transition-all">
                          <Github size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#9D4EDD] mb-2">{member.role}</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-white transition-colors">{member.name}</h3>
                    {member.bio && (
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* Decorative corner element */}
                  <div className="absolute bottom-4 right-4 text-white/5 group-hover:text-[#9D4EDD]/20 transition-colors">
                    <ExternalLink size={16} />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
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
                  <div className="text-[#00E5FF] font-black text-4xl mb-2 italic">00</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Pioneers</div>
               </div>
               <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                  <div className="text-[#9D4EDD] font-black text-4xl mb-2 italic">00</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Deployments</div>
               </div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
