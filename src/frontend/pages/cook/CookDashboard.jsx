import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { cookService } from '../../services/cookService.js';
import { bookingService } from '../../services/bookingService.js';
import { groupService } from '../../services/groupService.js';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { formatCurrency, formatDate, formatMealType } from '../../utils/formatters.js';
import {
  Users,
  Star,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building,
  Calendar,
  Utensils,
  MapPin,
  Sparkles,
  ArrowRight,
  Flame,
  Phone,
  Layers,
} from 'lucide-react';

export const CookDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCookData = async () => {
    setIsLoading(true);
    try {
      const [cookProfile, cookBookings, schedule] = await Promise.all([
        cookService.getMyProfile(),
        bookingService.getCookBookings(),
        cookService.getSchedule().catch(() => null),
      ]);
      setProfile(cookProfile);
      setBookings(cookBookings || []);
      setScheduleData(schedule);
    } catch (err) {
      console.error('Failed to load cook dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCookData();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      fetchCookData();
    } catch (err) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  const handleRespondToGroup = async (groupId, decision) => {
    try {
      await groupService.respondToGroup(groupId, decision);
      alert(decision === 'ACCEPT' ? 'Group pool accepted! Subscriptions created.' : 'Group request declined.');
      fetchCookData();
    } catch (err) {
      alert(err.message || 'Failed to respond to group request');
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'ACTIVE' || b.status === 'CONFIRMED');
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const pendingGroups = scheduleData?.assignedGroups?.filter((g) => g.status === 'COOK_PENDING') || [];

  // Total monthly earnings
  const totalEarnings = activeBookings.reduce((sum, b) => sum + b.monthlyRate, 0);

  // Active day schedule
  const currentDaySchedule = scheduleData?.weeklyCalendar?.find((c) => c.day === selectedDay) || {
    scheduledVisits: [],
    slots: [],
  };

  const daysList = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <DashboardLayout
      title="Your work, beautifully organised."
      subtitle="Sequential neighbourhood cooking visits, incoming pool requests, and transparent earnings."
    >
      <div className="space-y-8 font-sans">
        {/* KPI / Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal/60 uppercase">
                Active Households
              </span>
              <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-display text-forest">
              {activeBookings.length}{' '}
              <span className="text-xs font-normal text-charcoal/60">
                / {profile?.maxHouseholds || 4} Capacity
              </span>
            </p>
            <p className="text-[11px] text-charcoal/60">
              {Math.max(0, (profile?.maxHouseholds || 4) - activeBookings.length)} slots open for new bookings
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal/60 uppercase">
                Monthly Earnings
              </span>
              <div className="w-8 h-8 rounded-xl bg-fresh/30 text-forest-dark flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-display text-forest">
              {formatCurrency(totalEarnings || (profile?.basePriceMonthly ? profile.basePriceMonthly * 2 : 7000))}
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold">
              Fair dynamic compensation model
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal/60 uppercase">
                Cook Partner Rating
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-display text-charcoal">
              {profile?.rating || '4.9'} ⭐
            </p>
            <p className="text-[11px] text-charcoal/60">
              Based on {profile?.totalReviews || 24} resident reviews
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal/60 uppercase">
                Verification & Society
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-base font-bold font-display text-emerald-800">
              Verified Partner
            </p>
            <p className="text-[11px] text-charcoal/60">
              Servicing {profile?.societies?.[0]?.society?.name || 'Prestige Shantiniketan'}
            </p>
          </Card>
        </div>

        {/* SECTION 1: Incoming Neighbourhood Group Inquiries */}
        {pendingGroups.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-forest flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Incoming Neighbourhood Pool Requests</span>
                <Badge variant="warning">{pendingGroups.length} Pending Decision</Badge>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingGroups.map((group) => {
                const combinedEarnings = (group.estimatedPricePerHousehold || 1540) * group.currentHouseholds;

                return (
                  <Card key={group.id} className="p-6 border-2 border-amber-300 bg-amber-50/40 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-forest">
                            {group.title || `${group.mealType} Pool`}
                          </h4>
                          <span className="bg-forest text-fresh text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {group.currentHouseholds} Families Pool
                          </span>
                        </div>
                        <p className="text-xs text-charcoal/70 flex items-center gap-1 mt-1">
                          <Building className="w-3.5 h-3.5 text-forest" />
                          {group.society?.name || 'Prestige Shantiniketan'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-charcoal/50 uppercase block font-semibold">
                          Combined Earnings
                        </span>
                        <span className="text-lg font-extrabold text-forest font-display">
                          {formatCurrency(combinedEarnings)}/mo
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-white/80 p-3 rounded-2xl border border-charcoal/10 text-xs">
                      <div>
                        <span className="text-charcoal/60 block text-[10px]">Visiting Schedule:</span>
                        <span className="font-semibold text-charcoal">{group.preferredSchedule}</span>
                      </div>
                      <div>
                        <span className="text-charcoal/60 block text-[10px]">Dietary Preference:</span>
                        <span className="font-semibold text-charcoal">{group.dietaryPreference}</span>
                      </div>
                      <div>
                        <span className="text-charcoal/60 block text-[10px]">Total Daily Workload:</span>
                        <span className="font-semibold text-forest">~{group.totalWorkloadMinutes || 95} mins total</span>
                      </div>
                      <div>
                        <span className="text-charcoal/60 block text-[10px]">Households in Pool:</span>
                        <span className="font-semibold text-charcoal">{group.currentHouseholds} families</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-charcoal/60 italic">
                      "{group.description || 'Neighbourhood group request for daily sequential home cooking.'}"
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-amber-200">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRespondToGroup(group.id, 'REJECT')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleRespondToGroup(group.id, 'ACCEPT')}
                      >
                        Accept Pool Booking
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: Individual Booking Inquiries */}
        {pendingBookings.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display text-charcoal flex items-center gap-2">
              <span>Individual Booking Requests</span>
              <Badge variant="warning">{pendingBookings.length} Action Needed</Badge>
            </h3>

            <div className="space-y-3">
              {pendingBookings.map((b) => (
                <Card
                  key={b.id}
                  className="p-5 border-l-4 border-l-forest flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-charcoal">{b.customer?.fullName}</h4>
                      <Badge variant="default" size="xs">
                        {b.society?.name || 'Prestige Shantiniketan'}
                      </Badge>
                    </div>
                    <p className="text-xs text-charcoal/70">
                      <strong>Meal:</strong> {formatMealType(b.mealType)} •{' '}
                      <strong>Diet:</strong> {b.requirements?.diet || 'Veg'} •{' '}
                      <strong>Family:</strong> {b.requirements?.familySize || 2} members
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-charcoal/50 block">Monthly Rate</span>
                      <span className="font-bold text-forest text-base font-display">
                        {formatCurrency(b.monthlyRate)}/mo
                      </span>
                    </div>

                    <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(b.id, 'ACTIVE')}>
                      Accept
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}>
                      Decline
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: Sequential Visiting Schedule Engine (Weekly Calendar) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold font-display text-forest flex items-center gap-2">
                <Calendar className="w-5 h-5 text-forest" />
                <span>Sequential In-Tower Visiting Schedule</span>
              </h3>
              <p className="text-xs text-charcoal/60">
                You visit multiple households sequentially within the same society to minimize transit.
              </p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
              {daysList.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedDay === day
                      ? 'bg-forest text-cream shadow-soft'
                      : 'bg-white text-charcoal/70 border border-charcoal/10 hover:bg-sage/40'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Day Schedule Content */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <span className="font-bold text-sm text-forest uppercase tracking-wide">
                {selectedDay} VISITS ({currentDaySchedule.scheduledVisits?.length || 0} Homes)
              </span>
              <span className="text-xs text-charcoal/60">
                Estimated Transit: <strong>0 mins</strong> (Same Society/Tower)
              </span>
            </div>

            {currentDaySchedule.scheduledVisits?.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Clock className="w-8 h-8 text-charcoal/40 mx-auto" />
                <p className="text-xs font-semibold text-charcoal">No scheduled visits on {selectedDay}.</p>
                <p className="text-[11px] text-charcoal/60">Open for new neighbourhood pool subscriptions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentDaySchedule.scheduledVisits.map((visit, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-2xl border border-charcoal/10 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-forest/30 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-forest text-fresh font-bold text-base flex items-center justify-center shrink-0">
                        #{visit.visitOrder}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-forest">{visit.customerName}</h5>
                          {visit.isGroupPool && (
                            <span className="text-[10px] font-bold text-forest bg-sage/50 px-2 py-0.5 rounded-full">
                              Shared Pool
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-charcoal/70 flex items-center gap-2">
                          <span className="flex items-center gap-1 font-semibold text-charcoal">
                            <Building className="w-3.5 h-3.5 text-forest" />
                            {visit.tower}, {visit.flat}
                          </span>
                          <span>•</span>
                          <span>{visit.society}</span>
                        </p>

                        <div className="flex flex-wrap gap-2 text-[11px] text-charcoal/60 pt-0.5">
                          <span><strong>Meal:</strong> {visit.mealType}</span>
                          <span>•</span>
                          <span><strong>Diet:</strong> {visit.diet}</span>
                          <span>•</span>
                          <span><strong>Spice:</strong> {visit.spiceLevel}</span>
                          {visit.instructions !== 'None' && (
                            <span className="italic text-charcoal/80">"{visit.instructions}"</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={`tel:${visit.phone}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-forest bg-sage/40 hover:bg-sage/70 px-3 py-2 rounded-xl transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Resident</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* SECTION 4: Active Household Subscriptions */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold font-display text-charcoal">
            Active Household Subscriptions ({activeBookings.length})
          </h3>

          {activeBookings.length === 0 ? (
            <Card className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-cream mx-auto flex items-center justify-center text-charcoal/40">
                <Utensils className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-charcoal">No active households assigned</h4>
              <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
                Once households in your society confirm bookings or group pools, their details will appear here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBookings.map((b) => (
                <Card key={b.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-charcoal">{b.customer?.fullName}</h4>
                      <p className="text-xs text-charcoal/60 flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-forest" />
                        {b.society?.name || 'Prestige Shantiniketan'}
                      </p>
                      <p className="text-xs text-charcoal/60">
                        Phone: {b.customer?.phone || '+91 98765 43210'}
                      </p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  <div className="p-3 bg-cream rounded-xl text-xs space-y-1 text-charcoal/80">
                    <p>
                      <strong>Slot:</strong> {formatMealType(b.mealType)}
                    </p>
                    <p>
                      <strong>Preferences:</strong> {b.requirements?.diet || 'Veg'} (Spice:{' '}
                      {b.requirements?.spiceLevel || 'Medium'})
                    </p>
                    {b.notes && (
                      <p className="text-forest font-medium">
                        {b.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-charcoal/5">
                    <div>
                      <span className="text-[10px] text-charcoal/60 block uppercase font-semibold">
                        Monthly Income
                      </span>
                      <span className="font-bold text-forest text-base font-display">
                        {formatCurrency(b.monthlyRate)}/mo
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                    >
                      Complete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
