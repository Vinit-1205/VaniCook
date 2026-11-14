import React, { useState, useEffect } from 'react';
import { cookService } from '../../services/cookService.js';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Clock, Plus, Trash2, CheckCircle2, XCircle, Calendar } from 'lucide-react';

const DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const AvailabilityManager = () => {
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New slot form state
  const [newDay, setNewDay] = useState('MONDAY');
  const [newMeal, setNewMeal] = useState('BREAKFAST');
  const [newStartTime, setNewStartTime] = useState('07:00 AM');
  const [newEndTime, setNewEndTime] = useState('09:00 AM');
  const [newMaxSlots, setNewMaxSlots] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const data = await cookService.getMyAvailability();
      setSlots(data || []);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleToggleSlot = async (slot) => {
    try {
      await cookService.updateAvailabilitySlot(slot.id, {
        isBooked: !slot.isBooked,
      });
      fetchSlots();
    } catch (err) {
      alert(err.message || 'Failed to update slot');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this schedule slot?')) return;
    try {
      await cookService.deleteAvailabilitySlot(slotId);
      fetchSlots();
    } catch (err) {
      alert(err.message || 'Failed to delete slot');
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await cookService.addAvailabilitySlot({
        dayOfWeek: newDay,
        mealType: newMeal,
        startTime: newStartTime,
        endTime: newEndTime,
        maxSlots: Number(newMaxSlots),
      });
      setIsAddModalOpen(false);
      fetchSlots();
    } catch (err) {
      alert(err.message || 'Failed to add availability slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Manage Your Kitchen Visiting Schedule"
      subtitle="Define which days and meal slots you can visit households in your residential society."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold font-display text-charcoal">
              Weekly Availability Overview
            </h3>
            <p className="text-xs text-charcoal/60">
              Customers in your society book you based on these confirmed time slots.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Visiting Slot
          </Button>
        </div>

        {/* Days of Week Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAYS.map((day) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === day);

            return (
              <Card key={day} className="p-5 space-y-4" padding="p-5">
                <div className="flex items-center justify-between pb-3 border-b border-charcoal/5">
                  <h4 className="font-bold text-sm font-display text-charcoal">
                    {day}
                  </h4>
                  <Badge variant="sage" size="xs">
                    {daySlots.length} Slots
                  </Badge>
                </div>

                {daySlots.length === 0 ? (
                  <p className="text-xs text-charcoal/40 italic py-4 text-center">
                    No visiting slots scheduled
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {daySlots.map((s) => (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                          s.isBooked
                            ? 'bg-amber-50/60 border-amber-200 text-charcoal'
                            : 'bg-white border-charcoal/10 hover:border-forest/40'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-charcoal">
                              {s.mealType}
                            </span>
                            {s.isBooked ? (
                              <span className="text-[10px] text-amber-700 bg-amber-100 font-semibold px-2 py-0.5 rounded-full">
                                Booked
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 font-semibold px-2 py-0.5 rounded-full">
                                Open
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-charcoal/60 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-forest" />
                            {s.startTime} - {s.endTime}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleSlot(s)}
                            title={s.isBooked ? 'Mark Available' : 'Mark Booked'}
                            className="p-1.5 text-charcoal/50 hover:text-forest rounded-lg hover:bg-sage/40 transition-colors"
                          >
                            {s.isBooked ? (
                              <XCircle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(s.id)}
                            title="Remove Slot"
                            className="p-1.5 text-charcoal/40 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Visiting Time Slot"
        subtitle="Specify day, meal, and hours you visit households in your residential cluster."
      >
        <form onSubmit={handleAddSlot} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-charcoal/70 mb-1">
                Day of Week
              </label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="w-full text-xs bg-white border border-charcoal/15 rounded-xl p-2.5 focus:border-forest"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-charcoal/70 mb-1">
                Meal Category
              </label>
              <select
                value={newMeal}
                onChange={(e) => setNewMeal(e.target.value)}
                className="w-full text-xs bg-white border border-charcoal/15 rounded-xl p-2.5 focus:border-forest"
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
                <option value="ALL_MEALS">All Meals</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-charcoal/70 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                placeholder="07:00 AM"
                className="w-full text-xs bg-white border border-charcoal/15 rounded-xl p-2.5 focus:border-forest"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-charcoal/70 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full text-xs bg-white border border-charcoal/15 rounded-xl p-2.5 focus:border-forest"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-charcoal/70 mb-1">
              Max Families on This Slot
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={newMaxSlots}
              onChange={(e) => setNewMaxSlots(e.target.value)}
              className="w-full text-xs bg-white border border-charcoal/15 rounded-xl p-2.5 focus:border-forest"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            Save Visiting Slot
          </Button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

