import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Briefcase, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CustomerReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await api.reviews.getAll();
        setReviews(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy font-heading">
          My Service Reviews
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Ratings and feedback you have submitted for Fixify technicians
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-subtle p-8 text-center text-xs text-text-muted">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-subtle p-12 text-center max-w-md mx-auto">
          <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-primary-navy">No reviews yet</h3>
          <p className="text-xs text-text-muted mt-1">
            Once a home service is marked completed, you can share your feedback and ratings here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-border-subtle p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary-navy">
                    {rev.serviceName}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent-orange text-accent-orange" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-text-main leading-relaxed mt-2 italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
                <span>Technician: <strong className="text-primary-navy">{rev.technicianName}</strong></span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-secondary-blue" />
                  {rev.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
