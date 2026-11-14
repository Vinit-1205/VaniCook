import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Card } from '../../components/common/Card.jsx';
import { formatCurrency, formatMealType, formatDate } from '../../utils/formatters.js';
import { bookingService } from '../../services/bookingService.js';
import { cookService } from '../../services/cookService.js';
import {
  Star,
  ShieldCheck,
  Clock,
  Users,
  Utensils,
  Calendar,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const CookDetailsModal = ({
  cook,
  isOpen,
  onClose,
  onBookingCreated,
  customerSocietyId,
}) => {
  const [reviews, setReviews] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState('ALL_MEALS');
  const [isSharedPool, setIsSharedPool] = useState(true);
  const [familySize, setFamilySize] = useState(2);
  const [diet, setDiet] = useState('Vegetarian');
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    if (isOpen && cook?.id) {
      cookService
        .getCookReviews(cook.id)
        .then((r) => setReviews(r || []))
        .catch(() => setReviews([]));
    }
  }, [isOpen, cook?.id]);

  if (!cook) return null;

  const basePrice = cook.basePriceMonthly;
  const sharedPrice = Math.round(basePrice * 0.55);
  const activeRate = isSharedPool ? sharedPrice : basePrice;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingError('');

    try {
      await bookingService.createBooking({
        cookProfileId: cook.id,
        societyId: customerSocietyId,
        mealType: selectedMealType,
        isSharedPool,
        diet,
        spiceLevel,
        familySize: Number(familySize),
        specialInstructions,
      });

      setBookingSuccess(true);
      if (onBookingCreated) {
        onBookingCreated();
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to request booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setBookingSuccess(false);
        onClose();
      }}
      title={cook.user?.fullName}
      subtitle={`Verified Cook Partner • ${cook.experienceYears} Years Experience`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 font-sans">
        {/* Header Profile Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#F8F5EC] rounded-3xl border border-[#E7E3D9]">
          <div className="flex items-center gap-4">
            <img
              src={
                cook.user?.avatarUrl ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
              }
              alt={cook.user?.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#A5BE83]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-xl text-[#252923]">
                  {cook.user?.fullName}
                </h4>
                {cook.isVerified && (
                  <Badge variant="forest" size="xs">
                    <ShieldCheck className="w-3 h-3 text-[#173D2E]" /> Verified Partner
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#77796F]">
                <div className="flex items-center gap-1 text-amber-700 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{cook.rating || '4.9'}</span>
                </div>
                <span>&bull;</span>
                <span>{cook.totalReviews || 12} Resident Reviews</span>
                <span>&bull;</span>
                <span>Max {cook.maxHouseholds} Homes Capacity</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right sm:border-l sm:border-[#E7E3D9] sm:pl-4">
            <span className="text-[10px] text-[#77796F] uppercase block font-bold tracking-wider">
              Shared Pool Rate
            </span>
            <span className="text-2xl font-serif font-bold text-[#173D2E]">
              {formatCurrency(sharedPrice)}
              <span className="text-xs font-normal text-[#77796F] font-sans">/mo</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block">
              Save 45% with neighbourhood pool
            </span>
          </div>
        </div>

        {/* Bio & Specialties */}
        <div className="space-y-2.5">
          <p className="text-xs text-[#252923]/80 leading-relaxed font-sans">
            {cook.bio || 'Professional home chef dedicated to nutritious, home-style regional cooking.'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cook.cuisines?.map((c, i) => (
              <Badge key={i} variant="forest" size="xs">
                {c}
              </Badge>
            ))}
            {cook.dietaryPreferences?.map((d, i) => (
              <Badge key={i} variant="default" size="xs">
                {d}
              </Badge>
            ))}
          </div>
        </div>

        {/* Schedule & Availability Slots */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#77796F] mb-2.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#173D2E]" />
            Sequential Daily Visiting Slots
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { slot: 'BREAKFAST', time: '07:00 - 09:00 AM' },
              { slot: 'LUNCH', time: '11:30 - 01:30 PM' },
              { slot: 'DINNER', time: '06:30 - 08:30 PM' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-2xl border border-[#E7E3D9] text-xs flex items-center justify-between"
              >
                <span className="font-bold text-[#252923]">{item.slot}</span>
                <span className="text-[11px] text-[#77796F]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Resident Reviews Section */}
        {reviews.length > 0 && (
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#77796F] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#173D2E]" />
              <span>Verified Resident Testimonials ({reviews.length})</span>
            </h5>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-[#F8F5EC] rounded-2xl border border-[#E7E3D9] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#173D2E]">
                      {rev.customer?.fullName || 'Resident Neighbour'}
                    </span>
                    <div className="flex items-center gap-1 text-amber-700 font-bold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{rev.rating}/5</span>
                    </div>
                  </div>
                  {rev.comment && <p className="text-[#252923]/75 italic">"{rev.comment}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Form or Success View */}
        {bookingSuccess ? (
          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-xl font-bold text-emerald-950">
              Booking Request Submitted!
            </h4>
            <p className="text-xs text-emerald-900 max-w-md mx-auto leading-relaxed">
              Your request with {cook.user?.fullName} has been created at{' '}
              <strong>{formatCurrency(activeRate)}/month</strong>. The cook will verify the schedule and coordinate visiting times.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBookingSuccess(false);
                onClose();
              }}
              className="mt-2"
            >
              Done & Return to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="pt-4 border-t border-[#E7E3D9] space-y-4">
            <h5 className="font-serif text-base font-bold text-[#252923]">
              Schedule Service with {cook.user?.fullName}
            </h5>

            {bookingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium">
                {bookingError}
              </div>
            )}

            {/* Sharing Model Toggle (Shared Pool vs Solo Hire) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsSharedPool(true)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSharedPool
                    ? 'border-[#173D2E] bg-[#173D2E]/5 text-[#173D2E] ring-1 ring-[#173D2E]'
                    : 'border-[#E7E3D9] bg-white text-[#77796F]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#252923]">Neighbourhood Pool</span>
                  <span className="text-[10px] font-bold text-[#173D2E] bg-[#A5BE83]/30 px-2 py-0.5 rounded-full">
                    Save 45%
                  </span>
                </div>
                <p className="text-base font-serif font-bold mt-1 text-[#173D2E]">
                  {formatCurrency(sharedPrice)}/mo
                </p>
                <p className="text-[10px] text-[#77796F] mt-0.5">Shared sequential visit with nearby neighbour</p>
              </button>

              <button
                type="button"
                onClick={() => setIsSharedPool(false)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  !isSharedPool
                    ? 'border-[#173D2E] bg-[#173D2E]/5 text-[#173D2E] ring-1 ring-[#173D2E]'
                    : 'border-[#E7E3D9] bg-white text-[#77796F]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#252923]">Solo Household</span>
                  <span className="text-[10px] text-[#77796F]">Exclusive</span>
                </div>
                <p className="text-base font-serif font-bold mt-1 text-[#252923]">
                  {formatCurrency(basePrice)}/mo
                </p>
                <p className="text-[10px] text-[#77796F] mt-0.5">Cook visits only your flat</p>
              </button>
            </div>

            {/* Preference fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#77796F] mb-1">
                  Meal Slot
                </label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full text-xs bg-white border border-[#E7E3D9] rounded-xl p-2.5 focus:border-[#173D2E] focus:outline-none"
                >
                  <option value="ALL_MEALS">All Meals (Breakfast + Dinner)</option>
                  <option value="LUNCH">Lunch Only</option>
                  <option value="DINNER">Dinner Only</option>
                  <option value="BREAKFAST">Breakfast Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#77796F] mb-1">
                  Diet Preference
                </label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="w-full text-xs bg-white border border-[#E7E3D9] rounded-xl p-2.5 focus:border-[#173D2E] focus:outline-none"
                >
                  <option value="Vegetarian">Pure Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Jain (No Onion/Garlic)">Jain (No Onion/Garlic)</option>
                  <option value="Eggitarian">Eggitarian</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#77796F] mb-1">
                  Family Members
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={familySize}
                  onChange={(e) => setFamilySize(e.target.value)}
                  className="w-full text-xs bg-white border border-[#E7E3D9] rounded-xl p-2.5 focus:border-[#173D2E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#77796F] mb-1">
                Special Dietary Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Mild spice, less oil, warm phulkas"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full text-xs bg-white border border-[#E7E3D9] rounded-xl p-2.5 focus:border-[#173D2E] focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-[#173D2E] text-white hover:bg-[#102B21] py-3 rounded-2xl shadow-soft font-bold text-sm"
              size="lg"
              isLoading={isSubmitting}
            >
              Confirm Booking Request &bull; {formatCurrency(activeRate)}/mo
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default CookDetailsModal;
