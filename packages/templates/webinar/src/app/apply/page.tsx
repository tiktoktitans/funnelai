'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    revenue: '',
    goals: '',
    honeypot: '', // Spam prevention
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit if honeypot is filled (bot detection)
    if (formData.honeypot) {
      setIsSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/forms/application/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mb-4 text-4xl font-bold">Application Received!</h1>
            <p className="text-xl text-gray-600">
              We'll review your application and get back to you within 24-48 hours.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Apply for the Program
            </h1>
            <p className="text-xl text-gray-600">
              Tell us about your business and goals
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-8 shadow-lg">
            {/* Honeypot field (hidden from users) */}
            <input
              type="text"
              name="website"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div>
              <label htmlFor="name" className="mb-2 block font-medium">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                required
                className="w-full rounded-lg border px-4 py-3 focus:border-blue-500 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block font-medium">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full rounded-lg border px-4 py-3 focus:border-blue-500 focus:outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className="w-full rounded-lg border px-4 py-3 focus:border-blue-500 focus:outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="business" className="mb-2 block font-medium">
                Business/Company Name *
              </label>
              <input
                type="text"
                id="business"
                required
                className="w-full rounded-lg border px-4 py-3 focus:border-blue-500 focus:outline-none"
                value={formData.business}
                onChange={(e) => setFormData({ ...formData, business: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="revenue" className="mb-2 block font-medium">
                Current Monthly Revenue
              </label>
              <select
                id="revenue"
                className="w-full rounded-lg border px-4 py-3 focus:border-blue-500 focus:outline-none"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
              >
                <option value="">Select range</option>
                <option value="0-10k">$0 - $10k</option>
                <option value="10k-50k">$10k - $50k</option>
                <option value="50k-100k">$50k - $100k</option>
                <option value="100k+">$100k+</option>
              </select>
            </div>

            <div>
              <label htmlFor="goals" className="mb-2 block font-medium">
                What are your main goals? *
              </label>
              <textarea
                id="goals"
                required
                rows={4}
                className="w-full rounded-lg border px-4 py-3 focus:border-blue-500 focus:outline-none"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Application'
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              By submitting, you agree to our terms and privacy policy.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}