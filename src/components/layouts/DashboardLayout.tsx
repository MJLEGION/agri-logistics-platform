import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const SIDEBAR_WIDTH = 80;

interface SidebarNav {
  icon: string;
  label: string;
  screen?: string;
  onPress?: () => void;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  sidebarColor?: string;
  accentColor?: string;
  backgroundImage?: any;
  sidebarNav?: SidebarNav[];
  userRole?: 'transporter' | 'shipper' | 'admin';
  navigation?: any;
  contentPadding?: boolean;
}

export default function DashboardLayout({
  children,
  title = 'Dashboard',
  sidebarColor = '#0F172A',
  accentColor = '#3B82F6',
  backgroundImage,
  sidebarNav = [],
  userRole = 'transporter',
  navigation,
  contentPadding = true,
}: DashboardLayoutProps) {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [expandedNav, setExpandedNav] = useState(false);

  const handleNavigation = (nav: SidebarNav) => {
    if (nav.screen && navigation) {
      navigation.navigate(nav.screen);
    } else if (nav.onPress) {
      nav.onPress();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, width: '100%', height: '100%' }]}>
      {/* Sidebar */}
      <View style={[styles.sidebar, { backgroundColor: sidebarColor }]}>
        <TouchableOpacity
          style={styles.sidebarHeader}
          onPress={() => {
            if (navigation?.canGoBack?.()) {
              navigation.goBack();
            } else if (navigation) {
              navigation.navigate('Home');
            }
          }}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../../assets/images/logos/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          {isWeb && (
            <View style={[styles.roleBadge, { backgroundColor: accentColor }]}>
              <Ionicons name={userRole === 'shipper' ? 'cube' : 'car'} size={12} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.sidebarNav}>
          {sidebarNav.map((nav, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.sidebarIconBtn}
              onPress={() => handleNavigation(nav)}
              activeOpacity={0.7}
            >
              <Ionicons name={nav.icon as any} size={28} color="#93C5FD" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sidebarFooter}>
          <ThemeToggle />
          <TouchableOpacity
            style={styles.logoutIcon}
            onPress={() => dispatch(logout())}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ImageBackground
        source={backgroundImage}
        style={[styles.mainContent, { flex: 1, width: width - SIDEBAR_WIDTH }]}
        imageStyle={styles.backgroundImage}
      >
        <View style={[styles.backgroundOverlay, { backgroundColor: theme.background + 'E6' }]} />
        
        <ScrollView 
          style={styles.contentScroll}
          contentContainerStyle={contentPadding ? styles.contentPadding : undefined}
          showsVerticalScrollIndicator={true}
        >
          {children}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '100%',
  },
  sidebarHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 8,
    borderRadius: 16,
    transition: 'all 0.2s ease',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sidebarNav: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 20,
  },
  sidebarIconBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  sidebarFooter: {
    alignItems: 'center',
    gap: 12,
  },
  logoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.35,
    resizeMode: 'cover',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  contentScroll: {
    flex: 1,
    zIndex: 1,
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
