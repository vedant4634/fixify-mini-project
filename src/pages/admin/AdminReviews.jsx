import React, { useState, useEffect } from 'react';
import { Star, Flag, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function AdminReviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      setLoading(true);
      const data = await api.reviews.getAll();
      setReviews(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load reviews.');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleFlag = async (reviewId) => {
    try {
      await api.reviews.flag(reviewId);
      toast.info('Review flag status updated.');
      loadReviews();
    } catch (err) {
      toast.error('Failed to toggle flag.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await api.reviews.delete(reviewToDelete.id);
      toast.success('Inappropriate review removed from platform.');
      setIsDeleteOpen(false);
      setReviewToDelete(null);
      loadReviews();
    } catch (err) {
      toast.error('Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
          Customer Reviews & Moderation
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Monitor feedback, service satisfaction ratings, and flag or remove inappropriate comments
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-subtle p-8 text-center text-xs text-text-muted">
          Loading feedback...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-subtle p-12 text-center text-xs text-text-muted">
          No customer reviews recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-3 ${
                rev.flagged ? 'border-amber-300 bg-amber-50/30' : 'border-border-subtle'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-primary-navy">{rev.serviceName}</h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Customer: <strong>{rev.customerName}</strong> &bull; Pro: <strong>{rev.technicianName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent-orange text-accent-orange" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-text-main mt-3 leading-relaxed italic bg-vanilla/50 p-2.5 rounded-lg border border-border-subtle">
                  "{rev.comment}"
                </p>

                {rev.flagged && (
                  <div className="mt-2 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Flagged for review moderation</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-[11px] text-text-muted">{rev.date}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFlag(rev.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded border flex items-center gap-1 ${
                      rev.flagged
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-vanilla text-text-muted hover:text-primary-navy border-border-subtle'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{rev.flagged ? 'Unflag' : 'Flag'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setReviewToDelete(rev);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                    title="Delete Inappropriate Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Inappropriate Review?"
        message="Are you sure you want to permanently delete this customer review from Fixify?"
        confirmText="Yes, Delete Review"
        danger={true}
      />
    </div>
  );
}
