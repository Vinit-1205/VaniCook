import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService.js';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { formatCurrency, formatDate, formatMealType } from '../../utils/formatters.js';
import {
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Utensils,
  MessageSquare,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getCustomerBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) {
      return;
    }
    try {
      await bookingService.updateBookingStatus(bookingId, 'CANCELLED');
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setIsSubmittingReview(true);

    try {
      await bookingService.createReview({
        bookingId: selectedBooking.id,
        rating: Number(rating),
        comment,
      });
      setReviewModalOpen(false);
      setComment('');
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACTIVE':
        return <Badge variant="forest">Active Subscription</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Awaiting Cook Acceptance</Badge>;
      case 'COMPLETED':
        return <Badge variant="default">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="Kitchen Bookings & Subscriptions"
      subtitle="Track your cooking visits, shared pool savings, and leave verified reviews."
    >
      <div className="space-y-6 font-sans">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-white rounded-3xl animate-pulse border border-[#E7E3D9]" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card className="text-center py-16 space-y-4 bg-white border border-[#E7E3D9] rounded-3xl">
            <div className="w-14 h-14 rounded-full bg-[#F8F5EC] mx-auto flex items-center justify-center text-[#77796F]">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#252923]">
              No active bookings yet
            </h3>
            <p className="text-xs text-[#77796F] max-w-sm mx-auto">
              You haven't booked any cook yet. Explore verified cooks in your society or join a neighbourhood pool.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <Card key={b.id} className="p-6 bg-white border border-[#E7E3D9] rounded-3xl shadow-card" padding="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#E7E3D9]">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        b.cookProfile?.user?.avatarUrl ||
                        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={b.cookProfile?.user?.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#A5BE83] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-lg text-[#252923]">
                          {b.cookProfile?.user?.fullName}
                        </h4>
                        {getStatusBadge(b.status)}
                      </div>
                      <p className="text-xs text-[#77796F] mt-0.5">
                        {formatMealType(b.mealType)} &bull; Started {formatDate(b.startDate)}
                      </p>
                      {b.sharedRatio < 1.0 && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-[#173D2E] bg-[#A5BE83]/20 px-2.5 py-0.5 rounded-full border border-[#A5BE83]/30">
                          <Users className="w-3 h-3" /> Neighbourhood Shared Pool (45% Savings)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-[#77796F] uppercase block font-bold tracking-wider">Monthly Service Charge</span>
                    <span className="text-2xl font-serif font-bold text-[#173D2E]">
                      {formatCurrency(b.monthlyRate)}
                      <span className="text-xs font-normal text-[#77796F] font-sans">/mo</span>
                    </span>
                  </div>
                </div>

                {/* Dietary Requirements & Actions */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-[#252923]/80 space-y-1">
                    <p>
                      <strong>Diet:</strong> {b.requirements?.diet || 'Pure Vegetarian'} &bull;{' '}
                      <strong>Spice Level:</strong> {b.requirements?.spiceLevel || 'Medium'} &bull;{' '}
                      <strong>Household Size:</strong> {b.requirements?.familySize || 2} persons
                    </p>
                    {b.requirements?.specialInstructions && (
                      <p className="text-[#77796F] italic">
                        "{b.requirements.specialInstructions}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-xs"
                      >
                        Cancel Request
                      </Button>
                    )}

                    {(b.status === 'ACTIVE' || b.status === 'COMPLETED') && !b.review && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Star}
                        onClick={() => {
                          setSelectedBooking(b);
                          setReviewModalOpen(true);
                        }}
                        className="text-xs bg-[#A5BE83] text-[#102B21] hover:bg-[#BCD39F]"
                      >
                        Leave a Review
                      </Button>
                    )}

                    {b.review && (
                      <div className="flex items-center gap-1 text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>You rated: {b.review.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Review Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Rate Your Cook Partner"
          subtitle={`Review for ${selectedBooking?.cookProfile?.user?.fullName}`}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#77796F] mb-2">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-[#252923] ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#77796F] mb-1.5">
                Feedback for Neighbours (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience regarding food taste, hygiene, punctuality, and cleanliness..."
                rows={4}
                className="w-full text-xs bg-white border border-[#E7E3D9] rounded-2xl p-3 focus:border-[#173D2E] focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-[#173D2E] text-white hover:bg-[#102B21] rounded-2xl shadow-soft"
              isLoading={isSubmittingReview}
            >
              Submit Verified Review
            </Button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default BookingsList;
