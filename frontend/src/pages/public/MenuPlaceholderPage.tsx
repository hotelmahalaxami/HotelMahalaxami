import React from 'react';
import { Link } from 'react-router-dom';
import { RESTAURANT_CONFIG } from '../../config/restaurantConfig';

interface SampleCategory {
  title: string;
  items: { name: string; price: string; isVeg: boolean; desc: string }[];
}

const sampleMenu: SampleCategory[] = [
  {
    title: 'Authentic Thali Feasts',
    items: [
      { name: 'Special Mahalaxmi Thali', price: '₹350', isVeg: false, desc: 'Mutton masala, chicken sukka, tambda & pandhra rassa, jowar bhakri, and rice.' },
      { name: 'Special Mutton Thali', price: '₹380', isVeg: false, desc: 'Tender mutton curry, bhakri, unlimited authentic rassa, and spiced rice.' },
      { name: 'Special Chicken Thali', price: '₹260', isVeg: false, desc: 'Chicken curry, chicken sukka, rassa, hot bhakri, and rice.' },
      { name: 'Special Veg Thali', price: '₹170', isVeg: true, desc: 'Fresh seasonal veg, dal tadka, jowar bhakri, rice, roasted papad, and thecha.' },
      { name: 'Egg Thali', price: '₹190', isVeg: false, desc: 'Spiced egg curry, boiled eggs, rassa, bhakri, and rice.' },
    ],
  },
  {
    title: 'Chicken Specialties',
    items: [
      { name: 'Chicken Fry', price: '₹200', isVeg: false, desc: 'Pan-fried with Kolhapuri dry roasted spices and onions.' },
      { name: 'Chicken Masala', price: '₹200', isVeg: false, desc: 'Slow-simmered rich red gravy.' },
      { name: 'Butter Chicken', price: '₹240', isVeg: false, desc: 'Mild tomato-butter cream gravy with tender chicken chunks.' },
      { name: 'Chicken Sukka', price: '₹210', isVeg: false, desc: 'Dry roasted chicken with coconut and garlic notes.' },
      { name: 'Chicken Handi (Half / Full)', price: '₹320 / ₹580', isVeg: false, desc: 'Slow pot-cooked traditional Kolhapuri handi.' },
    ],
  },
  {
    title: 'Mutton Specialties',
    items: [
      { name: 'Mutton Masala', price: '₹280', isVeg: false, desc: 'Classic Kolhapuri mutton gravy.' },
      { name: 'Mutton Fry', price: '₹280', isVeg: false, desc: 'Deep-fried spices with tender mutton pieces.' },
      { name: 'Mutton Sukka', price: '₹290', isVeg: false, desc: 'Dry spiced mutton roasted with grated dry coconut.' },
      { name: 'Mutton Handi (Half / Full)', price: '₹420 / ₹780', isVeg: false, desc: 'Clay handi simmered mutton specialty.' },
    ],
  },
  {
    title: 'Vegetarian Specialties',
    items: [
      { name: 'Paneer Masala', price: '₹180', isVeg: true, desc: 'Fresh cottage cheese cubes in spiced onion-tomato gravy.' },
      { name: 'Paneer Butter Masala', price: '₹200', isVeg: true, desc: 'Rich buttery gravy with soft paneer.' },
      { name: 'Kaju Curry', price: '₹200', isVeg: true, desc: 'Whole roasted cashews in royal spiced gravy.' },
      { name: 'Mix Veg', price: '₹160', isVeg: true, desc: 'Garden fresh vegetables cooked home-style.' },
      { name: 'Dal Tadka', price: '₹130', isVeg: true, desc: 'Yellow lentils tempered with cumin, garlic, and ghee.' },
      { name: 'Shev Bhaji', price: '₹150', isVeg: true, desc: 'Crispy spicy shev in hot Kolhapuri red curry.' },
    ],
  },
  {
    title: 'Bhakri, Roti & Rice',
    items: [
      { name: 'Jowar Bhakri', price: '₹25', isVeg: true, desc: 'Freshly hand-patted healthy sorghum bread.' },
      { name: 'Chapati', price: '₹15', isVeg: true, desc: 'Soft whole wheat flatbread.' },
      { name: 'Butter Naan / Tandoori Roti', price: '₹40 / ₹20', isVeg: true, desc: 'Crisp baked tandoor breads.' },
      { name: 'Jeera Rice & Masala Bhat', price: '₹110 / ₹140', isVeg: true, desc: 'Fragrant seasoned rice.' },
      { name: 'Indrayani Rice (Plate)', price: '₹90', isVeg: true, desc: 'Steaming soft aromatic Indrayani rice.' },
    ],
  },
  {
    title: 'Beverages & Extras',
    items: [
      { name: 'Solkadhi', price: '₹40', isVeg: true, desc: 'Pure kokum extract with fresh coconut milk.' },
      { name: 'Masala Taak (Buttermilk)', price: '₹25', isVeg: true, desc: 'Spiced churned yogurt with roasted cumin and coriander.' },
      { name: 'Roasted Papad', price: '₹20', isVeg: true, desc: 'Crisp urad dal roasted papad.' },
    ],
  },
];

const MenuPlaceholderPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest text-terracotta uppercase font-sans">
          Hotel Mahalaxmi Menu &bull; Authentic Kolhapuri
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest-950">
          Our Restaurant Menu
        </h1>
        <p className="text-sm sm:text-base text-pos-muted max-w-2xl mx-auto leading-relaxed">
          Prepared fresh daily. Real ingredients, authentic recipes, and traditional hospitality in Ispurli.
        </p>

        {/* Phase 3 Coming-Soon Notice */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-terracotta-50 border border-terracotta-200 text-xs font-medium text-terracotta-800">
          <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
          <span>Online Ordering &amp; Cart Checkout is being prepared. You can explore our complete menu below!</span>
        </div>
      </div>

      {/* Menu Categories */}
      <div className="space-y-12">
        {sampleMenu.map((category) => (
          <section key={category.title} className="bg-white rounded-2xl border border-pos-border p-6 sm:p-8 shadow-subtle">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest-950 border-b border-pos-border pb-3 mb-6">
              {category.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl border border-pos-border/60 hover:border-forest-200 transition-colors bg-ivory-50/40"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                        title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      />
                      <h3 className="font-serif font-bold text-base text-forest-950">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-xs text-pos-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <span className="font-sans font-bold text-forest-900 text-sm whitespace-nowrap bg-white px-2.5 py-1 rounded-md border border-pos-border shadow-xs">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-forest-900 text-white p-8 rounded-2xl text-center space-y-4">
        <h3 className="font-serif text-2xl font-bold">Visiting {RESTAURANT_CONFIG.name}?</h3>
        <p className="text-sm text-forest-200 max-w-xl mx-auto">
          We welcome you and your family for dine-in meals, or call in advance to have your parcel hot and packed.
        </p>
        <div className="pt-2">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-terracotta text-white font-medium text-sm hover:bg-terracotta-600 transition-colors shadow-sm"
          >
            <span>View Restaurant Location &amp; Contact Desk</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MenuPlaceholderPage;
