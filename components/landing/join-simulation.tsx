import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Monitor, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/index';
import { Scenario } from '../../types/index';

// --- MOCK DATA ---
const DEFAULT_SCENARIO = {
  id: "sc_123",
  name: "Rate Limiting API",
  companyName: "FinTech Sol",
  companyDescription: "A fast-growing fintech startup modernizing payment processing.",
  taskDescription: "Implement a rate-limiting middleware for our API to prevent abuse. The current implementation allows unlimited requests.",
  techStack: ["TypeScript", "Node.js", "Redis"]
};

// --- TYPES ---
type Step = 1 | 2 | 3 | 4;
type AuthMode = 'signin' | 'signup';

interface JoinSimulationProps {
  onStart: () => void;
  scenario?: Scenario;
}

export function JoinSimulation({ onStart, scenario }: JoinSimulationProps) {
  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<AuthMode>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const activeScenario = {
    ...DEFAULT_SCENARIO,
    ...scenario,
    name: "Backend Assessment" // Scenario type doesn't have name, provide default
  };
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4) as Step);
  
  const handleGoogleAuth = () => {
    setIsLoading(true);
    // Simulation:
    setTimeout(() => {
        setIsLoading(false);
        onStart();
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
    }
    
    setIsLoading(true);
    
    // Simulation:
    setTimeout(() => {
        setIsLoading(false);
        onStart();
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans bg-white overflow-x-hidden">
      
      {/* --- LEFT PANEL --- */}
      <div className="relative w-full lg:w-[60%] bg-[#020617] text-white p-8 lg:p-24 flex flex-col min-h-[50vh] lg:min-h-screen overflow-hidden">
        
        {/* Background Blob */}
        <motion.div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#237CF1] rounded-full blur-[150px] pointer-events-none"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 mb-12 lg:mb-0">
          <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center">
            <span className="text-[#237CF1] font-black text-xl">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight">SkillVee</span>
        </div>

        {/* Main Content (Centered) */}
        <div className="relative z-10 flex-1 flex flex-col justify-center my-8 lg:my-0">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl lg:text-[90px] font-black tracking-tight leading-[0.85] mb-8">
                  YOUR NEXT<br />ROLE.
                </h1>
                <p className="text-xl lg:text-2xl text-slate-400 font-medium max-w-xl leading-relaxed">
                  <span className="text-white">{activeScenario.companyName}</span> is looking for someone to join their team. Experience a day in the role before you commit.
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                 <h1 className="text-5xl lg:text-[90px] font-black tracking-tight leading-[0.85] mb-8 text-[#237CF1]">
                  NOT A<br />TEST.
                </h1>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl lg:text-[90px] font-black tracking-tight leading-[0.85] mb-8">
                  THE CASE.
                </h1>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-2">Assignment</h3>
                    <p className="text-2xl lg:text-3xl font-bold">{activeScenario.name}</p>
                  </div>
                  <div>
                    <h3 className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeScenario.techStack.map(tech => (
                        <span key={tech} className="border border-slate-700 text-white px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                 <h1 className="text-5xl lg:text-[90px] font-black tracking-tight leading-[0.85] mb-8 text-[#237CF1]">
                  READY.<br />GO.
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex gap-6 mt-auto">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-[#237CF1]" />
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">AI Teammates</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#237CF1]" />
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Use Any AI Tools</span>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL --- */}
      <div className="w-full lg:w-[40%] bg-white p-8 lg:p-16 flex flex-col justify-center items-center relative">
        <div className="w-full max-w-sm">
          
          {/* Progress Bar */}
          <div className="flex gap-2 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-500",
                  i <= step ? "bg-[#237CF1]" : "bg-slate-100"
                )} 
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-2">Step 01</span>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome</h2>
                </div>
                
                <p className="text-slate-600 leading-relaxed">
                  You've been invited to try out for the <span className="font-semibold text-slate-900">{activeScenario.companyName}</span> engineering team. This simulator will drop you into a realistic day at work.
                </p>

                <Button 
                  onClick={handleNext}
                  className="w-full h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg flex items-center justify-between px-8 group transition-all"
                >
                  Continue
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-2">Step 02</span>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">The Experience</h2>
                </div>

                <div className="space-y-4">
                  <FeatureCard 
                    icon={<Bot size={20} className="text-[#237CF1]" />}
                    text="Work with AI-powered teammates via Slack. They'll respond just like real colleagues."
                  />
                  <FeatureCard 
                    icon={<Monitor size={20} className="text-[#237CF1]" />}
                    text="Your screen will be recorded. We assess how you work, not just the end result."
                  />
                  <FeatureCard 
                    icon={<Sparkles size={20} className="text-[#237CF1]" />}
                    text="Use any AI tools you want. Copilot, ChatGPT, Claude - whatever helps you work best."
                  />
                </div>

                <Button 
                  onClick={handleNext}
                  className="w-full h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg flex items-center justify-between px-8 group transition-all"
                >
                  Continue
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-2">Step 03</span>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">Your Mission</h2>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                   <p className="text-sm text-slate-600 leading-relaxed mb-4">
                     {activeScenario.taskDescription}
                   </p>
                   <p className="text-sm text-slate-600 leading-relaxed font-medium">
                     Note: The context provided is intentionally incomplete. Part of the assessment is seeing how you gather requirements.
                   </p>
                </div>

                <div className="bg-slate-100 rounded-xl p-4 flex gap-3 items-start">
                   <div className="bg-white p-1.5 rounded-md shadow-sm shrink-0">
                     <Bot size={16} className="text-slate-900" />
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed">
                     <span className="font-bold text-slate-900">Pro Tip:</span> Talk to your teammates! They have critical information you need to solve this.
                   </p>
                </div>

                <Button 
                  onClick={handleNext}
                  className="w-full h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg flex items-center justify-between px-8 group transition-all"
                >
                  Launch Environment
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-2">Step 04</span>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">Final Step</h2>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"/>
                    {error}
                  </div>
                )}

                <button 
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full h-12 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 font-semibold text-slate-700 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="bg-white px-4 text-slate-400 font-medium">or {mode === 'signup' ? 'sign up' : 'sign in'} with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="grid grid-cols-2 gap-4">
                       <Input 
                         placeholder="First name"
                         value={formData.firstName}
                         onChange={e => setFormData({...formData, firstName: e.target.value})}
                         required
                       />
                       <Input 
                         placeholder="Last name"
                         value={formData.lastName}
                         onChange={e => setFormData({...formData, lastName: e.target.value})}
                         required
                       />
                    </div>
                  )}
                  
                  <Input 
                    type="email" 
                    placeholder="Email address" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />

                  <Input 
                    type="password" 
                    placeholder={mode === 'signup' ? "Password (8+ characters)" : "Password"}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                  />

                  {mode === 'signup' && (
                    <Input 
                      type="password" 
                      placeholder="Confirm password" 
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  )}

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-full bg-[#237CF1] hover:bg-[#1b6ad4] text-white font-bold text-lg shadow-xl shadow-[#237CF1]/20 mt-2"
                  >
                    {isLoading ? "Processing..." : (mode === 'signup' ? "Create Account" : "Sign In")}
                  </Button>

                  {mode === 'signup' && (
                    <p className="text-[10px] text-center text-slate-400 px-4">
                      By clicking create account, you consent to screen recording during the assessment session. <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy</a>.
                    </p>
                  )}
                </form>

                <div className="text-center text-sm text-slate-500">
                  {mode === 'signup' ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button 
                    onClick={() => {
                        setMode(mode === 'signup' ? 'signin' : 'signup');
                        setError('');
                    }}
                    className="text-[#237CF1] font-bold hover:underline"
                  >
                    {mode === 'signup' ? "Sign in" : "Sign up"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex gap-4 p-2">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
        {icon}
      </div>
      <p className="text-sm text-slate-600 font-medium leading-relaxed pt-1">
        {text}
      </p>
    </div>
  );
}

// Styled Input Helper
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props}
      className="w-full h-12 px-5 rounded-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#237CF1] focus:ring-2 focus:ring-[#237CF1]/20 outline-none transition-all placeholder:text-slate-400 text-slate-900"
    />
  );
}
