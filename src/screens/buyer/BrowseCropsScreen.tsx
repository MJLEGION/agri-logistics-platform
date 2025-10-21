// src/screens/buyer/BrowseCropsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchCrops } from '../../store/slices/cropsSlice';
import { useAppDispatch, useAppSelector } from '../../store';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 50) / 2;

export default function BrowseCropsScreen({ navigation }: any) {
  const { crops, isLoading } = useAppSelector((state) => state.crops);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    dispatch(fetchCrops());
  }, [dispatch]);

  // Get unique categories from crops
  const categories = ['all', ...new Set(crops.map(crop => crop.category || 'other'))];

  const availableCrops = crops.filter(crop => crop.status === 'listed');

  // Filter by search query and category
  const filteredCrops = availableCrops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (crop.category || 'other') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCropEmoji = (cropName: string): string => {
    const name = cropName.toLowerCase();
    const emojiMap: { [key: string]: string } = {
      tomato: '🍅', carrot: '🥕', lettuce: '🥬', broccoli: '🥦', corn: '🌽',
      onion: '🧅', garlic: '🧄', potato: '🥔', pepper: '🌶️', cucumber: '🥒',
      apple: '🍎', banana: '🍌', orange: '🍊', lemon: '🍋', strawberry: '🍓',
      watermelon: '🍉', grape: '🍇', chicken: '🍗', beef: '🥩', pork: '🍖',
      milk: '🥛', cheese: '🧀', wheat: '🌾', rice: '🍚', bean: '🫘',
    };

    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (name.includes(key)) return emoji;
    }
    return '🥦'; // Default to broccoli emoji
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.secondary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.card} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>Fresh Marketplace</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.secondary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.secondary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.card} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>Fresh Marketplace</Text>
        <Ionicons name="cart-outline" size={24} color={theme.card} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search crops..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTag,
              {
                backgroundColor: selectedCategory === category ? theme.secondary : theme.card,
                borderColor: selectedCategory === category ? theme.secondary : theme.border,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === category ? '#fff' : theme.text,
                  fontWeight: selectedCategory === category ? '600' : '500',
                },
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      {filteredCrops.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No crops found</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCrops}
          keyExtractor={(item) => item._id || item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.productCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => navigation.navigate('PlaceOrder', { crop: item })}
              activeOpacity={0.7}
            >
              {/* Product Image/Emoji */}
              <View
                style={[
                  styles.productImageContainer,
                  { backgroundColor: theme.secondary + '10' },
                ]}
              >
                <Text style={styles.productEmoji}>{getCropEmoji(item.name)}</Text>
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
                  {item.name}
                </Text>

                <View style={styles.priceRow}>
                  {item.pricePerUnit && (
                    <Text style={[styles.price, { color: theme.secondary }]}>
                      ₦{item.pricePerUnit}
                    </Text>
                  )}
                  <Text style={[styles.unit, { color: theme.textSecondary }]}>
                    /{item.unit}
                  </Text>
                </View>

                <View style={styles.availabilityRow}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                  <Text
                    style={[styles.availability, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.quantity} {item.unit} available
                  </Text>
                </View>

                {/* Order Button */}
                <TouchableOpacity
                  style={[styles.orderBtn, { backgroundColor: theme.secondary }]}
                  onPress={() => navigation.navigate('PlaceOrder', { crop: item })}
                >
                  <Text style={styles.orderBtnText}>Order</Text>
                  <Ionicons name="arrow-forward" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 24,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // Categories
  categoriesContainer: {
    height: 48,
    maxHeight: 48,
  },
  categoriesContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
  },

  // Grid
  gridContainer: {
    padding: 10,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  // Product Card
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  productImageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  productEmoji: {
    fontSize: 56,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 2,
  },
  unit: {
    fontSize: 12,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  availability: {
    fontSize: 12,
    flex: 1,
  },
  orderBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  orderBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});