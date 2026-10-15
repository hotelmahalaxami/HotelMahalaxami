import React from 'react';
import { Link } from 'react-router-dom';
import { RESTAURANT_CONFIG } from '../../config/restaurantConfig';

const AboutPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest text-terracotta uppercase font-sans">
          Our Heritage &bull; Ispurli, Kolhapur
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest-950">
          The Story of {RESTAURANT_CONFIG.name}
        </h1>
        <p className="text-sm sm:text-base text-pos-muted max-w-2xl mx-auto leading-relaxed">
          Celebrating generations of authentic Kolhapuri culinary wisdom, fresh home-ground spices, and heartfelt hospitality.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-6 text-pos-text/90 leading-relaxed text-sm sm:text-base">
          <div className="bg-white p-8 rounded-2xl border border-pos-border shadow-subtle space-y-5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">
              Rooted in the Soil of Karveer &amp; Ispurli
            </h2>
            <p>
              In the heart of Maharashtra&apos;s culinary heartland, Kolhapur food is celebrated for its boldness, depth, and comforting warmth. <strong>{RESTAURANT_CONFIG.name}</strong> was born out of a passion to preserve and share authentic family recipes in Ispurli.
            </p>
            <p>
              Unlike commercial adaptations that rely heavily on excessive chili powder, true Kolhapuri cooking is an art of balanced aromatics. Our broths, gravies, and marinades rely on slow stone-roasting of dry coconut, onions, dagad phool (stone flower), sesame, and authentic local spices.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-pos-border shadow-subtle space-y-5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">
              The Legend of Tambda &amp; Pandhra Rassa
            </h2>
            <p>
              No feast at Hotel Mahalaxmi is complete without our twin broths. <strong>Tambda Rassa</strong> is a fiery, flavorful red curry stewed with mutton bones, fresh ginger-garlic paste, and traditional Kolhapuri masala.
            </p>
            <p>
              In sublime contrast stands our <strong>Pandhra Rassa</strong>: a soothing, creamy white broth infused with pure coconut milk, white poppy seeds, cinnamon, and mild whole spices. It provides digestive balance and completes the authentic dining ritual.
            </p>
          </div>
        </div>

        {/* Sidebar Info & Values */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-forest-900 text-white p-8 rounded-2xl border border-forest-800 shadow-card space-y-6">
            <h3 className="font-serif text-xl font-bold text-white border-b border-forest-800 pb-3">
              Our Core Commitments
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </span>
                <div>
                  <h4 className="font-semibold text-sm text-terracotta-200">Daily Fresh Meat &amp; Ingredients</h4>
                  <p className="text-xs text-forest-200 mt-0.5">We procure fresh poultry and mutton daily, never using stale preserved cuts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </span>
                <div>
                  <h4 className="font-semibold text-sm text-terracotta-200">Cast-Iron Tawa Bhakris</h4>
                  <p className="text-xs text-forest-200 mt-0.5">Bhakris are patted by hand and roasted hot on demand for every table.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </span>
                <div>
                  <h4 className="font-semibold text-sm text-terracotta-200">Hygienic Family Atmosphere</h4>
                  <p className="text-xs text-forest-200 mt-0.5">Clean tables, separate family seating, and courteous service.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-forest-800">
              <Link
                to="/menu"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-terracotta text-white font-medium text-sm hover:bg-terracotta-600 transition-colors shadow-sm"
              >
                <span>Explore Our Menu</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-pos-border text-center space-y-2">
            <p className="text-xs text-pos-muted">Questions about booking or takeaway?</p>
            <Link to="/contact" className="text-sm font-semibold text-forest-900 hover:text-terracotta transition-colors">
              Contact Restaurant &amp; Get Directions &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
