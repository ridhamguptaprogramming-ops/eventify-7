import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { auth } from '../lib/firebase';
import { PremiumButton, GlassCard } from '../components/ui/PremiumComponents';

export default function RegistrationPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#9D4EDD]/30 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="rounded-none border-0 bg-transparent p-0">
          <div className="text-left mb-12">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00E5FF] mb-4">Security Protocol</div>
            <h2 className="text-huge !text-[60px] md:!text-[80px] mb-4">
              {isLogin ? 'Access' : 'Join'}<br />
              <span className="text-white/20 italic">Vault.</span>
            </h2>
          </div>

          {verificationSent ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-left py-8 border-l-2 border-[#9D4EDD] pl-8"
            >
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Verify Identity</h3>
              <p className="text-gray-400 mb-10 font-light leading-relaxed">
                A verification sequence has been sent to {email}. Execute confirmation to continue.
              </p>
              <PremiumButton onClick={() => setVerificationSent(false)} variant="secondary">
                Return to Access
              </PremiumButton>
            </motion.div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div className="relative border-b border-white/10 pb-2">
                  <input
                    type="text"
                    placeholder="FULL NAME"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent py-4 text-sm font-bold uppercase tracking-widest text-white focus:outline-none placeholder:text-white/10"
                  />
                </div>
              )}

              <div className="relative border-b border-white/10 pb-2">
                <input
                  type="email"
                  placeholder="EMAIL_ADDRESS"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent py-4 text-sm font-bold uppercase tracking-widest text-white focus:outline-none placeholder:text-white/10"
                />
              </div>

              <div className="relative border-b border-white/10 pb-2">
                <input
                  type="password"
                  placeholder="SECURE_KEY"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-4 text-sm font-bold uppercase tracking-widest text-white focus:outline-none placeholder:text-white/10"
                />
              </div>

              {error && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{error}</p>
              )}

              <PremiumButton 
                type="submit" 
                size="lg"
                className="w-full mt-8" 
                disabled={loading}
              >
                {loading ? 'CALCULATING...' : (isLogin ? 'EXECUTE LOGIN' : 'CREATE PROFILE')}
              </PremiumButton>

              <div className="mt-6 flex flex-col gap-3">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Digital Proxy Access</span>
                </div>
                <PremiumButton 
                  variant="outline" 
                  size="md" 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full justify-start pl-8"
                >
                  <Chrome size={16} className="mr-4" /> Google Connection
                </PremiumButton>
              </div>

              <div className="text-center mt-10">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
                >
                  {isLogin ? "No profile detected? Initiate Signup" : 'Profile exists? Access Vault'}
                </button>
              </div>
            </form>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
