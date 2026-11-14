import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { VaniCookLogo, VaniCookMark } from '../../components/common/VaniCookLogo.jsx';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, Users } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login({ email, password });
      const user = res.user;

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'COOK') {
        navigate('/cook/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Autofill Helper
  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8F5EC] flex flex-col lg:flex-row font-sans">
      
      {/* Left Split-Screen: Warm Lifestyle Photography & Brand Identity */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#102B21] text-white overflow-hidden flex-col justify-between p-12 lg:p-16">
        {/* Background Image with Warm Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80"
            alt="Warm culinary dining in Indian home"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102B21] via-[#102B21]/60 to-transparent" />
        </div>

        {/* Top Branding */}
        <div className="relative z-10">
          <VaniCookLogo size="lg" variant="light" showTagline={false} />
        </div>

        {/* Bottom Editorial Narrative */}
        <div className="relative z-10 space-y-5 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#A5BE83] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#A5BE83]" />
            <span>Voice-First Neighbourhood Cooking</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-serif text-white leading-tight">
            "Your Neighbourhood. Your Cook. Your Voice."
          </h2>

          <p className="text-sm text-[#F0EBDD]/80 leading-relaxed font-sans">
            Connect with neighbouring families, coordinate sequential cooking visits, and enjoy wholesome Indian meals every single day.
          </p>

          <div className="pt-4 border-t border-white/10 flex items-center gap-6 text-xs text-[#F0EBDD]/70">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#A5BE83]" />
              <span>Verified Cooks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#A5BE83]" />
              <span>Shared Living</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Split-Screen: Clean Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Mobile Brand Link */}
          <div className="lg:hidden">
            <VaniCookLogo size="md" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252923] tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-[#77796F] mt-1.5">
              Sign in to manage your household meals, cooking pools or cook schedule.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end mt-1.5">
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link has been dispatched to your email address.');
                  }}
                  className="text-xs text-[#173D2E] hover:underline font-semibold"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 bg-[#173D2E] text-white hover:bg-[#102B21] py-3 rounded-xl shadow-soft font-semibold text-sm"
              size="lg"
              isLoading={isLoading}
            >
              Sign In to VaniCook
            </Button>
          </form>

          {/* Quick Demo Autofill Helper */}
          <div className="pt-6 border-t border-[#E7E3D9] space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#77796F] text-center">
              Quick One-Click Demo Access
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() =>
                  fillDemoAccount('priya.sharma@example.com', 'Customer#123')
                }
                className="w-full py-2.5 px-3.5 text-xs bg-white hover:bg-[#F0EBDD] border border-[#E7E3D9] rounded-xl text-[#252923] flex items-center justify-between transition-colors shadow-card"
              >
                <span>👤 <strong>Customer:</strong> Priya Sharma (Prestige Tower)</span>
                <span className="text-[10px] text-[#173D2E] font-bold bg-[#173D2E]/10 px-2 py-0.5 rounded">Autofill</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  fillDemoAccount('sunita.devi@cookconnect.in', 'CookPass#123')
                }
                className="w-full py-2.5 px-3.5 text-xs bg-white hover:bg-[#F0EBDD] border border-[#E7E3D9] rounded-xl text-[#252923] flex items-center justify-between transition-colors shadow-card"
              >
                <span>🍳 <strong>Cook:</strong> Sunita Devi (Verified Partner)</span>
                <span className="text-[10px] text-[#173D2E] font-bold bg-[#173D2E]/10 px-2 py-0.5 rounded">Autofill</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  fillDemoAccount('admin@cookconnect.in', 'CookAdmin#2026')
                }
                className="w-full py-2.5 px-3.5 text-xs bg-white hover:bg-[#F0EBDD] border border-[#E7E3D9] rounded-xl text-[#252923] flex items-center justify-between transition-colors shadow-card"
              >
                <span>🛡️ <strong>Admin:</strong> System Administrator</span>
                <span className="text-[10px] text-[#173D2E] font-bold bg-[#173D2E]/10 px-2 py-0.5 rounded">Autofill</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[#77796F]">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="text-[#173D2E] font-bold hover:underline"
            >
              Register here
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
