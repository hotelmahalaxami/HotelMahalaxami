import React from 'react';
import { RESTAURANT_CONFIG } from '../../config/restaurantConfig';

const ContactPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest text-terracotta uppercase font-sans">
          Find &bull; Connect &bull; Visit
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest-950">
          Contact &amp; Location
        </h1>
        <p className="text-sm sm:text-base text-pos-muted max-w-2xl mx-auto leading-relaxed">
          We are located at Ispurli, Taluka Karveer, Kolhapur. Reach out for takeaway orders, group meal reservations, or road directions.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Card 1: Address & Location */}
        <div className="bg-white p-8 rounded-2xl border border-pos-border shadow-subtle flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-900 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-forest-950">
              Restaurant Address
            </h3>
            <p className="text-sm text-pos-text leading-relaxed">
              <strong>{RESTAURANT_CONFIG.name}</strong><br />
              {RESTAURANT_CONFIG.location.landmark}<br />
              {RESTAURANT_CONFIG.location.village}, Taluka {RESTAURANT_CONFIG.location.taluka}<br />
              District {RESTAURANT_CONFIG.location.district}, {RESTAURANT_CONFIG.location.state} — {RESTAURANT_CONFIG.location.pincode}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-pos-border/80">
            <a
              href={RESTAURANT_CONFIG.location.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-terracotta hover:text-terracotta-700 transition-colors"
            >
              <span>Get Directions on Google Maps</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Card 2: Operating Hours */}
        <div className="bg-white p-8 rounded-2xl border border-pos-border shadow-subtle flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-terracotta-50 text-terracotta flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-forest-950">
              Opening Hours
            </h3>
            <div className="space-y-2.5 text-sm text-pos-text">
              <div>
                <p className="font-semibold text-forest-900">Afternoon Service</p>
                <p className="text-pos-muted">{RESTAURANT_CONFIG.timing.lunchHours}</p>
              </div>
              <div>
                <p className="font-semibold text-forest-900">Evening Service</p>
                <p className="text-pos-muted">{RESTAURANT_CONFIG.timing.dinnerHours}</p>
              </div>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  {RESTAURANT_CONFIG.timing.daysOpen}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-pos-border/80 text-xs text-pos-muted">
            Hot thalis and fresh parcel service available throughout all operational hours.
          </div>
        </div>

        {/* Card 3: Direct Inquiries */}
        <div className="bg-white p-8 rounded-2xl border border-pos-border shadow-subtle flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-900 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-forest-950">
              Telephone &amp; Desk
            </h3>
            <div className="space-y-3 text-sm text-pos-text">
              <div>
                <p className="text-xs text-pos-muted">Owner &amp; Restaurant Desk</p>
                <a
                  href={`tel:${RESTAURANT_CONFIG.contact.phonePrimary}`}
                  className="font-bold text-forest-900 text-lg mt-0.5 hover:text-terracotta transition-colors block"
                >
                  {RESTAURANT_CONFIG.contact.phoneDisplay}
                </a>
              </div>
              <div>
                <p className="text-xs text-pos-muted">Email Inquiries</p>
                <p className="text-forest-800 font-medium text-xs mt-0.5">
                  {RESTAURANT_CONFIG.contact.email}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-pos-border/80 text-xs text-pos-muted">
            For urgent family reservations or custom bulk parcel orders, please call the restaurant desk directly.
          </div>
        </div>
      </div>

      {/* Embedded Map / Directions Action Banner */}
      <div className="bg-forest-900 text-white rounded-2xl p-8 sm:p-12 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-serif text-2xl font-bold text-white">
            Traveling on the Radhanagari Road?
          </h3>
          <p className="text-forest-200 text-sm max-w-xl">
            Stop by for authentic Kolhapuri meals, chilled Solkadhi, and warm hospitality. Open Sunday to Friday (Saturday Closed).
          </p>
        </div>
        <a
          href={RESTAURANT_CONFIG.location.googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-terracotta text-white font-medium text-sm shadow-md hover:bg-terracotta-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Start Navigation in Google Maps</span>
        </a>
      </div>
    </div>
  );
};

export default ContactPage;
