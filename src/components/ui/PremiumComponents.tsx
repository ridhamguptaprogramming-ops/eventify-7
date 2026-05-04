import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "backdrop-blur-2xl bg-white/[0.08] border border-white/10 rounded-2xl p-6 shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface PremiumButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumButton({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: PremiumButtonProps) {
  const variants = {
    primary: "bg-[#9D4EDD] text-white font-bold uppercase tracking-tighter hover:bg-[#00E5FF] hover:text-black",
    secondary: "bg-[#1E1642] text-white backdrop-blur-md border border-white/10 hover:bg-white/10 uppercase tracking-widest font-bold",
    outline: "border border-[#9D4EDD] text-[#9D4EDD] bg-transparent hover:bg-[#9D4EDD]/10 uppercase tracking-widest font-bold",
    ghost: "text-white/50 hover:text-white hover:bg-white/5 uppercase tracking-widest font-bold",
    premium: "bg-[#FFD166] text-black font-black uppercase tracking-tighter hover:bg-white"
  };

  const sizes = {
    sm: "px-6 py-2 text-[10px]",
    md: "px-8 py-3.5 text-xs",
    lg: "px-10 py-5 text-lg"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center transition-all duration-300",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
