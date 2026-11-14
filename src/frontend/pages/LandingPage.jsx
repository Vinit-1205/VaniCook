import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { VaniCookMark } from '../components/common/VaniCookLogo.jsx';
import { VoiceAssistantModal } from '../components/voice/VoiceAssistantModal.jsx';
import {
  Users,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Clock,
  Heart,
  CheckCircle2,
  Utensils,
  MapPin,
  Mic,
  Star,
  Building,
  Volume2,
  Lock,
  CalendarCheck,
  Check,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [householdCount, setHouseholdCount] = useState(3);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  // Dynamic pricing illustration (strictly labelled as illustrative)
  const rates = {
    1: { perHousehold: 3600, savings: 0, cookEarnings: 3600 },
    2: { perHousehold: 1980, savings: 45, cookEarnings: 3960 },
    3: { perHousehold: 1440, savings: 60, cookEarnings: 4320 },
    4: { perHousehold: 1170, savings: 67, cookEarnings: 4680 },
  };

  const currentRate = rates[householdCount] || rates[3];

  const sampleVoicePrompts = [
    'Find a cook near my apartment.',
    'I need a cook for dinner tomorrow.',
    'Show vegetarian cooks in my society.',
    'What happens if four families share a cook?',
  ];

  return (
    <div className="min-h-screen bg-[#F8F5EC] flex flex-col font-sans selection:bg-[#A5BE83] selection:text-[#173D2E]">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Copy & Clear Primary CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#173D2E]/8 border border-[#173D2E]/15 text-[#173D2E] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#A5BE83] inline-block" />
                <span className="uppercase tracking-widest text-[11px] font-bold">
                  THE FUTURE OF NEIGHBOURHOOD COOKING
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#252923] tracking-tight leading-[1.12]">
                A better way to bring good food home.
              </h1>

              <p className="text-lg sm:text-xl text-[#77796F] max-w-2xl leading-relaxed font-sans">
                Discover trusted local cooks, share their services with nearby households and make everyday cooking more affordable.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => navigate('/customer/dashboard')}
                  icon={ArrowRight}
                  className="bg-[#173D2E] text-[#F8F5EC] hover:bg-[#102B21] px-7 py-4 text-base rounded-2xl shadow-premium"
                >
                  Find Your Cook
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById('shared-cooking');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-[#E7E3D9] text-[#252923] hover:border-[#173D2E] hover:bg-white/60 px-7 py-4 text-base rounded-2xl"
                >
                  Explore Shared Cooking
                </Button>
              </div>

              {/* Small Trust Message */}
              <div className="pt-4 flex items-center gap-3 text-xs text-[#77796F]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C47755]" />
                <p className="font-medium tracking-wide">
                  Built for neighbourhoods. Designed for everyday life.
                </p>
              </div>
            </div>

            {/* Right Column: Warm Indian Culinary Photography & Cooking Circle Overlay */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Editorial Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-stone-200">
                  <img
                    src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80"
                    alt="Authentic Indian Home Cooking"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102B21]/60 via-transparent to-transparent" />
                  
                  {/* Subtle caption */}
                  <div className="absolute bottom-5 left-5 right-5 text-white text-xs">
                    <p className="font-serif text-base italic text-white">Fresh phulkas, dal tadka & seasonal sabzi</p>
                    <p className="text-white/80 text-[11px] font-sans">Prepared with care in your society tower</p>
                  </div>
                </div>

                {/* Neighbourhood Circle Floating Overlay */}
                <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-premium border border-[#E7E3D9] max-w-xs transition-transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5BE83] bg-[#173D2E] px-2.5 py-1 rounded-md">
                      Shared Circle
                    </span>
                    <span className="text-xs text-[#173D2E] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#A5BE83]" /> Verified
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#252923] leading-snug">
                    Your neighbourhood cooking circle
                  </p>
                  
                  <div className="mt-2 space-y-1 text-[11px] text-[#77796F]">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#173D2E]" />
                      <span><strong>3 households</strong> connected (Tower B)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5 text-[#C47755]" />
                      <span><strong>1 verified cook</strong> (Sunita Devi)</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E7E3D9] flex items-center justify-between text-xs">
                    <span className="text-[#77796F]">Shared monthly</span>
                    <span className="font-serif font-bold text-[#173D2E] text-sm">₹1,440 <span className="text-[10px] text-[#77796F] font-sans font-normal">/home</span></span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-y border-[#E7E3D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#173D2E] bg-[#173D2E]/8 px-3 py-1 rounded-full">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#252923] mt-4 tracking-tight">
              How VaniCook works for your home
            </h2>
            <p className="text-sm sm:text-base text-[#77796F] mt-3">
              Bringing independent neighbourhood cooks and residential societies together with zero friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <div className="p-8 rounded-3xl bg-[#F8F5EC] border border-[#E7E3D9] flex flex-col justify-between hover:shadow-soft transition-all">
              <div>
                <span className="font-serif text-3xl font-bold text-[#173D2E]">01</span>
                <h3 className="text-xl font-serif text-[#252923] mt-4 font-bold">
                  Discover
                </h3>
                <p className="text-sm text-[#77796F] mt-2 leading-relaxed">
                  Find professional independent cooks working near your home or already serving your residential society.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E7E3D9] flex items-center gap-2 text-xs font-semibold text-[#173D2E]">
                <MapPin className="w-4 h-4 text-[#C47755]" />
                <span>Society-specific verified cooks</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-8 rounded-3xl bg-[#F8F5EC] border border-[#E7E3D9] flex flex-col justify-between hover:shadow-soft transition-all">
              <div>
                <span className="font-serif text-3xl font-bold text-[#173D2E]">02</span>
                <h3 className="text-xl font-serif text-[#252923] mt-4 font-bold">
                  Connect
                </h3>
                <p className="text-sm text-[#77796F] mt-2 leading-relaxed">
                  Join nearby households in your apartment block with compatible cooking timings and meal preferences.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E7E3D9] flex items-center gap-2 text-xs font-semibold text-[#173D2E]">
                <Users className="w-4 h-4 text-[#A5BE83]" />
                <span>Safe household privacy preserved</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-8 rounded-3xl bg-[#F8F5EC] border border-[#E7E3D9] flex flex-col justify-between hover:shadow-soft transition-all">
              <div>
                <span className="font-serif text-3xl font-bold text-[#173D2E]">03</span>
                <h3 className="text-xl font-serif text-[#252923] mt-4 font-bold">
                  Share
                </h3>
                <p className="text-sm text-[#77796F] mt-2 leading-relaxed">
                  Share cooking services sequentially and split the agreed cost. Everyone enjoys hot meals, cook earns better.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E7E3D9] flex items-center gap-2 text-xs font-semibold text-[#173D2E]">
                <TrendingDown className="w-4 h-4 text-[#173D2E]" />
                <span>Up to 60% lower monthly expense</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHARED COOKING HIGHLIGHT (Differentiator) */}
      <section id="shared-cooking" className="py-20 bg-[#F0EBDD]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C47755] bg-[#C47755]/10 px-3 py-1 rounded-full">
                The VaniCook Innovation
              </span>

              <h2 className="text-3xl sm:text-4xl font-serif text-[#252923] tracking-tight">
                Why hire alone when your neighbourhood can share?
              </h2>

              <p className="text-base text-[#77796F] leading-relaxed">
                When neighbouring families in the same wing coordinate their cooking schedule, one professional cook visits each home sequentially.
              </p>

              {/* Sequential Flow Formula Visual */}
              <div className="p-5 rounded-2xl bg-white border border-[#E7E3D9] shadow-soft space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#252923]">
                  <span className="flex items-center gap-1.5 text-[#173D2E]">
                    <Building className="w-4 h-4 text-[#A5BE83]" /> Home A + Home B + Home C
                  </span>
                  <span>&rarr;</span>
                  <span className="text-[#C47755]">One Dedicated Cook</span>
                  <span>&rarr;</span>
                  <span className="text-[#102B21]">Coordinated Schedule</span>
                </div>
                <p className="text-[11px] text-[#77796F] leading-normal">
                  <strong>Sequential Visits:</strong> The cook prepares meals in one home, then moves next door according to the agreed morning or evening schedule.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={() => navigate('/customer/pools')}
                  icon={ArrowRight}
                  className="bg-[#173D2E] text-white hover:bg-[#102B21]"
                >
                  Join a Neighbourhood Pool
                </Button>
              </div>
            </div>

            {/* Right Interactive Cost Sharing Simulation */}
            <div className="lg:col-span-6">
              <div className="bg-white p-8 rounded-3xl border border-[#E7E3D9] shadow-premium">
                <div className="flex items-center justify-between pb-6 border-b border-[#E7E3D9]">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#252923]">
                      Illustrative Cost Sharing
                    </h3>
                    <p className="text-xs text-[#77796F]">
                      Select number of participating homes in your building
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#77796F] bg-[#F8F5EC] border border-[#E7E3D9] px-2.5 py-1 rounded-md">
                    *Sample estimate
                  </span>
                </div>

                {/* Household buttons */}
                <div className="grid grid-cols-4 gap-2.5 my-6">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setHouseholdCount(num)}
                      className={`py-3 px-2 rounded-xl text-center transition-all ${
                        householdCount === num
                          ? 'bg-[#173D2E] text-white shadow-soft font-bold'
                          : 'bg-[#F8F5EC] text-[#252923] hover:bg-[#EFECE3] border border-[#E7E3D9]'
                      }`}
                    >
                      <span className="block text-lg font-serif">{num}</span>
                      <span className="block text-[10px] uppercase font-sans mt-0.5">
                        {num === 1 ? 'Solo' : `${num} Homes`}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Calculation outcome */}
                <div className="p-6 rounded-2xl bg-[#F8F5EC] border border-[#E7E3D9] space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#77796F]">
                        Your household pays per month
                      </p>
                      <p className="text-3xl font-serif font-bold text-[#173D2E] mt-0.5">
                        ₹{currentRate.perHousehold.toLocaleString('en-IN')}
                      </p>
                    </div>
                    {currentRate.savings > 0 && (
                      <span className="bg-[#A5BE83]/30 text-[#173D2E] text-xs font-extrabold px-3 py-1 rounded-full border border-[#A5BE83]">
                        Save {currentRate.savings}%
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E7E3D9] flex items-center justify-between text-xs text-[#77796F]">
                    <span>Cook's monthly earnings from circle:</span>
                    <span className="font-bold text-[#252923]">
                      ₹{currentRate.cookEarnings.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-[#77796F] mt-4 italic text-center">
                  *Illustrative monthly pricing based on 2 meals daily. Actual fees determined by society location, meal selections, and cook agreement.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SIGNATURE VOICE AI HIGHLIGHT (Vani AI) */}
      <section id="voice-ai" className="py-20 bg-[#173D2E] text-white relative overflow-hidden">
        {/* Subtle decorative radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#A5BE83]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Headline & Concept */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#A5BE83] text-xs font-bold">
                <Mic className="w-3.5 h-3.5" />
                <span>POWERED BY GNANI PRISMA STT & TIMBRE TTS</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight">
                Just speak. Vani understands.
              </h2>

              <p className="text-base sm:text-lg text-[#F0EBDD]/80 leading-relaxed">
                Search for cooks, explore shared bookings and manage cooking requests using natural voice commands in supported Indian languages.
              </p>

              <div className="space-y-3 pt-2">
                <p className="text-xs uppercase tracking-wider text-[#A5BE83] font-bold">
                  Try speaking naturally:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sampleVoicePrompts.map((phrase, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F0EBDD]/90 flex items-center gap-2 hover:bg-white/10 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#A5BE83] shrink-0" />
                      <span className="italic">"{phrase}"</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => setVoiceModalOpen(true)}
                  className="inline-flex items-center gap-2.5 bg-[#A5BE83] hover:bg-[#BCD39F] text-[#102B21] font-bold px-6 py-3.5 rounded-2xl shadow-premium transition-all duration-200"
                >
                  <Mic className="w-5 h-5 text-[#173D2E]" />
                  <span>Meet Vani Voice</span>
                </button>
                <span className="text-xs text-[#F0EBDD]/60">
                  Hindi &bull; Marathi &bull; Kannada &bull; English
                </span>
              </div>
            </div>

            {/* Right: Animated Microphone & Soundwave Visual */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                {/* Concentric soundwaves */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.05, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full border-2 border-[#A5BE83]"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="absolute inset-8 rounded-full border-2 border-[#C47755]"
                />
                
                {/* Central Microphone Orb */}
                <button
                  onClick={() => setVoiceModalOpen(true)}
                  className="w-36 h-36 rounded-full bg-[#102B21] border-4 border-[#A5BE83] flex flex-col items-center justify-center text-[#A5BE83] shadow-2xl hover:scale-105 transition-transform group cursor-pointer"
                  title="Click to activate voice assistant"
                >
                  <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-white mt-2">
                    Tap to Speak
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. BENEFITS SECTION (Balanced Editorial for Households & Cooks) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#173D2E] bg-[#173D2E]/8 px-3 py-1 rounded-full">
              Shared Value
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#252923] mt-4 tracking-tight">
              Designed for households. Empowering for cooks.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* For Households */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#F8F5EC] border border-[#E7E3D9] space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#173D2E] text-[#A5BE83] flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif text-[#252923] font-bold">
                For Households
              </h3>
              <ul className="space-y-4 text-sm text-[#77796F]">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#173D2E] shrink-0 mt-0.5" />
                  <span><strong>Affordable cooking services:</strong> Split the monthly cost with trusted building neighbours.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#173D2E] shrink-0 mt-0.5" />
                  <span><strong>Trusted nearby cooks:</strong> Background-verified local cooks already operating in your area.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#173D2E] shrink-0 mt-0.5" />
                  <span><strong>Flexible schedules:</strong> Choose daily breakfast, lunch, or dinner cooking arrangements.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#173D2E] shrink-0 mt-0.5" />
                  <span><strong>Shared booking opportunities:</strong> Join existing neighbourhood pools with one tap.</span>
                </li>
              </ul>
            </div>

            {/* For Cooks */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#F8F5EC] border border-[#E7E3D9] space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#C47755] text-white flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif text-[#252923] font-bold">
                For Independent Cooks
              </h3>
              <ul className="space-y-4 text-sm text-[#77796F]">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#C47755] shrink-0 mt-0.5" />
                  <span><strong>More nearby customers:</strong> Work in clustered apartments instead of travelling across town.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#C47755] shrink-0 mt-0.5" />
                  <span><strong>Better earning opportunities:</strong> Clustered visits yield predictable, higher monthly earnings.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#C47755] shrink-0 mt-0.5" />
                  <span><strong>Less time searching for work:</strong> Verified profiles receive direct group requests.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#C47755] shrink-0 mt-0.5" />
                  <span><strong>Simplified booking management:</strong> Sequential schedule and voice support in native language.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & VERIFICATION SECTION */}
      <section className="py-16 bg-[#F8F5EC] border-t border-[#E7E3D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="p-4">
              <ShieldCheck className="w-6 h-6 text-[#173D2E] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#252923]">Cook Verification</p>
              <p className="text-[11px] text-[#77796F] mt-0.5">Government ID & address checked</p>
            </div>
            <div className="p-4">
              <TrendingDown className="w-6 h-6 text-[#173D2E] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#252923]">Transparent Pricing</p>
              <p className="text-[11px] text-[#77796F] mt-0.5">Agreed rates with no hidden fees</p>
            </div>
            <div className="p-4">
              <Lock className="w-6 h-6 text-[#173D2E] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#252923]">Household Privacy</p>
              <p className="text-[11px] text-[#77796F] mt-0.5">Exact flat numbers kept safe</p>
            </div>
            <div className="p-4">
              <CalendarCheck className="w-6 h-6 text-[#173D2E] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#252923]">Booking Confirmations</p>
              <p className="text-[11px] text-[#77796F] mt-0.5">Sequential schedule agreements</p>
            </div>
            <div className="p-4 col-span-2 md:col-span-1">
              <Star className="w-6 h-6 text-[#C47755] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#252923]">Customer Reviews</p>
              <p className="text-[11px] text-[#77796F] mt-0.5">Real verified neighbour feedback</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <Footer />

      {/* Integrated Vani Voice Modal */}
      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
