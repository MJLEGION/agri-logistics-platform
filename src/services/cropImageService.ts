// src/services/cropImageService.ts
// High-quality crop images from free sources (Unsplash, Pexels, Pixabay)

export const getCropImage = (cropName: string): string => {
  const name = cropName.toLowerCase().trim();

  // Map crop names to high-quality web images
  const imageMap: { [key: string]: string } = {
    // Vegetables
    tomato: 'https://images.unsplash.com/photo-1592841494021-e37494007a4b?w=400&h=400&fit=crop',
    tomatoes: 'https://images.unsplash.com/photo-1592841494021-e37494007a4b?w=400&h=400&fit=crop',
    potato: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop',
    potatoes: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    carrot: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    carrots: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    lettuce: 'https://images.unsplash.com/photo-1535423032418-bbb3367bae94?w=400&h=400&fit=crop',
    spinach: 'https://images.unsplash.com/photo-1535423032418-bbb3367bae94?w=400&h=400&fit=crop',
    cabbage: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop',
    onion: 'https://images.unsplash.com/photo-1585518419759-db9f0a4f3375?w=400&h=400&fit=crop',
    onions: 'https://images.unsplash.com/photo-1585518419759-db9f0a4f3375?w=400&h=400&fit=crop',
    garlic: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop',
    bell_pepper: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    pepper: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    peppers: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    cucumber: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    cucumbers: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    bean: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
    beans: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
    corn: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    maize: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',

    // Fruits
    apple: 'https://images.unsplash.com/photo-1560806887-1295cbd28588?w=400&h=400&fit=crop',
    apples: 'https://images.unsplash.com/photo-1560806887-1295cbd28588?w=400&h=400&fit=crop',
    banana: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
    bananas: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
    orange: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    oranges: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    mango: 'https://images.unsplash.com/photo-1585864299869-592050bae231?w=400&h=400&fit=crop',
    mangoes: 'https://images.unsplash.com/photo-1585864299869-592050bae231?w=400&h=400&fit=crop',
    pineapple: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    strawberry: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=400&h=400&fit=crop',
    strawberries: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=400&h=400&fit=crop',
    watermelon: 'https://images.unsplash.com/photo-1590080876451-cd6e18f68ca8?w=400&h=400&fit=crop',
    grape: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    grapes: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    papaya: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    guava: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',

    // Proteins/Meat
    chicken: 'https://images.unsplash.com/photo-1635352511207-76c6d9b70994?w=400&h=400&fit=crop',
    beef: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=400&fit=crop',
    fish: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
    pork: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    meat: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=400&fit=crop',
    lamb: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',

    // Grains
    rice: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    wheat: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop',
    barley: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop',
    millet: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop',

    // Dairy & Eggs
    milk: 'https://images.unsplash.com/photo-1550583328-6f71eb2f4ad9?w=400&h=400&fit=crop',
    cheese: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    egg: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop',
    eggs: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop',
    butter: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    yogurt: 'https://images.unsplash.com/photo-1488477181946-6428a0291840?w=400&h=400&fit=crop',

    // Herbs & Spices
    parsley: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    basil: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
    mint: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',

    // Default
    default: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
  };

  // Try exact match first
  if (imageMap[name]) {
    return imageMap[name];
  }

  // Try partial match
  for (const [key, url] of Object.entries(imageMap)) {
    if (name.includes(key) || key.includes(name)) {
      return url;
    }
  }

  // Return default if no match
  return imageMap.default;
};

export const getCropCategory = (cropName: string): string => {
  const name = cropName.toLowerCase().trim();

  if (
    name.includes('tomato') ||
    name.includes('carrot') ||
    name.includes('lettuce') ||
    name.includes('spinach') ||
    name.includes('cabbage') ||
    name.includes('onion') ||
    name.includes('garlic') ||
    name.includes('pepper') ||
    name.includes('cucumber') ||
    name.includes('bean')
  ) {
    return 'Vegetables';
  }

  if (
    name.includes('apple') ||
    name.includes('banana') ||
    name.includes('orange') ||
    name.includes('mango') ||
    name.includes('pineapple') ||
    name.includes('strawberry') ||
    name.includes('watermelon') ||
    name.includes('grape') ||
    name.includes('papaya') ||
    name.includes('guava')
  ) {
    return 'Fruits';
  }

  if (
    name.includes('chicken') ||
    name.includes('beef') ||
    name.includes('fish') ||
    name.includes('pork') ||
    name.includes('meat') ||
    name.includes('lamb')
  ) {
    return 'Proteins';
  }

  if (
    name.includes('rice') ||
    name.includes('wheat') ||
    name.includes('barley') ||
    name.includes('millet') ||
    name.includes('corn') ||
    name.includes('maize')
  ) {
    return 'Grains';
  }

  if (
    name.includes('milk') ||
    name.includes('cheese') ||
    name.includes('egg') ||
    name.includes('butter') ||
    name.includes('yogurt')
  ) {
    return 'Dairy';
  }

  return 'Other';
};