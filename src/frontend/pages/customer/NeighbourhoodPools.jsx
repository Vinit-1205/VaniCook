import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.js';
import { groupService } from '../../services/groupService.js';
import { locationService } from '../../services/locationService.js';
import { pricingService } from '../../services/pricingService.js';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Input } from '../../components/common/Input.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import {
  Users,
  Building,
  Calendar,
  Clock,
  Sparkles,
  TrendingDown,
  ChefHat,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  DollarSign,
  UserPlus,
  LogOut,
  Sliders,
} from 'lucide-react';

export const NeighbourhoodPools = () => {
  const { user } = useAuth();

  // State
  const [societies, setSocieties] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState('');
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, FORMING, MY_POOLS

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [matchingCooks, setMatchingCooks] = useState([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);

  // Dynamic Calculator Widget State
  const [calcHouseholds, setCalcHouseholds] = useState(3);
  const [calcPersons, setCalcPersons] = useState(3);
  const [calcMeals, setCalcMeals] = useState(1);
  const [calcDiet, setCalcDiet] = useState('Pure Vegetarian');
  const [calcResult, setCalcResult] = useState(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    societyId: '',
    title: '',
    mealType: 'LUNCH',
    preferredSchedule: '11:30 AM - 01:30 PM',
    dietaryPreference: 'Pure Vegetarian',
    targetHouseholds: 3,
    maxCapacity: 4,
    householdSize: 3,
    flatNumber: user?.householdLocations?.[0]?.flatNumber || '101',
    description: '',
  });

  // Join Form State
  const [joinForm, setJoinForm] = useState({
    householdSize: 3,
    flatNumber: user?.householdLocations?.[0]?.flatNumber || '',
  });

  // 1. Fetch initial societies
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const list = await locationService.getSocieties();
        setSocieties(list);
        const userSocId = user?.householdLocations?.[0]?.societyId;
        const initialSoc = userSocId || (list.length > 0 ? list[0].id : '');
        setSelectedSocietyId(initialSoc);
        setCreateForm((prev) => ({ ...prev, societyId: initialSoc }));
      } catch (err) {
        console.error('Failed to fetch societies:', err);
      }
    };
    fetchSocieties();
  }, [user]);

  // 2. Fetch groups for selected society
  const loadGroups = async () => {
    if (!selectedSocietyId) return;
    setIsLoading(true);
    try {
      const data = await groupService.getGroups(selectedSocietyId);
      setGroups(data || []);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [selectedSocietyId]);

  // 3. Dynamic calculator runner
  useEffect(() => {
    const runCalculation = async () => {
      try {
        const res = await pricingService.calculatePoolPrice({
          totalHouseholds: calcHouseholds,
          peoplePerHousehold: calcPersons,
          mealsPerDay: calcMeals,
          dietaryType: calcDiet,
          baseRate: 3500,
        });
        setCalcResult(res);
      } catch (err) {
        console.error('Price calculation error:', err);
      }
    };
    runCalculation();
  }, [calcHouseholds, calcPersons, calcMeals, calcDiet]);

  // Actions
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await groupService.createGroup({
        ...createForm,
        targetHouseholds: Number(createForm.targetHouseholds),
        maxCapacity: Number(createForm.maxCapacity),
        householdSize: Number(createForm.householdSize),
      });
      setIsCreateModalOpen(false);
      loadGroups();
    } catch (err) {
      alert(err.message || 'Failed to create group pool');
    }
  };

  const handleOpenJoin = (group) => {
    setSelectedGroup(group);
    setJoinForm({
      householdSize: 3,
      flatNumber: user?.householdLocations?.[0]?.flatNumber || '',
    });
    setIsJoinModalOpen(true);
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    try {
      await groupService.joinGroup(selectedGroup.id, joinForm);
      setIsJoinModalOpen(false);
      loadGroups();
    } catch (err) {
      alert(err.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (group) => {
    if (!window.confirm('Are you sure you want to leave this neighbourhood pool?')) return;
    try {
      await groupService.leaveGroup(group.id);
      loadGroups();
    } catch (err) {
      alert(err.message || 'Failed to leave group');
    }
  };

  const handleViewMatches = async (group) => {
    setSelectedGroup(group);
    setIsMatchingModalOpen(true);
    setIsMatchingLoading(true);
    try {
      const matches = await groupService.getMatchingCooks(group.id);
      setMatchingCooks(matches || []);
    } catch (err) {
      console.error('Failed to get matches:', err);
      setMatchingCooks([]);
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const handleAssignCook = async (cookProfileId) => {
    if (!selectedGroup) return;
    try {
      await groupService.assignCook(selectedGroup.id, cookProfileId);
      setIsMatchingModalOpen(false);
      loadGroups();
      alert('Cook partner invited! Waiting for their acceptance.');
    } catch (err) {
      alert(err.message || 'Failed to invite cook partner');
    }
  };

  // Filtered groups
  const filteredGroups = groups.filter((g) => {
    if (filterTab === 'FORMING') return g.status === 'OPEN' || g.status === 'MATCHING';
    if (filterTab === 'MY_POOLS') return g.isMember;
    return true;
  });

  return (
    <DashboardLayout
      title="Shared Cooking Pools"
      subtitle="Good neighbours make good cooking partners."
    >
      <div className="space-y-8 font-sans">
        {/* Top Control Bar: Society Picker + Create Pool Button */}
        <div className="bg-white p-5 rounded-3xl border border-[#E7E3D9] shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#173D2E]/10 text-[#173D2E] flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#77796F] uppercase tracking-wider">Residential Society</p>
              <select
                value={selectedSocietyId}
                onChange={(e) => {
                  setSelectedSocietyId(e.target.value);
                  setCreateForm((p) => ({ ...p, societyId: e.target.value }));
                }}
                className="font-serif font-bold text-[#173D2E] text-lg bg-transparent border-none outline-none cursor-pointer focus:ring-0 p-0"
              >
                {societies.map((s) => (
                  <option key={s.id} value={s.id} className="text-[#252923] font-sans font-medium text-sm">
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 flex-1 md:flex-initial bg-[#173D2E] text-white hover:bg-[#102B21] rounded-2xl shadow-soft"
            >
              <Plus className="w-4 h-4" />
              <span>Create Pool Request</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Pricing Calculator Card */}
        <Card className="p-6 sm:p-8 bg-[#102B21] text-white rounded-3xl border border-[#173D2E] shadow-premium overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#A5BE83]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#A5BE83]/20 text-[#A5BE83] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#A5BE83]/30">
                    Live Shared Cost Formula
                  </span>
                  <span className="text-xs text-[#F0EBDD]/70 flex items-center gap-1 font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-[#A5BE83]" /> Transparent community economics
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
                  Illustrative Shared-Cost Calculator
                </h3>
              </div>
              <p className="text-xs text-[#F0EBDD]/75 max-w-sm font-sans leading-relaxed">
                *Sample calculation based on typical 3-household sequential cluster. Actual rates depend on cook agreement.
              </p>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slider 1: Total Households */}
              <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cream/80 font-medium">Participating Households</span>
                  <span className="text-fresh font-bold text-base">{calcHouseholds} Families</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={calcHouseholds}
                  onChange={(e) => setCalcHouseholds(Number(e.target.value))}
                  className="w-full accent-fresh cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-cream/50">
                  <span>1 Family (Solo)</span>
                  <span>3 Families (Ideal)</span>
                  <span>5 Families (Max)</span>
                </div>
              </div>

              {/* Slider 2: People per Household */}
              <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cream/80 font-medium">Family Members per Home</span>
                  <span className="text-fresh font-bold text-base">{calcPersons} Persons</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={calcPersons}
                  onChange={(e) => setCalcPersons(Number(e.target.value))}
                  className="w-full accent-fresh cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-cream/50">
                  <span>1 Person</span>
                  <span>3-4 (Typical)</span>
                  <span>6 Persons</span>
                </div>
              </div>

              {/* Slider 3: Meals per day */}
              <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cream/80 font-medium">Daily Meals</span>
                  <span className="text-fresh font-bold text-base">
                    {calcMeals === 1 ? '1 Meal (e.g. Lunch)' : `${calcMeals} Meals/Day`}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={calcMeals}
                  onChange={(e) => setCalcMeals(Number(e.target.value))}
                  className="w-full accent-fresh cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-cream/50">
                  <span>1 Meal</span>
                  <span>2 Meals</span>
                  <span>All 3 Meals</span>
                </div>
              </div>
            </div>

            {/* Calculation Output Highlights */}
            {calcResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-cream/70 uppercase font-semibold">
                    Cost per Household
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-display text-fresh mt-1">
                    {formatCurrency(calcResult.pricePerHousehold)}
                  </p>
                  <p className="text-[10px] text-cream/60">per family / month</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-cream/70 uppercase font-semibold">
                    Effective Meal Cost
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
                    {formatCurrency(calcResult.costPerMealPerPerson)}
                  </p>
                  <p className="text-[10px] text-cream/60">per person per meal</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-cream/70 uppercase font-semibold">
                    Total Cook Earnings
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-display text-fresh mt-1">
                    {formatCurrency(calcResult.totalCookEarnings)}
                  </p>
                  <p className="text-[10px] text-cream/60">for ~{calcResult.workload?.dailyCookingMinutes} mins daily</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-cream/70 uppercase font-semibold">
                    Household Savings
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
                    {calcResult.savings?.percentSaved || 0}%
                  </p>
                  <p className="text-[10px] text-fresh font-medium">
                    Save {formatCurrency(calcResult.savings?.monthlySavingsPerHousehold || 0)} / mo
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
                filterTab === 'ALL'
                  ? 'bg-forest text-cream shadow-soft'
                  : 'bg-white text-charcoal/70 hover:bg-sage/40'
              }`}
            >
              All Pools ({groups.length})
            </button>
            <button
              onClick={() => setFilterTab('FORMING')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
                filterTab === 'FORMING'
                  ? 'bg-forest text-cream shadow-soft'
                  : 'bg-white text-charcoal/70 hover:bg-sage/40'
              }`}
            >
              Open & Forming ({groups.filter((g) => g.status === 'OPEN' || g.status === 'MATCHING').length})
            </button>
            <button
              onClick={() => setFilterTab('MY_POOLS')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
                filterTab === 'MY_POOLS'
                  ? 'bg-forest text-cream shadow-soft'
                  : 'bg-white text-charcoal/70 hover:bg-sage/40'
              }`}
            >
              My Pools ({groups.filter((g) => g.isMember).length})
            </button>
          </div>

          <span className="text-xs text-charcoal/60">
            Sequential in-tower cooking • Addresses hidden for privacy
          </span>
        </div>

        {/* Group Pools Grid */}
        {isLoading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 border-3 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-charcoal/60">Loading neighbourhood cooking requests...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-charcoal/10 p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-forest/10 text-forest flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold font-display text-forest">No Cooking Pools Found</h4>
            <p className="text-xs text-charcoal/60 max-w-md mx-auto">
              There are no matching group requests currently in this society. Be the pioneer by creating a neighbourhood pool request!
            </p>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              Start a Cooking Pool
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => {
              const capacityPercent = Math.round(
                (group.currentHouseholds / group.maxCapacity) * 100
              );

              return (
                <Card
                  key={group.id}
                  className={`p-6 flex flex-col justify-between space-y-5 rounded-3xl transition-all duration-300 ${
                    group.isMember
                      ? 'border-2 border-forest shadow-premium bg-gradient-to-b from-sage/10 to-white'
                      : 'border border-charcoal/10 shadow-soft hover:shadow-card'
                  }`}
                >
                  {/* Top Bar: Title, Status, and Dietary badge */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={
                          group.status === 'CONFIRMED' || group.status === 'ACTIVE'
                            ? 'success'
                            : group.status === 'COOK_PENDING'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {group.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-[11px] font-semibold text-forest bg-sage/50 px-2.5 py-1 rounded-xl">
                        {group.dietaryPreference}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold font-display text-forest line-clamp-1">
                      {group.title || `${group.mealType} Pool`}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-charcoal/70">
                      <Clock className="w-3.5 h-3.5 text-forest" />
                      <span>{group.preferredSchedule}</span>
                      <span>•</span>
                      <span className="capitalize">{group.mealType.toLowerCase()}</span>
                    </div>
                  </div>

                  {/* Progress & Capacity Bar */}
                  <div className="space-y-1.5 bg-cream/80 p-3.5 rounded-2xl border border-charcoal/5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-charcoal">
                        {group.currentHouseholds} of {group.maxCapacity} Households
                      </span>
                      <span className="text-forest font-bold">
                        {group.openSlots > 0 ? `${group.openSlots} open slot${group.openSlots > 1 ? 's' : ''}` : 'Pool Full'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-charcoal/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest rounded-full transition-all duration-500"
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-charcoal/50">
                      Sequential visiting in same society • Workload: ~{group.totalWorkloadMinutes} mins daily
                    </p>
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div className="bg-forest/5 p-4 rounded-2xl border border-forest/15 space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-charcoal/70">Estimated Cost:</span>
                      <span className="text-lg font-extrabold text-forest font-display">
                        {formatCurrency(group.currentPricing?.pricePerHousehold || group.estimatedPricePerHousehold)}
                        <span className="text-[10px] font-normal text-charcoal/60"> / mo</span>
                      </span>
                    </div>

                    {!group.isMember && group.openSlots > 0 && group.nextMemberPricing && (
                      <div className="flex items-center gap-1.5 text-[11px] text-forest font-medium pt-1 border-t border-forest/10">
                        <TrendingDown className="w-3.5 h-3.5 text-fresh-dark" />
                        <span>
                          If you join, cost drops to{' '}
                          <strong>{formatCurrency(group.nextMemberPricing.pricePerHousehold)}</strong> (
                          {group.nextMemberPricing.savings.percentSaved}% savings)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Cook info or Matchmaker CTA */}
                  <div className="pt-1">
                    {group.assignedCook ? (
                      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-charcoal/10">
                        <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                          <ChefHat className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-forest truncate">
                            {group.assignedCook.user?.fullName}
                          </p>
                          <p className="text-[10px] text-charcoal/60">
                            {group.status === 'CONFIRMED' ? 'Confirmed Cook Partner' : 'Invitation Pending'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleViewMatches(group)}
                        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-forest bg-sage/40 hover:bg-sage/70 py-2.5 px-3 rounded-2xl transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-forest" />
                        <span>View Matching Cooks (Deterministic AI)</span>
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    {group.isMember ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleLeaveGroup(group)}
                        className="w-full flex items-center justify-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Leave Pool</span>
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={group.isFull}
                        onClick={() => handleOpenJoin(group)}
                        className="w-full flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{group.isFull ? 'Pool Full' : 'Join This Pool'}</span>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Create Neighbourhood Pool */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Neighbourhood Cooking Pool"
        subtitle="Start a group request in your residential society."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="Pool Title (Optional)"
            placeholder="e.g. Tower C Lunch Cooking Club"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Meal Type</label>
              <select
                value={createForm.mealType}
                onChange={(e) => setCreateForm({ ...createForm, mealType: e.target.value })}
                className="w-full bg-white border border-charcoal/20 rounded-2xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-forest outline-none"
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
                <option value="ALL_MEALS">All Meals</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Dietary Preference</label>
              <select
                value={createForm.dietaryPreference}
                onChange={(e) => setCreateForm({ ...createForm, dietaryPreference: e.target.value })}
                className="w-full bg-white border border-charcoal/20 rounded-2xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-forest outline-none"
              >
                <option value="Pure Vegetarian">Pure Vegetarian</option>
                <option value="Vegetarian + Egg">Vegetarian + Egg</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Jain Vegetarian">Jain Vegetarian</option>
                <option value="South Indian Pure Veg">South Indian Pure Veg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preferred Schedule Slot"
              placeholder="11:30 AM - 01:30 PM"
              value={createForm.preferredSchedule}
              onChange={(e) => setCreateForm({ ...createForm, preferredSchedule: e.target.value })}
            />

            <Input
              label="Your Flat / Tower Number"
              placeholder="Tower B - 1204"
              value={createForm.flatNumber}
              onChange={(e) => setCreateForm({ ...createForm, flatNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Your Family Size</label>
              <input
                type="number"
                min="1"
                max="8"
                value={createForm.householdSize}
                onChange={(e) => setCreateForm({ ...createForm, householdSize: e.target.value })}
                className="w-full bg-white border border-charcoal/20 rounded-2xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-forest outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Target Families</label>
              <input
                type="number"
                min="2"
                max="5"
                value={createForm.targetHouseholds}
                onChange={(e) => setCreateForm({ ...createForm, targetHouseholds: e.target.value })}
                className="w-full bg-white border border-charcoal/20 rounded-2xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-forest outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Max Capacity</label>
              <input
                type="number"
                min="2"
                max="5"
                value={createForm.maxCapacity}
                onChange={(e) => setCreateForm({ ...createForm, maxCapacity: e.target.value })}
                className="w-full bg-white border border-charcoal/20 rounded-2xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-forest outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Pool Description & Special Requirements (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Looking for light oil homestyle cooking, phulkas and dal tadka."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full bg-white border border-charcoal/20 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-forest outline-none"
            />
          </div>

          <div className="bg-sage/30 p-3 rounded-2xl text-[11px] text-forest flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Your flat number will remain private and never be displayed publicly. CookConnect notifies nearby tower neighbours to join your pool.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Launch Pool Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Join Neighbourhood Pool */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join Neighbourhood Pool"
        subtitle={`Join "${selectedGroup?.title || 'Shared Pool'}" in your society.`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleJoinGroup} className="space-y-4">
          <Input
            label="Your Flat / Unit Number"
            placeholder="e.g. Tower A - Flat 402"
            value={joinForm.flatNumber}
            onChange={(e) => setJoinForm({ ...joinForm, flatNumber: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Number of Persons in Your Household
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={joinForm.householdSize}
              onChange={(e) => setJoinForm({ ...joinForm, householdSize: e.target.value })}
              className="w-full bg-white border border-charcoal/20 rounded-2xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-forest outline-none"
            />
          </div>

          {selectedGroup && (
            <div className="bg-forest/5 p-4 rounded-2xl border border-forest/15 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-charcoal/70">Current Families:</span>
                <span className="font-bold text-forest">{selectedGroup.currentHouseholds}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-charcoal/70">Projected Cost After Joining:</span>
                <span className="font-extrabold text-forest text-base font-display">
                  {formatCurrency(selectedGroup.nextMemberPricing?.pricePerHousehold || selectedGroup.estimatedPricePerHousehold)}
                  <span className="text-[10px] font-normal text-charcoal/60"> / mo</span>
                </span>
              </div>
              <p className="text-[10px] text-forest font-medium">
                Fair multi-household pricing recalculates automatically.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsJoinModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Join Pool
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Compatible Cook Matchmaker (Deterministic AI Engine) */}
      <Modal
        isOpen={isMatchingModalOpen}
        onClose={() => setIsMatchingModalOpen(false)}
        title="Intelligent Cook Recommendations"
        subtitle={`Deterministic scoring for "${selectedGroup?.title || 'Shared Pool'}"`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal/70">
            Recommendations are scored deterministically based on Society proximity (30%), Schedule slot availability (25%), Meal compatibility (20%), Dietary alignment (15%), and Capacity limit (10%).
          </p>

          {isMatchingLoading ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-8 h-8 border-3 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-charcoal/60">Evaluating society proximity and schedule compatibility...</p>
            </div>
          ) : matchingCooks.length === 0 ? (
            <div className="text-center py-10 bg-cream rounded-2xl border border-charcoal/10 p-6 space-y-2">
              <ChefHat className="w-8 h-8 text-forest mx-auto opacity-40" />
              <p className="text-xs font-semibold text-charcoal">No fully compatible cooks found currently.</p>
              <p className="text-[11px] text-charcoal/60">
                Cooks in your society may have overlapping slots or reached their maximum household limit.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {matchingCooks.map((match) => (
                <div
                  key={match.cook.id}
                  className="bg-white p-4 rounded-2xl border border-charcoal/10 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={match.cook.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'}
                      alt={match.cook.name}
                      className="w-12 h-12 rounded-2xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-forest">{match.cook.name}</h5>
                        <span className="bg-forest text-fresh text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {match.compatibilityScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-charcoal/70">
                        {match.cook.experienceYears} yrs exp • Base: {formatCurrency(match.cook.basePriceMonthly)}/mo
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {match.breakdown?.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-cream px-2 py-0.5 rounded-lg text-charcoal/70 border border-charcoal/5"
                          >
                            {item.factor}: {item.points} pts
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedGroup?.isCreator && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAssignCook(match.cook.id)}
                      className="shrink-0"
                    >
                      Invite to Pool
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsMatchingModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

