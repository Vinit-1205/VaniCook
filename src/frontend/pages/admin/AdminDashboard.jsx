import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import { locationService } from '../../services/locationService.js';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import {
  Users,
  ChefHat,
  Building,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  Filter,
  Flame,
  Search,
  UserX,
  UserCheck,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cooks, setCooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pools, setPools] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [activeTab, setActiveTab] = useState('COOKS'); // COOKS, USERS, POOLS, BOOKINGS, SOCIETIES
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsData, cooksData, usersData, bookingsData, poolsData, socList] = await Promise.all([
        adminService.getStats(),
        adminService.getCooks(),
        adminService.getUsers(),
        adminService.getBookings(),
        adminService.getPools(),
        locationService.getSocieties(),
      ]);

      setStats(statsData);
      setCooks(cooksData || []);
      setUsers(usersData || []);
      setBookings(bookingsData || []);
      setPools(poolsData || []);
      setSocieties(socList || []);
    } catch (err) {
      console.error('Failed to load admin portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyCook = async (cookId, isVerified) => {
    try {
      await adminService.verifyCook(cookId, isVerified);
      setActionMessage(`Cook partner verification ${isVerified ? 'approved' : 'revoked'} successfully.`);
      setTimeout(() => setActionMessage(''), 4000);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update cook verification');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = !currentStatus;
    if (!window.confirm(`Are you sure you want to ${nextStatus ? 'reactivate' : 'suspend'} this account?`)) {
      return;
    }
    try {
      await adminService.setUserStatus(userId, nextStatus);
      setActionMessage(`User account has been ${nextStatus ? 'reactivated' : 'suspended'}.`);
      setTimeout(() => setActionMessage(''), 4000);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user account status');
    }
  };

  return (
    <DashboardLayout
      title="Platform Administration"
      subtitle="Cook partner verifications, registered households, neighbourhood pools, and safety standards."
    >
      <div className="space-y-8 font-sans">
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-soft">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Platform KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal/60 uppercase">
                Customer Households
              </span>
              <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-display text-forest">
              {stats?.totalCustomers ?? '...'}
            </p>
            <p className="text-[11px] text-charcoal/60">Registered residential families</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal/60 uppercase">
                Cook Partners
              </span>
              <div className="w-8 h-8 rounded-xl bg-fresh/30 text-forest-dark flex items-center justify-center">
                <ChefHat className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-display text-forest">
              {stats?.totalCooks ?? '...'}{' '}
              <span className="text-xs font-normal text-emerald-700">
                ({stats?.verifiedCooks ?? 0} Verified)
              </span>
            </p>
            <p className="text-[11px] text-charcoal/60">Serving residential societies</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal/60 uppercase">
                Active Cooking Pools
              </span>
              <div className="w-8 h-8 rounded-xl bg-sage text-charcoal flex items-center justify-center">
                <Flame className="w-4 h-4 text-forest" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-display text-charcoal">
              {stats?.activePools ?? '...'}
            </p>
            <p className="text-[11px] text-charcoal/60">Forming & active shared pools</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal/60 uppercase">
                Active Monthly Volume
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-display text-forest">
              {formatCurrency(stats?.monthlyVolume || 0)}
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold">
              {stats?.activeBookings || 0} active subscriptions
            </p>
          </Card>
        </div>

        {/* Administration Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-charcoal/10 pb-3 overflow-x-auto">
          {[
            { id: 'COOKS', label: `Cook Verification (${cooks.length})` },
            { id: 'USERS', label: `User Management (${users.length})` },
            { id: 'POOLS', label: `Cooking Pools (${pools.length})` },
            { id: 'BOOKINGS', label: `All Bookings (${bookings.length})` },
            { id: 'SOCIETIES', label: `Societies (${societies.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-forest text-cream shadow-soft'
                  : 'bg-white text-charcoal/70 hover:bg-sage/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Cook Verification & Governance */}
        {activeTab === 'COOKS' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold font-display text-forest">
                Cook Partner Verification & Review
              </h3>
              <span className="text-xs text-charcoal/60">
                Review identity, hygiene and background clearance
              </span>
            </div>

            <Card className="overflow-hidden p-0" padding="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream border-b border-charcoal/10 uppercase tracking-wider text-charcoal/60 font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Cook Partner</th>
                      <th className="py-3.5 px-4">Experience & Base</th>
                      <th className="py-3.5 px-4">Served Societies</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Verification</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5">
                    {cooks.map((c) => (
                      <tr key={c.id} className="hover:bg-cream/40 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={c.user?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                            alt={c.user?.fullName}
                            className="w-10 h-10 rounded-2xl object-cover border border-charcoal/10"
                          />
                          <div>
                            <p className="font-bold text-forest">{c.user?.fullName}</p>
                            <p className="text-[11px] text-charcoal/50">{c.user?.phone || c.user?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-charcoal">{c.experienceYears} Years</span>
                          <span className="block text-[10px] text-charcoal/60">
                            {formatCurrency(c.basePriceMonthly)}/mo
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {c.societiesServed?.map((s) => (
                              <span
                                key={s.id}
                                className="text-[10px] bg-sage/50 text-forest px-2 py-0.5 rounded-lg"
                              >
                                {s.society?.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-charcoal">{c.rating} ⭐</span>
                          <span className="text-[10px] text-charcoal/50 block">
                            {c.totalReviews} reviews
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {c.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-200">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {c.isVerified ? (
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={() => handleVerifyCook(c.id, false)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Revoke Verification
                            </Button>
                          ) : (
                            <Button
                              size="xs"
                              variant="primary"
                              onClick={() => handleVerifyCook(c.id, true)}
                            >
                              Approve Partner
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: User Accounts & Account Status */}
        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display text-forest">
              Registered Accounts & Safety Governance
            </h3>

            <Card className="overflow-hidden p-0" padding="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream border-b border-charcoal/10 uppercase tracking-wider text-charcoal/60 font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Primary Society</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4 text-right">Governance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-cream/40 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={u.avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=User'}
                            alt={u.fullName}
                            className="w-8 h-8 rounded-full border border-charcoal/10"
                          />
                          <div>
                            <p className="font-bold text-charcoal">{u.fullName}</p>
                            <p className="text-[11px] text-charcoal/50">{u.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              u.role === 'ADMIN'
                                ? 'forest'
                                : u.role === 'COOK'
                                ? 'fresh'
                                : 'default'
                            }
                            size="xs"
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-charcoal/70">
                          {u.householdLocations?.[0]?.society?.name || '—'}
                        </td>
                        <td className="py-3 px-4">
                          {u.isActive ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                              Active
                            </span>
                          ) : (
                            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-charcoal/60">{formatDate(u.createdAt)}</td>
                        <td className="py-3 px-4 text-right">
                          {u.role !== 'ADMIN' && (
                            <Button
                              size="xs"
                              variant={u.isActive ? 'secondary' : 'primary'}
                              onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                              className={u.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : ''}
                            >
                              {u.isActive ? 'Suspend' : 'Reactivate'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: Cooking Pools Monitor */}
        {activeTab === 'POOLS' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display text-forest">
              Neighbourhood Cooking Pools Directory
            </h3>

            <Card className="overflow-hidden p-0" padding="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream border-b border-charcoal/10 uppercase tracking-wider text-charcoal/60 font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Pool Title</th>
                      <th className="py-3.5 px-4">Society</th>
                      <th className="py-3.5 px-4">Meal & Diet</th>
                      <th className="py-3.5 px-4">Households</th>
                      <th className="py-3.5 px-4">Assigned Cook</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5">
                    {pools.map((p) => (
                      <tr key={p.id} className="hover:bg-cream/40 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-forest">{p.title || `${p.mealType} Pool`}</p>
                          <p className="text-[10px] text-charcoal/50">Created by {p.creator?.fullName}</p>
                        </td>
                        <td className="py-3 px-4 text-charcoal/80 font-medium">
                          {p.society?.name}
                        </td>
                        <td className="py-3 px-4 text-charcoal/70">
                          {p.mealType} • {p.dietaryPreference}
                        </td>
                        <td className="py-3 px-4 font-semibold text-charcoal">
                          {p.currentHouseholds} of {p.maxCapacity} Families
                        </td>
                        <td className="py-3 px-4 text-charcoal/80">
                          {p.assignedCook?.user?.fullName || 'Matching in progress'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              p.status === 'CONFIRMED' || p.status === 'ACTIVE'
                                ? 'success'
                                : p.status === 'COOK_PENDING'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="xs"
                          >
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: All Platform Bookings */}
        {activeTab === 'BOOKINGS' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display text-forest">
              All Platform Bookings & Subscriptions
            </h3>

            <Card className="overflow-hidden p-0" padding="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream border-b border-charcoal/10 uppercase tracking-wider text-charcoal/60 font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Resident</th>
                      <th className="py-3.5 px-4">Cook Partner</th>
                      <th className="py-3.5 px-4">Society</th>
                      <th className="py-3.5 px-4">Meal Type</th>
                      <th className="py-3.5 px-4">Monthly Rate</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-cream/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-charcoal">
                          {b.customer?.fullName}
                        </td>
                        <td className="py-3 px-4 text-forest font-semibold">
                          {b.cookProfile?.user?.fullName}
                        </td>
                        <td className="py-3 px-4 text-charcoal/70">
                          {b.society?.name || '—'}
                        </td>
                        <td className="py-3 px-4 text-charcoal/70">{b.mealType}</td>
                        <td className="py-3 px-4 font-bold text-forest">
                          {formatCurrency(b.monthlyRate)}/mo
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              b.status === 'ACTIVE'
                                ? 'success'
                                : b.status === 'PENDING'
                                ? 'warning'
                                : b.status === 'COMPLETED'
                                ? 'forest'
                                : 'default'
                            }
                            size="xs"
                          >
                            {b.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: Societies Directory */}
        {activeTab === 'SOCIETIES' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display text-forest">
              Residential Societies Coverage
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {societies.map((soc) => (
                <Card key={soc.id} className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-forest">{soc.name}</h4>
                    <Badge variant="sage" size="xs">
                      {soc.city}
                    </Badge>
                  </div>
                  <p className="text-xs text-charcoal/60">
                    {soc.locality}, {soc.state} - {soc.postalCode}
                  </p>
                  <div className="pt-2 border-t border-charcoal/5 flex justify-between text-[11px] text-charcoal/70 font-semibold">
                    <span>{soc._count?.cooks || 0} Assigned Cooks</span>
                    <span>{soc._count?.locations || 0} Registered Homes</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
