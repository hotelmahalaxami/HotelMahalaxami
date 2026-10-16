/**
 * Hotel Mahalaxmi, Ispurli — Public Restaurant Profile Configuration
 *
 * NOTE: Real-world parameters that have not been provided yet are marked
 * with [Configurable Placeholder]. Update these values once client verification is received.
 */
export interface RestaurantProfile {
  name: string;
  tagline: string;
  subheading: string;
  location: {
    village: string;
    taluka: string;
    district: string;
    state: string;
    pincode: string;
    landmark: string;
    fullAddress: string;
    googleMapsDirectionsUrl: string;
  };
  contact: {
    phonePrimary: string;
    phoneSecondary?: string;
    whatsapp: string;
    email: string;
    phoneDisplay: string;
    isConfigured: boolean;
  };
  timing: {
    lunchHours: string;
    dinnerHours: string;
    daysOpen: string;
    fullWeeklySchedule: { day: string; hours: string }[];
  };
  highlights: {
    badge: string;
    title: string;
    description: string;
  }[];
  verifiedFacilities: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export const RESTAURANT_CONFIG: RestaurantProfile = {
  name: 'Hotel Mahalaxmi',
  tagline: 'Authentic Kolhapuri Heritage & Specialty Thalis',
  subheading:
    'Serving traditional Kolhapuri cuisine with freshly ground home-style masalas, famous Tambda-Pandhra rassa, and special mutton, chicken, and vegetarian thalis in Ispurli.',
  location: {
    village: 'Ispurli',
    taluka: 'Karveer',
    district: 'Kolhapur',
    state: 'Maharashtra',
    pincode: '416001',
    landmark: 'Near ST Stand, Radhanagari Road [Configurable Placeholder]',
    fullAddress:
      'Hotel Mahalaxmi, Radhanagari Road, Ispurli, Taluka Karveer, District Kolhapur, Maharashtra — 416001 [Configurable Placeholder]',
    googleMapsDirectionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Hotel+Mahalaxmi+Ispurli+Kolhapur',
  },
  contact: {
    phonePrimary: '+919665290123',
    whatsapp: '+919665290123',
    email: 'hotelmahalaxmi.ispurli@gmail.com',
    phoneDisplay: '+91 96652 90123',
    isConfigured: true,
  },
  timing: {
    lunchHours: '11:30 AM – 3:45 PM',
    dinnerHours: '7:00 PM – 11:00 PM',
    daysOpen: 'Sunday to Friday (Saturday Closed)',
    fullWeeklySchedule: [
      { day: 'Sunday', hours: '11:30 AM – 3:45 PM, 7:00 PM – 11:00 PM' },
      { day: 'Monday', hours: '11:30 AM – 3:45 PM, 7:00 PM – 11:00 PM' },
      { day: 'Tuesday', hours: '11:30 AM – 3:45 PM, 7:00 PM – 11:00 PM' },
      { day: 'Wednesday', hours: '11:30 AM – 3:45 PM, 7:00 PM – 11:00 PM' },
      { day: 'Thursday', hours: '11:30 AM – 3:45 PM, 7:00 PM – 11:00 PM' },
      { day: 'Friday', hours: '11:30 AM – 3:45 PM, 7:00 PM – 11:00 PM' },
      { day: 'Saturday', hours: 'Closed (Weekly Off)' },
    ],
  },
  highlights: [
    {
      badge: 'Signature Dish',
      title: 'Special Mahalaxmi Thali',
      description:
        'A royal feast celebrating authentic Kolhapuri meat, rich slow-simmered gravies, traditional rassa, and freshly baked jowar bhakri.',
    },
    {
      badge: 'Heritage Flavors',
      title: 'Tambda & Pandhra Rassa',
      description:
        'Prepared using time-tested local recipes and pure aromatic spices. The hallmark of true Kolhapuri culinary hospitality.',
    },
    {
      badge: 'Vegetarian Pride',
      title: 'Special Veg Thali & Pithla Bhakri',
      description:
        'Home-style Maharashtrian vegetarian thali with freshly crushed garlic thecha, jowar bhakri, and comforting local preparations.',
    },
  ],
  verifiedFacilities: [
    {
      icon: 'users',
      title: 'Family Dining Section',
      description: 'Comfortable, clean, and spacious seating arrangements dedicated for families and group meals.',
    },
    {
      icon: 'sparkles',
      title: 'Hygienic Kitchen & Fresh Ingredients',
      description: 'Daily fresh meat and locally sourced farm produce prepared with high standards of food hygiene.',
    },
    {
      icon: 'shopping-bag',
      title: 'Fast Parcel & Takeaway Service',
      description: 'Carefully packaged takeaway boxes preserving freshness and heat for dining at your convenience.',
    },
    {
      icon: 'clock',
      title: 'Counter Pickup with Zero Wait',
      description: 'Explore the menu online and have your parcel packed and waiting upon your arrival.',
    },
  ],
};
