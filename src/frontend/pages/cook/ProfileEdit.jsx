import React, { useState, useEffect } from 'react';
import { cookService } from '../../services/cookService.js';
import { locationService } from '../../services/locationService.js';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { CUISINES_LIST, DIETARY_PREFERENCES } from '../../utils/constants.js';
import { User, DollarSign, Award, CheckCircle2, Camera, Building, Plus, Trash2 } from 'lucide-react';

export const ProfileEdit = () => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [basePriceMonthly, setBasePriceMonthly] = useState(3500);
  const [maxHouseholds, setMaxHouseholds] = useState(4);
  const [specialitiesInput, setSpecialitiesInput] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedDiets, setSelectedDiets] = useState([]);
  const [allSocieties, setAllSocieties] = useState([]);
  const [selectedSocieties, setSelectedSocieties] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfileAndSocieties = async () => {
      setIsLoading(true);
      try {
        const [profile, socList] = await Promise.all([
          cookService.getMyProfile(),
          locationService.getSocieties(),
        ]);

        setAllSocieties(socList || []);
        setAvatarUrl(profile.user?.avatarUrl || '');
        setBio(profile.bio || '');
        setExperienceYears(profile.experienceYears || 2);
        setBasePriceMonthly(profile.basePriceMonthly || 3500);
        setMaxHouseholds(profile.maxHouseholds || 4);
        setSpecialitiesInput(profile.specialities ? profile.specialities.join(', ') : '');
        setSelectedCuisines(profile.cuisines || []);
        setSelectedDiets(profile.dietaryPreferences || []);

        const servedIds = profile.societiesServed?.map((s) => s.societyId) || [];
        setSelectedSocieties(servedIds);
      } catch (err) {
        console.error('Failed to load cook profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileAndSocieties();
  }, []);

  // Handle Base64 Photo Upload without multer
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result); // Base64 data URI
    };
    reader.readAsDataURL(file);
  };

  const handleCuisineToggle = (cuisine) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const handleDietToggle = (diet) => {
    if (selectedDiets.includes(diet)) {
      setSelectedDiets(selectedDiets.filter((d) => d !== diet));
    } else {
      setSelectedDiets([...selectedDiets, diet]);
    }
  };

  const handleSocietyToggle = (societyId) => {
    if (selectedSocieties.includes(societyId)) {
      setSelectedSocieties(selectedSocieties.filter((id) => id !== societyId));
    } else {
      setSelectedSocieties([...selectedSocieties, societyId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      const specialitiesArray = specialitiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await cookService.updateMyProfile({
        avatarUrl,
        bio,
        experienceYears: Number(experienceYears),
        basePriceMonthly: Number(basePriceMonthly),
        maxHouseholds: Number(maxHouseholds),
        specialities: specialitiesArray,
        cuisines: selectedCuisines,
        dietaryPreferences: selectedDiets,
        societyIds: selectedSocieties,
      });

      setSuccessMessage('Cook profile updated successfully! Changes are live across neighbourhood search.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Cook Partner Profile & Culinary Specialities 👨‍🍳"
      subtitle="Update your profile photo, serving societies, kitchen rates, and culinary specialities."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-soft">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <Card className="p-8" padding="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload via Base64 */}
            <div className="flex items-center gap-6 p-4 bg-cream/70 rounded-3xl border border-charcoal/10">
              <div className="relative group">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-forest shadow-soft"
                />
                <label className="absolute inset-0 bg-forest/60 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-0.5">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-forest">Profile Photo</h4>
                <p className="text-xs text-charcoal/60 leading-relaxed">
                  Upload a clear, welcoming photo. Persisted securely using Base64 without third-party storage.
                </p>
                <label className="inline-block text-xs text-forest hover:underline font-semibold cursor-pointer pt-0.5">
                  Choose Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-charcoal/70 mb-1.5">
                About Yourself & Cooking Style (Bio)
              </label>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your culinary background, what meals you specialize in, and your kitchen hygiene standards..."
                className="w-full text-xs p-3.5 rounded-2xl border border-charcoal/15 focus:border-forest focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Experience (Years)"
                type="number"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                required
              />

              <Input
                label="Base Monthly Rate (₹ Solo)"
                type="number"
                min="500"
                step="100"
                value={basePriceMonthly}
                onChange={(e) => setBasePriceMonthly(e.target.value)}
                required
                helperText="Shared pool rate is dynamically discounted ~45%"
              />

              <Input
                label="Max Households Capacity"
                type="number"
                min="1"
                max="10"
                value={maxHouseholds}
                onChange={(e) => setMaxHouseholds(e.target.value)}
                required
                helperText="Prevents overbooking in your rounds"
              />
            </div>

            <Input
              label="Speciality Dishes (comma separated)"
              placeholder="e.g. Soft Phulkas, Dal Makhani, Crispy Dosa, Paneer Gravies"
              value={specialitiesInput}
              onChange={(e) => setSpecialitiesInput(e.target.value)}
              helperText="Families search for these specific dishes"
            />

            {/* Supported Societies Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase text-charcoal/70 mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-forest" />
                <span>Residential Societies You Serve</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allSocieties.map((soc) => {
                  const isSelected = selectedSocieties.includes(soc.id);
                  return (
                    <button
                      type="button"
                      key={soc.id}
                      onClick={() => handleSocietyToggle(soc.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-forest bg-forest/5 text-forest font-bold ring-1 ring-forest'
                          : 'border-charcoal/15 bg-white text-charcoal/70 hover:border-forest/40'
                      }`}
                    >
                      <div>
                        <span className="text-xs">{soc.name}</span>
                        <span className="block text-[10px] text-charcoal/50 font-normal">
                          {soc.locality}, {soc.city}
                        </span>
                      </div>
                      <span className={`text-xs ${isSelected ? 'text-forest font-bold' : 'text-charcoal/30'}`}>
                        {isSelected ? '✓ Serving' : '+ Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cuisines selector */}
            <div>
              <label className="block text-xs font-semibold uppercase text-charcoal/70 mb-2">
                Cuisines You Cook
              </label>
              <div className="flex flex-wrap gap-2">
                {CUISINES_LIST.map((cuisine) => {
                  const isSelected = selectedCuisines.includes(cuisine);
                  return (
                    <button
                      type="button"
                      key={cuisine}
                      onClick={() => handleCuisineToggle(cuisine)}
                      className={`text-xs px-3.5 py-1.5 rounded-2xl font-medium border transition-all ${
                        isSelected
                          ? 'bg-forest text-cream border-forest shadow-soft'
                          : 'bg-white text-charcoal/70 border-charcoal/15 hover:border-forest'
                      }`}
                    >
                      {cuisine}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary preferences */}
            <div>
              <label className="block text-xs font-semibold uppercase text-charcoal/70 mb-2">
                Dietary Practices Handled
              </label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_PREFERENCES.map((diet) => {
                  const isSelected = selectedDiets.includes(diet);
                  return (
                    <button
                      type="button"
                      key={diet}
                      onClick={() => handleDietToggle(diet)}
                      className={`text-xs px-3.5 py-1.5 rounded-2xl font-medium border transition-all ${
                        isSelected
                          ? 'bg-fresh/30 text-forest-dark border-fresh font-bold'
                          : 'bg-white text-charcoal/70 border-charcoal/15 hover:border-fresh'
                      }`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-charcoal/10 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSaving}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};
