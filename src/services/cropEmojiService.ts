// src/services/cropEmojiService.ts
// Simple emoji mapping for crops

const CROP_EMOJI_MAP: { [key: string]: string } = {
  // Vegetables
  tomato: '🍅',
  tomatoes: '🍅',
  carrot: '🥕',
  carrots: '🥕',
  lettuce: '🥬',
  broccoli: '🥦',
  corn: '🌽',
  maize: '🌽',
  onion: '🧅',
  onions: '🧅',
  garlic: '🧄',
  potato: '🥔',
  potatoes: '🥔',
  pepper: '🫑',
  peppers: '🫑',
  cucumber: '🥒',
  cucumber: '🥒',
  squash: '🥒',
  eggplant: '🍆',
  pumpkin: '🎃',
  radish: '🥔',
  celery: '🌿',
  spinach: '🥬',
  kale: '🥬',
  cabbage: '🥬',
  artichoke: '🥦',

  // Fruits
  apple: '🍎',
  apples: '🍎',
  banana: '🍌',
  bananas: '🍌',
  orange: '🍊',
  oranges: '🍊',
  lemon: '🍋',
  lemons: '🍋',
  lime: '🍋',
  limes: '🍋',
  strawberry: '🍓',
  strawberries: '🍓',
  blueberry: '🫐',
  blueberries: '🫐',
  watermelon: '🍉',
  grape: '🍇',
  grapes: '🍇',
  peach: '🍑',
  peaches: '🍑',
  pear: '🍐',
  pears: '🍐',
  pineapple: '🍍',
  mango: '🥭',
  mangoes: '🥭',
  coconut: '🥥',
  avocado: '🥑',
  avocados: '🥑',
  kiwi: '🥝',
  tangerine: '🍊',
  cherry: '🍒',
  cherries: '🍒',

  // Proteins
  chicken: '🍗',
  beef: '🥩',
  pork: '🥩',
  fish: '🐟',
  shrimp: '🦐',
  egg: '🥚',
  eggs: '🥚',
  tofu: '🟫',

  // Grains & Legumes
  wheat: '🌾',
  rice: '🍚',
  bean: '🫘',
  beans: '🫘',
  lentil: '🫘',
  lentils: '🫘',
  pea: '🫛',
  peas: '🫛',
  corn: '🌽',

  // Dairy
  milk: '🥛',
  cheese: '🧀',
  yogurt: '🍨',
  butter: '🧈',

  // Default
  default: '🥬',
};

export const getCropEmoji = (cropName: string): string => {
  const normalized = cropName.toLowerCase().trim();
  return CROP_EMOJI_MAP[normalized] || CROP_EMOJI_MAP.default;
};