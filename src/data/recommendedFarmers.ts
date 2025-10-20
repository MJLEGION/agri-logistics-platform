// src/data/recommendedFarmers.ts

export interface RecommendedFarmer {
  id: string;
  name: string;
  location: string;
  cropTypes: string[];
  rating: number;
  reviews: number;
  yearsExperience: number;
  description: string;
  specialties: string[];
}

export const recommendedFarmers: RecommendedFarmer[] = [
  {
    id: 'farmer_001',
    name: 'Jean-Pierre Ndabaneze',
    location: 'Musanze, Northern Province',
    cropTypes: ['Potatoes', 'Beans', 'Maize'],
    rating: 4.9,
    reviews: 247,
    yearsExperience: 15,
    description: 'Specializes in high-quality root vegetables and grains with organic farming practices.',
    specialties: ['Organic Farming', 'Bulk Orders', 'Seasonal Crops'],
  },
  {
    id: 'farmer_002',
    name: 'Marie Uwase',
    location: 'Ruhengeri, Northern Province',
    cropTypes: ['Tomatoes', 'Lettuce', 'Cabbage'],
    rating: 4.8,
    reviews: 189,
    yearsExperience: 12,
    description: 'Expert in vegetable farming with consistent quality and on-time delivery.',
    specialties: ['Fresh Vegetables', 'Weekly Supply', 'Restaurant Quality'],
  },
  {
    id: 'farmer_003',
    name: 'Bosco Nyarugamba',
    location: 'Kigali City, Central Province',
    cropTypes: ['Bananas', 'Plantains', 'Avocados'],
    rating: 4.7,
    reviews: 156,
    yearsExperience: 18,
    description: 'Premium fruit producer with eco-friendly harvesting methods.',
    specialties: ['Tropical Fruits', 'Export Quality', 'Custom Orders'],
  },
  {
    id: 'farmer_004',
    name: 'Grace Mukamazimpaka',
    location: 'Muhanga, Eastern Province',
    cropTypes: ['Carrots', 'Onions', 'Beets'],
    rating: 4.6,
    reviews: 134,
    yearsExperience: 10,
    description: 'Young progressive farmer with modern farming techniques.',
    specialties: ['Root Vegetables', 'Competitive Pricing', 'Farm Visits'],
  },
  {
    id: 'farmer_005',
    name: 'Patrick Harelimana',
    location: 'Huye, Southern Province',
    cropTypes: ['Peppers', 'Eggplants', 'Cucumbers'],
    rating: 4.9,
    reviews: 203,
    yearsExperience: 14,
    description: 'Acclaimed for consistent delivery and superior produce quality.',
    specialties: ['Hot Peppers', 'Greenhouse Farming', 'Year-round Supply'],
  },
  {
    id: 'farmer_006',
    name: 'Henriette Tuyisenge',
    location: 'Gitarama, Central Province',
    cropTypes: ['Beans', 'Peas', 'Lentils'],
    rating: 4.8,
    reviews: 178,
    yearsExperience: 16,
    description: 'Largest legume supplier in the region with certified quality.',
    specialties: ['Legumes', 'Bulk Quantities', 'Export Standards'],
  },
];

export const howItWorks = [
  {
    step: 1,
    icon: 'people',
    title: 'Create Your Account',
    description: 'Sign up as a Farmer, Buyer, or Transporter in just 2 minutes with basic information.',
    color: '#2ECC71',
  },
  {
    step: 2,
    icon: 'leaf',
    title: 'Browse or List Products',
    description: 'Farmers list their crops with quality details. Buyers browse verified listings with real-time availability.',
    color: '#27AE60',
  },
  {
    step: 3,
    icon: 'handshake',
    title: 'Connect & Negotiate',
    description: 'Direct messaging system allows farmers and buyers to discuss prices and quantities securely.',
    color: '#16A085',
  },
  {
    step: 4,
    icon: 'card',
    title: 'Secure Payment',
    description: 'Mobile money payments, bank transfers, or cash on delivery. All transactions are protected.',
    color: '#2980B9',
  },
  {
    step: 5,
    icon: 'car',
    title: 'Efficient Logistics',
    description: 'Verified transporters pick up and deliver products with real-time GPS tracking.',
    color: '#8E44AD',
  },
  {
    step: 6,
    icon: 'checkmark-done',
    title: 'Delivery & Rating',
    description: 'Products arrive on time. Rate farmers, transporters, and buyers to build trust in the community.',
    color: '#E74C3C',
  },
];