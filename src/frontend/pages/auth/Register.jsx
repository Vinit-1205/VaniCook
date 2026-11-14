import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { locationService } from '../../services/locationService.js';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { VaniCookLogo, VaniCookMark } from '../../components/common/VaniCookLogo.jsx';
import {
  Mail,
  Lock,
  User,
  Phone,
  Building,
  Home,
  Users,
  Utensils,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(
    searchParams.get('role') === 'COOK' ? 'COOK' : 'CUSTOMER'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [societyId, setSocietyId] = useState('');
  const [building, setBuilding] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [societies, setSocieties] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const list = await locationService.getSocieties();
        setSocieties(list);
        if (list.length > 0) {
          setSocietyId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load societies:', err);
      }
    };
    fetchSocieties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await register({
        fullName,
        email,
        password,
        phone,
        role,
        societyId,
        building: role === 'CUSTOMER' ? building : undefined,
        flatNumber: role === 'CUSTOMER' ? flatNumber : undefined,
      });

      if (res.user.role === 'COOK') {
        navigate('/cook/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-3">
        <div className="flex justify-center">
          <VaniCookLogo size="lg" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#252923] tracking-tight">
          Create Your VaniCook Account
        </h1>
        <p className="text-sm text-[#77796F]">
          Join your residential society food-sharing community today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E7E3D9] shadow-premium">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Role Selection Screen */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#77796F] mb-3 text-center sm:text-left">
              I am here to...
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Option A: Customer */}
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  role === 'CUSTOMER'
                    ? 'border-[#173D2E] bg-[#173D2E]/5 shadow-sm ring-1 ring-[#173D2E]'
                    : 'border-[#E7E3D9] bg-white hover:border-[#173D2E]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    role === 'CUSTOMER' ? 'bg-[#173D2E] text-[#A5BE83]' : 'bg-[#F8F5EC] text-[#252923]'
                  }`}>
                    <Utensils className="w-4 h-4" />
                  </div>
                  {role === 'CUSTOMER' && (
                    <CheckCircle2 className="w-5 h-5 text-[#173D2E]" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#252923]">
                  Find a Cook
                </h3>
                <p className="text-xs text-[#77796F] mt-1 leading-snug">
                  For households seeking daily cooking or shared neighbourhood pools
                </p>
              </button>

              {/* Option B: Cook Partner */}
              <button
                type="button"
                onClick={() => setRole('COOK')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  role === 'COOK'
                    ? 'border-[#C47755] bg-[#C47755]/5 shadow-sm ring-1 ring-[#C47755]'
                    : 'border-[#E7E3D9] bg-white hover:border-[#C47755]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    role === 'COOK' ? 'bg-[#C47755] text-white' : 'bg-[#F8F5EC] text-[#252923]'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  {role === 'COOK' && (
                    <CheckCircle2 className="w-5 h-5 text-[#C47755]" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#252923]">
                  Offer Cooking Services
                </h3>
                <p className="text-xs text-[#77796F] mt-1 leading-snug">
                  For independent cooks looking for predictable local earnings
                </p>
              </button>

            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              placeholder="e.g. Priya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Mobile Phone"
                type="tel"
                icon={Phone}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Society Dropdown Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#77796F] mb-1.5">
                Primary Residential Society
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Building className="h-4 w-4 text-[#77796F]" />
                </div>
                <select
                  value={societyId}
                  onChange={(e) => setSocietyId(e.target.value)}
                  className="block w-full rounded-xl border border-[#E7E3D9] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#252923] focus:outline-none focus:ring-2 focus:ring-[#173D2E] focus:border-[#173D2E]"
                  required
                >
                  {societies.map((soc) => (
                    <option key={soc.id} value={soc.id}>
                      {soc.name} — {soc.city} ({soc.locality})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer household specific address fields */}
            {role === 'CUSTOMER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <Input
                  label="Tower / Building"
                  type="text"
                  icon={Building}
                  placeholder="e.g. Tower B"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  required
                />

                <Input
                  label="Flat / Unit Number"
                  type="text"
                  icon={Home}
                  placeholder="e.g. Flat 402"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4 bg-[#173D2E] text-white hover:bg-[#102B21] py-3.5 rounded-2xl shadow-soft font-bold text-sm"
              size="lg"
              isLoading={isLoading}
            >
              {role === 'CUSTOMER' ? 'Register Household Account' : 'Register as Cook Partner'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#77796F]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#173D2E] font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
