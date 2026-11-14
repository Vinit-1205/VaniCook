import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { cookService } from '../../services/cookService.js';
import { locationService } from '../../services/locationService.js';
import { bookingService } from '../../services/bookingService.js';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { CookDetailsModal } from './CookDetailsModal.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Input } from '../../components/common/Input.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  Users,
  Building,
  Calendar,
  Utensils,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [cooks, setCooks] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState(
    user?.householdLocations?.[0]?.societyId || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Active bookings & pool preview
  const [myBookings, setMyBookings] = useState([]);
  const [poolPreview, setPoolPreview] = useState(null);

  // Modal State
  const [selectedCook, setSelectedCook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch initial societies list
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const socList = await locationService.getSocieties();
        setSocieties(socList);
        if (!selectedSocietyId && socList.length > 0) {
          setSelectedSocietyId(socList[0].id);
        }
      } catch (err) {
        console.error('Failed to load societies:', err);
      }
    };
    fetchSocieties();
  }, []);

  // Fetch cooks whenever filters or society change
  useEffect(() => {
    const fetchCooks = async () => {
      setIsLoading(true);
      try {
        const params = {
          societyId: selectedSocietyId || undefined,
          search: debouncedSearch || undefined,
          cuisine: selectedCuisine || undefined,
          diet: selectedDiet || undefined,
          minRating: minRating || undefined,
          maxPrice: maxPrice || undefined,
          mealType: selectedMealType || undefined,
        };
        const data = await cookService.discoverCooks(params);
        setCooks(data.cooks);
      } catch (err) {
        console.error('Failed to discover cooks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCooks();
  }, [
    selectedSocietyId,
    debouncedSearch,
    selectedCuisine,
    selectedDiet,
    minRating,
    maxPrice,
    selectedMealType,
  ]);

  // Fetch customer bookings and pool preview
  const loadCustomerData = async () => {
    try {
      const [bookings, pool] = await Promise.all([
        bookingService.getCustomerBookings(),
        selectedSocietyId
          ? cookService.getNeighbourhoodPoolPreview(selectedSocietyId)
          : null,
      ]);
      setMyBookings(bookings || []);
      setPoolPreview(pool);
    } catch (err) {
      console.error('Error fetching customer data:', err);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [selectedSocietyId]);

  const currentSociety = societies.find((s) => s.id === selectedSocietyId);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout
      title={`${getGreeting()}, ${user?.fullName?.split(' ')[0] || 'Friend'}`}
      subtitle="Let's make cooking easier today."
    >
      <div className="space-y-8 font-sans">
        
        {/* Quick Action Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                const el = document.getElementById('discover-cooks-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              icon={Search}
              className="bg-[#173D2E] text-white hover:bg-[#102B21] rounded-2xl px-5 py-2.5 shadow-soft"
            >
              Find a Cook
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/customer/pools')}
              icon={Users}
              className="border-[#E7E3D9] text-[#252923] hover:border-[#173D2E] rounded-2xl bg-white px-5 py-2.5"
            >
              Explore Shared Cooking
            </Button>
          </div>

          {/* Linked Society Quick Display */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-[#E7E3D9] shadow-card text-xs">
            <Building className="w-4 h-4 text-[#173D2E]" />
            <select
              value={selectedSocietyId}
              onChange={(e) => setSelectedSocietyId(e.target.value)}
              className="font-bold text-[#252923] bg-transparent border-none outline-none cursor-pointer p-0 text-xs focus:ring-0"
            >
              {societies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.locality})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Top Summary Cards: Community & Active Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Society Card */}
          <Card className="lg:col-span-2 flex flex-col justify-between p-6 bg-white border border-[#E7E3D9] shadow-soft rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#77796F]">
                  Your Residential Society
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#252923] mt-1">
                  {currentSociety?.name || 'Prestige Shantiniketan'}
                </h3>
                <p className="text-xs text-[#77796F] mt-0.5">
                  {currentSociety?.locality}, {currentSociety?.city}
                </p>
              </div>

              {/* Tower / Flat indicator */}
              <div className="bg-[#F8F5EC] rounded-2xl p-3.5 border border-[#E7E3D9] text-left sm:text-right">
                <span className="text-[10px] text-[#77796F] block uppercase font-bold tracking-wider">
                  Linked Flat
                </span>
                <span className="text-sm font-bold text-[#252923]">
                  {user?.householdLocations?.[0]?.building || 'Tower B'} &bull; Flat{' '}
                  {user?.householdLocations?.[0]?.flatNumber || '402'}
                </span>
              </div>
            </div>

            {/* Quick pool benefit tip */}
            <div className="mt-6 pt-4 border-t border-[#E7E3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#77796F]">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-[#173D2E]" />
                Sharing a cook with floor neighbours saves up to <strong>60% monthly</strong>.
              </span>
              <span className="font-bold text-[#173D2E] bg-[#173D2E]/8 px-2.5 py-1 rounded-full w-fit">
                {cooks.length} Verified Cooks Serving
              </span>
            </div>
          </Card>

          {/* Active Bookings Summary Card */}
          <Card className="flex flex-col justify-between p-6 bg-[#173D2E] text-white border border-[#102B21] shadow-soft rounded-3xl">
            <div>
              <span className="text-[11px] font-bold text-[#A5BE83] uppercase tracking-wider block">
                Upcoming Schedule
              </span>
              <h3 className="text-xl font-serif font-bold text-white mt-1.5">
                {myBookings.length > 0 ? `${myBookings.length} Active Booking(s)` : 'No Active Booking'}
              </h3>
              <p className="text-xs text-[#F0EBDD]/80 mt-1.5 leading-relaxed">
                {myBookings.length > 0
                  ? `Daily meals by ${myBookings[0].cookProfile?.user?.fullName} (${formatMealType(myBookings[0].mealType)})`
                  : 'You have no active cooking service. Browse verified neighbourhood cooks below to get started.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#F0EBDD]/70">
                {myBookings[0]?.sharedRatio < 1.0 ? 'Pool: Shared Rate' : 'Individual Rate'}
              </span>
              {myBookings.length > 0 ? (
                <span className="font-bold text-[#A5BE83] font-serif text-sm">
                  {formatCurrency(myBookings[0].monthlyRate)}/mo
                </span>
              ) : (
                <button
                  onClick={() => navigate('/customer/pools')}
                  className="text-xs text-[#A5BE83] hover:underline font-semibold flex items-center gap-1"
                >
                  Join a Pool &rarr;
                </button>
              )}
            </div>
          </Card>
        </div>

        {/* Cook Discovery Section */}
        <div id="discover-cooks-section" className="space-y-6 pt-2">
          
          {/* Header & Filter Card */}
          <Card className="p-5 sm:p-6 bg-white border border-[#E7E3D9] shadow-soft rounded-3xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#252923]">
                  Find a Cook in {currentSociety?.name || 'Your Society'}
                </h3>
                <p className="text-xs text-[#77796F] mt-0.5">
                  Showing {cooks.length} verified culinary professionals serving your residential area
                </p>
              </div>

              {(selectedCuisine || selectedDiet || selectedMealType || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCuisine('');
                    setSelectedDiet('');
                    setSelectedMealType('');
                  }}
                  className="text-xs text-[#173D2E] hover:underline font-semibold"
                >
                  Reset all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search by cook name, dish, specialty..."
                  icon={Search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Cuisine Filter */}
              <div>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full h-[42px] rounded-xl border border-[#E7E3D9] bg-white px-3 text-xs text-[#252923] focus:border-[#173D2E] focus:outline-none"
                >
                  <option value="">All Cuisines</option>
                  <option value="North Indian">North Indian</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Maharashtrian">Maharashtrian</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Punjabi">Punjabi</option>
                </select>
              </div>

              {/* Diet Filter */}
              <div>
                <select
                  value={selectedDiet}
                  onChange={(e) => setSelectedDiet(e.target.value)}
                  className="w-full h-[42px] rounded-xl border border-[#E7E3D9] bg-white px-3 text-xs text-[#252923] focus:border-[#173D2E] focus:outline-none"
                >
                  <option value="">All Dietary Types</option>
                  <option value="Pure Vegetarian">Pure Vegetarian</option>
                  <option value="Jain Friendly">Jain Friendly</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                </select>
              </div>

              {/* Meal Slot Filter */}
              <div>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full h-[42px] rounded-xl border border-[#E7E3D9] bg-white px-3 text-xs text-[#252923] focus:border-[#173D2E] focus:outline-none"
                >
                  <option value="">All Meal Slots</option>
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Cooks Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-6 h-72 animate-pulse space-y-4 border border-[#E7E3D9]">
                  <div className="w-16 h-16 bg-stone-200 rounded-2xl" />
                  <div className="h-4 bg-stone-200 rounded w-1/2" />
                  <div className="h-3 bg-stone-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : cooks.length === 0 ? (
            <Card className="text-center py-16 bg-white border border-[#E7E3D9] rounded-3xl space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#F8F5EC] mx-auto flex items-center justify-center text-[#77796F]">
                <Utensils className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#252923]">
                No cooks found matching criteria
              </h4>
              <p className="text-xs text-[#77796F] max-w-sm mx-auto">
                Try clearing your cuisine or diet filters to see all available cooks serving your society.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cooks.map((cook) => {
                const baseMonthly = cook.basePriceMonthly;
                const poolMonthly = Math.round(baseMonthly * 0.55);

                return (
                  <Card
                    key={cook.id}
                    hoverEffect
                    className="flex flex-col justify-between p-6 space-y-5 bg-white border border-[#E7E3D9] rounded-3xl shadow-card"
                  >
                    <div>
                      {/* Card Header: Avatar & Rating */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              cook.user?.avatarUrl ||
                              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={cook.user?.fullName}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#A5BE83] shrink-0"
                          />
                          <div>
                            <h4 className="font-serif font-bold text-lg text-[#252923]">
                              {cook.user?.fullName}
                            </h4>
                            <p className="text-xs text-[#77796F]">
                              {cook.experienceYears} Years Experience
                            </p>
                            <div className="flex items-center gap-1 text-xs text-amber-700 font-bold mt-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{cook.rating || '4.9'}</span>
                              <span className="text-[11px] text-[#77796F] font-normal">
                                ({cook.totalReviews || 12} reviews)
                              </span>
                            </div>
                          </div>
                        </div>

                        {cook.isVerified && (
                          <Badge variant="forest" size="xs">
                            <ShieldCheck className="w-3 h-3 text-[#173D2E]" /> Verified
                          </Badge>
                        )}
                      </div>

                      {/* Bio snippet */}
                      <p className="mt-4 text-xs text-[#77796F] line-clamp-2 leading-relaxed">
                        {cook.bio || 'Experienced home cook specializing in wholesome family meals.'}
                      </p>

                      {/* Cuisines & Diet Tags */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {cook.cuisines?.slice(0, 3).map((cuisine, idx) => (
                          <Badge key={idx} variant="default" size="xs">
                            {cuisine}
                          </Badge>
                        ))}
                        {cook.dietaryPreferences?.includes('Pure Vegetarian') && (
                          <Badge variant="fresh" size="xs">
                            Pure Veg
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Pricing Box & CTA */}
                    <div className="pt-4 border-t border-[#E7E3D9] space-y-3">
                      <div className="flex items-center justify-between p-3.5 bg-[#F8F5EC] rounded-2xl border border-[#E7E3D9]">
                        <div>
                          <span className="text-[10px] text-[#77796F] uppercase block font-bold tracking-wider">
                            Shared Pool Rate
                          </span>
                          <span className="text-lg font-serif font-bold text-[#173D2E]">
                            {formatCurrency(poolMonthly)}
                            <span className="text-xs font-normal text-[#77796F] font-sans">/mo</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] bg-[#A5BE83]/30 text-[#173D2E] font-extrabold px-2 py-0.5 rounded-full border border-[#A5BE83]/40">
                            Save 45%
                          </span>
                          <span className="text-[10px] text-[#77796F] block line-through mt-0.5">
                            {formatCurrency(baseMonthly)} solo
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs border-[#E7E3D9] hover:border-[#173D2E]"
                          onClick={() => {
                            setSelectedCook(cook);
                            setIsModalOpen(true);
                          }}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full text-xs bg-[#173D2E] text-white hover:bg-[#102B21]"
                          onClick={() => {
                            setSelectedCook(cook);
                            setIsModalOpen(true);
                          }}
                        >
                          Book Cook
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Cook Details & Step-by-Step Booking Modal */}
      <CookDetailsModal
        cook={selectedCook}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customerSocietyId={selectedSocietyId}
        onBookingCreated={() => {
          loadCustomerData();
        }}
      />
    </DashboardLayout>
  );
};

export default CustomerDashboard;
