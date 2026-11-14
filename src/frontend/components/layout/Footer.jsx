import React from 'react';
import { Link } from 'react-router-dom';
import { VaniCookLogo } from '../common/VaniCookLogo.jsx';
import { ShieldCheck, Users, Mic, Heart, MapPin, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-forest-deep text-[#F0EBDD] border-t border-[#173D2E] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <VaniCookLogo size="lg" variant="light" showTagline={false} />
            
            <p className="text-sm text-[#F0EBDD]/70 max-w-sm leading-relaxed font-sans">
              One cook. Multiple nearby homes. Shared costs. Better livelihoods.
              Bringing home kitchens and neighbourhood communities together through voice AI.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-leaf">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Independent Cooks</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-leaf">
                <Users className="w-4 h-4" />
                <span>Shared Neighbourhood Pools</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-leaf">
                <Mic className="w-4 h-4" />
                <span>Multilingual Voice AI</span>
              </div>
            </div>
          </div>

          {/* Column 1: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-leaf mb-4 font-sans">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F0EBDD]/75">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#shared-cooking" className="hover:text-white transition-colors">
                  Shared Cooking Pools
                </a>
              </li>
              <li>
                <a href="#voice-ai" className="hover:text-white transition-colors">
                  Vani Voice AI
                </a>
              </li>
              <li>
                <a href="#find-a-cook" className="hover:text-white transition-colors">
                  Find a Cook
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: For Households & Cooks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-leaf mb-4 font-sans">
              For Communities
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F0EBDD]/75">
              <li>
                <Link to="/register?role=CUSTOMER" className="hover:text-white transition-colors">
                  For Households
                </Link>
              </li>
              <li>
                <Link to="/register?role=COOK" className="hover:text-white transition-colors">
                  For Independent Cooks
                </Link>
              </li>
              <li>
                <a href="#pricing-preview" className="hover:text-white transition-colors">
                  Cost Sharing Calculator
                </a>
              </li>
              <li>
                <a href="#safety-trust" className="hover:text-white transition-colors">
                  Cook Verification Standards
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-leaf mb-4 font-sans">
              About & Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F0EBDD]/75">
              <li>
                <a href="#about-mission" className="hover:text-white transition-colors">
                  Our Mission
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Household Privacy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F0EBDD]/50 font-sans">
          <p>
            &copy; {new Date().getFullYear()} VaniCook Inc. All rights reserved. Built for Indian neighbourhoods.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#F0EBDD]/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Gnani AI Voice Online (Hindi, Marathi, Kannada, English)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
